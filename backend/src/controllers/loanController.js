import { query } from '../config/db.js';

/**
 * Handle new loan submission
 */
export const applyLoan = async (req, res) => {
  const memberId = req.user.id;
  const { amount, durationMonths, purpose } = req.body;

  try {
    if (!amount || !durationMonths || !purpose) {
      return res.status(400).json({ error: 'Principal amount, duration, and purpose are required.' });
    }

    // 1. Fetch current savings balance to enforce credit eligibility rules
    // Rule: Loan must be within 3x of total savings (Ordinary + Special Savings)
    const balanceQuery = `
      SELECT ordinary_savings, special_savings, outstanding_loans 
      FROM savings_balances 
      WHERE member_id = $1
    `;
    const balanceRes = await query(balanceQuery, [memberId]);
    
    if (balanceRes.rows.length === 0) {
      return res.status(400).json({ error: 'Member profile balance sheet not initialized.' });
    }

    const { ordinary_savings, special_savings, outstanding_loans } = balanceRes.rows[0];
    const totalSavings = Number(ordinary_savings) + Number(special_savings);
    const outstandingDebt = Number(outstanding_loans);
    
    // Credit multiplier eligibility: 3x of savings
    const maxBorrowingLimit = (totalSavings * 3) - outstandingDebt;

    if (Number(amount) > maxBorrowingLimit) {
      return res.status(400).json({
        error: `Ineligible Loan Volume requested. Based on your current cooperative savings (₦${totalSavings.toLocaleString()}), your maximum borrowing margin is ₦${maxBorrowingLimit.toLocaleString()}.`
      });
    }

    // Check for any outstanding pending loans to avoid spam
    const pendingQuery = `
      SELECT id FROM loan_applications 
      WHERE member_id = $1 AND status = 'Pending'
    `;
    const pendingRes = await query(pendingQuery, [memberId]);
    if (pendingRes.rows.length > 0) {
      return res.status(400).json({ error: 'You have a pending loan application undergoing audit review.' });
    }

    // 2. Perform repayment calculations (Standard 6% cooperative amortized flat interest rate)
    const interestRate = 6.00; // Flat 6%
    const totalInterest = Number(amount) * (interestRate / 100);
    const totalRepaymentSum = Number(amount) + totalInterest;
    const monthlyRepayment = totalRepaymentSum / Number(durationMonths);

    // 3. Insert record
    const insertLoanQuery = `
      INSERT INTO loan_applications (
        member_id, amount, duration_months, interest_rate, monthly_repayment, purpose, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'Pending')
      RETURNING *
    `;

    const loanRes = await query(insertLoanQuery, [
      memberId,
      Number(amount),
      Number(durationMonths),
      interestRate,
      monthlyRepayment,
      purpose
    ]);

    // Insert Audit Trail
    await query(`
      INSERT INTO audit_logs (member_id, action_type, description)
      VALUES ($1, 'LOAN_APPLY', $2)
    `, [memberId, `Applied for loan of ₦${Number(amount).toLocaleString()} over ${durationMonths} months.`]);

    res.status(201).json({
      message: 'Loan Application safely queued into Underwriting pool.',
      loan: loanRes.rows[0]
    });

  } catch (error) {
    console.error('Apply loan backend error:', error);
    res.status(500).json({ error: 'Failed to process loan application.' });
  }
};

/**
 * Fetch loan histories for the authenticated member
 */
export const getMemberLoans = async (req, res) => {
  const memberId = req.user.id;

  try {
    const loansQuery = `
      SELECT id, amount, duration_months as "durationMonths", interest_rate as "interestRate",
             monthly_repayment as "monthlyRepayment", purpose, status, review_comments as "comments", created_at
      FROM loan_applications
      WHERE member_id = $1
      ORDER BY created_at DESC
    `;
    const result = await query(loansQuery, [memberId]);
    res.json({ loans: result.rows });
  } catch (error) {
    console.error('Fetch user loans error:', error);
    res.status(500).json({ error: 'Failed to retrieve active loan applications.' });
  }
};

/**
 * Fetch all loan applications (Admin / Credit Officers only)
 */
export const getAllLoans = async (req, res) => {
  try {
    const loansQuery = `
      SELECT l.id, l.amount, l.duration_months as "durationMonths", l.interest_rate as "interestRate",
             l.monthly_repayment as "monthlyRepayment", l.purpose, l.status, l.created_at,
             m.id as "memberId", m.full_name as "memberName", m.department
      FROM loan_applications l
      JOIN members m ON l.member_id = m.id
      ORDER BY l.created_at DESC
    `;
    const result = await query(loansQuery);
    res.json({ loans: result.rows });
  } catch (error) {
    console.error('Fetch all loans error:', error);
    res.status(500).json({ error: 'Database error reading centralized loan registry.' });
  }
};

/**
 * Update Loan application status (Approve / Reject)
 */
export const updateLoanStatus = async (req, res) => {
  const { id } = req.params;
  const { status, comments } = req.body;
  const reviewerId = req.user.id;

  try {
    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Valid decision status (Approved/Rejected) is required.' });
    }

    // 1. Grab Loan Details
    const loanQuery = `SELECT * FROM loan_applications WHERE id = $1`;
    const loanRes = await query(loanQuery, [id]);
    
    if (loanRes.rows.length === 0) {
      return res.status(404).json({ error: 'Loan application not found.' });
    }

    const loan = loanRes.rows[0];

    if (loan.status !== 'Pending') {
      return res.status(400).json({ error: 'Loan application has already been processed.' });
    }

    await query('BEGIN');

    // 2. Update status
    const updateQuery = `
      UPDATE loan_applications
      SET status = $1,
          review_comments = $2,
          reviewed_by = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
    const finalStatus = status === 'Approved' ? 'Active' : 'Rejected';
    await query(updateQuery, [finalStatus, comments, reviewerId, id]);

    // 3. If approved, add principal to member's outstanding loan liability
    if (status === 'Approved') {
      const incrementLiabilityQuery = `
        UPDATE savings_balances
        SET outstanding_loans = outstanding_loans + $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE member_id = $2
      `;
      await query(incrementLiabilityQuery, [Number(loan.amount), loan.member_id]);
    }

    // Insert Audit Trail
    await query(`
      INSERT INTO audit_logs (member_id, action_type, description)
      VALUES ($1, 'LOAN_DECISION', $2)
    `, [reviewerId, `Credit Officer decided: ${finalStatus} for Loan ID ${id} of member ${loan.member_id}`]);

    await query('COMMIT');
    res.json({
      message: `Loan application successfully set to ${finalStatus}.`
    });

  } catch (error) {
    await query('ROLLBACK');
    console.error('Update loan status error:', error);
    res.status(500).json({ error: 'System error reviewing loan application.' });
  }
};
