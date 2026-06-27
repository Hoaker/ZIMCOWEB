import { query } from '../config/db.js';

/**
 * Fetch profiles and balance sheets for the currently authenticated member
 */
export const getProfile = async (req, res) => {
  const memberId = req.user.id;

  try {
    const profileQuery = `
      SELECT m.id, m.full_name, m.email, m.phone, m.dob, m.department, m.role,
             b.ordinary_savings, b.special_savings, b.investment_pool, b.outstanding_loans
      FROM members m
      LEFT JOIN savings_balances b ON m.id = b.member_id
      WHERE m.id = $1
    `;
    const result = await query(profileQuery, [memberId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member ledger record not found.' });
    }

    res.json({
      profile: result.rows[0]
    });
  } catch (error) {
    console.error('Fetch profile ledger error:', error);
    res.status(500).json({ error: 'Internal server error pulling balance sheet.' });
  }
};

/**
 * Fetch historic payroll salary deductions recorded for the member
 */
export const getDeductionHistory = async (req, res) => {
  const memberId = req.user.id;

  try {
    const historyQuery = `
      SELECT id, cycle_period, ordinary_savings_allocated, special_savings_allocated, 
             investment_allocated, commodity_purchase_deduction, loan_repayment_deduction, 
             calculated_total, reconciliation_status, created_at
      FROM deduction_records
      WHERE member_id = $1
      ORDER BY created_at DESC
    `;
    const result = await query(historyQuery, [memberId]);

    res.json({
      history: result.rows
    });
  } catch (error) {
    console.error('Deduction log fetch failure:', error);
    res.status(500).json({ error: 'Failed to retrieve payroll deduction schedules.' });
  }
};

/**
 * Fetch list of all registered members (Admin/Audit/Bursary roles only)
 */
export const getMembersList = async (req, res) => {
  try {
    const listQuery = `
      SELECT m.id, m.full_name, m.email, m.phone, m.department, m.role, m.is_active,
             b.ordinary_savings, b.special_savings, b.investment_pool, b.outstanding_loans
      FROM members m
      LEFT JOIN savings_balances b ON m.id = b.member_id
      ORDER BY m.created_at DESC
    `;
    const result = await query(listQuery);

    res.json({
      members: result.rows
    });
  } catch (error) {
    console.error('Fetch members list error:', error);
    res.status(500).json({ error: 'Unauthorized database read of member rosters.' });
  }
};
