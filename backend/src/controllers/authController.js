import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

/**
 * Handle new member enrollment/registration
 */
export const register = async (req, res) => {
  const {
    fullName,
    email,
    phone,
    dob,
    department,
    staffId,
    isAutoGenerateId,
    ordinarySavings = 20000,
    specialSavings = 10000,
    investmentAmount = 0,
    password
  } = req.body;

  try {
    // 1. Validations
    if (!fullName || !email || !phone || !dob || !password) {
      return res.status(400).json({ error: 'Missing mandatory registration fields.' });
    }

    // Check duplicate email
    const emailCheck = await query('SELECT id FROM members WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email address already associated with an account.' });
    }

    // 2. Determine Staff/Member ID
    let finalId = staffId;
    if (isAutoGenerateId || !staffId) {
      const year = new Date().getFullYear();
      const randomSuffix = Math.floor(100 + Math.random() * 900); // 100 - 999
      finalId = `ZIM-${year}-${randomSuffix}`;
    } else {
      // Validate requested format
      const idPattern = /^ZIM-\d{4}-\d{3}$/;
      if (!idPattern.test(staffId)) {
        return res.status(400).json({ error: 'Staff ID format must be ZIM-YYYY-XXX (e.g. ZIM-2026-105).' });
      }

      // Check duplicate ID
      const idCheck = await query('SELECT id FROM members WHERE id = $1', [staffId]);
      if (idCheck.rows.length > 0) {
        return res.status(400).json({ error: 'A member with this Staff ID already exists.' });
      }
    }

    // 3. Encrypt password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Database Transaction to insert member & initial balances
    await query('BEGIN');

    // Insert into members
    const insertMemberQuery = `
      INSERT INTO members (id, full_name, email, phone, dob, department, password_hash, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Member')
      RETURNING id, full_name, email, role
    `;
    const memberResult = await query(insertMemberQuery, [
      finalId,
      fullName,
      email,
      phone,
      dob,
      department,
      passwordHash
    ]);

    // Insert starting savings balances matching the slider/custom inputs
    const insertBalancesQuery = `
      INSERT INTO savings_balances (member_id, ordinary_savings, special_savings, investment_pool, outstanding_loans)
      VALUES ($1, $2, $3, $4, 0.00)
    `;
    await query(insertBalancesQuery, [
      finalId,
      ordinarySavings,
      specialSavings,
      investmentAmount
    ]);

    // Insert Audit log
    await query(`
      INSERT INTO audit_logs (member_id, action_type, description)
      VALUES ($1, 'AUTH_REGISTER', $2)
    `, [finalId, `Member self-registered from Portal. Assigned ID: ${finalId}`]);

    await query('COMMIT');

    // 5. Generate token for instant frictionless sign-in
    const token = jwt.sign(
      { id: finalId, email, role: 'Member' },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Cooperative Registry successfully configured.',
      token,
      member: {
        id: finalId,
        fullName: memberResult.rows[0].full_name,
        email: memberResult.rows[0].email,
        role: memberResult.rows[0].role,
        ordinarySavings,
        specialSavings,
        investmentAmount
      }
    });

  } catch (error) {
    await query('ROLLBACK');
    console.error('Registration processing error:', error);
    res.status(500).json({ error: 'Internal system error during registration process.' });
  }
};

/**
 * Handle member / administrator portal login
 */
export const login = async (req, res) => {
  const { credential, password } = req.body; // credential can be email OR Member ID

  try {
    if (!credential || !password) {
      return res.status(400).json({ error: 'Please provide credentials and security password.' });
    }

    // Find member by ID or Email
    const userQuery = `
      SELECT id, full_name, email, role, password_hash, is_active
      FROM members
      WHERE id = $1 OR email = $2
    `;
    const result = await query(userQuery, [credential.trim(), credential.trim()]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid cooperative credentials.' });
    }

    const member = result.rows[0];

    if (!member.is_active) {
      return res.status(403).json({ error: 'This cooperative account is currently deactivated.' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, member.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid cooperative credentials.' });
    }

    // Log login audit
    await query(`
      INSERT INTO audit_logs (member_id, action_type, description)
      VALUES ($1, 'AUTH_LOGIN', 'User logged into portal.')
    `, [member.id]);

    // Sign JWT
    const token = jwt.sign(
      { id: member.id, email: member.email, role: member.role },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Portal authentication handshake successful.',
      token,
      member: {
        id: member.id,
        fullName: member.full_name,
        email: member.email,
        role: member.role
      }
    });

  } catch (error) {
    console.error('Portal sign in error:', error);
    res.status(500).json({ error: 'Internal database communication failure during sign in.' });
  }
};
