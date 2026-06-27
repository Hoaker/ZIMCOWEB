import { query } from '../config/db.js';

/**
 * Audit checks on row contents to generate status warnings and errors
 * Matching frontend logic and adding server-side security rules
 */
const evaluateRowDiagnostics = (row, memberInDb, outstandingDebt = 0) => {
  const sum = Number(row.ordinarySavings) + Number(row.specialSavings) + Number(row.investment) + Number(row.commodityPurchase) + Number(row.loanReimbursement);
  
  // Rule 1: Validate Staff ID structure
  const idPattern = /^ZIM-\d{4}-\d{3}$/;
  if (!idPattern.test(row.id)) {
    return { status: 'Error', message: 'CRITICAL: Staff ID pattern unrecognized in society database.' };
  }

  // Rule 2: Member check
  if (!memberInDb) {
    return { status: 'Error', message: `CRITICAL: Staff ID '${row.id}' does not map to any registered member account.` };
  }

  // Rule 3: Allocation Math check
  if (sum !== Number(row.total)) {
    return { 
      status: 'Error', 
      message: `MATH MISMATCH: Itemized sum (₦${sum.toLocaleString()}) differs from aggregate total (₦${Number(row.total).toLocaleString()}).` 
    };
  }

  // Rule 4: Outstanding debt validation
  if (Number(row.loanReimbursement) > outstandingDebt) {
    return { 
      status: 'Error', 
      message: `LIMIT ERROR: Loan repayment of ₦${Number(row.loanReimbursement).toLocaleString()} exceeds member's outstanding balance (₦${outstandingDebt.toLocaleString()}).` 
    };
  }

  // Rule 5: Ordinary savings warning limits (Warning status)
  if (Number(row.ordinarySavings) > 100000) {
    return { 
      status: 'Pending', 
      message: 'WARN: Ordinary Savings exceeds typical high-value monthly cooperative threshold.' 
    };
  }

  // Clear Pass
  return { status: 'Reconciled', message: 'Math allocations and Staff ID cleared.' };
};

/**
 * Retrieve all records for a payroll cycle batch (e.g. "June 2026")
 */
export const getDeductionRecords = async (req, res) => {
  const { cycle } = req.query; // e.g. June 2026

  if (!cycle) {
    return res.status(400).json({ error: 'Payroll cycle period is required.' });
  }

  try {
    const recordsQuery = `
      SELECT r.id, r.cycle_period as "cyclePeriod", r.member_id as "id", m.full_name as "name",
             r.ordinary_savings_allocated as "ordinarySavings",
             r.special_savings_allocated as "specialSavings",
             r.investment_allocated as "investment",
             r.commodity_purchase_deduction as "commodityPurchase",
             r.loan_repayment_deduction as "loanReimbursement",
             r.calculated_total as "total",
             r.reconciliation_status as "status",
             r.error_log as "message"
      FROM deduction_records r
      JOIN members m ON r.member_id = m.id
      WHERE r.cycle_period = $1
      ORDER BY r.created_at ASC
    `;
    const result = await query(recordsQuery, [cycle]);

    res.json({
      cycle,
      records: result.rows
    });
  } catch (error) {
    console.error('Fetch deductions batch error:', error);
    res.status(500).json({ error: 'Database exception fetching payroll batch.' });
  }
};

/**
 * Handle incoming batch Excel files parsed in frontend
 */
export const uploadDeductionsBatch = async (req, res) => {
  const { cycle, rows } = req.body; // rows is array of parsed records
  const uploadedBy = req.user.id;

  if (!cycle || !Array.isSorted || !rows || rows.length === 0) {
    // wait: let's verify if array or empty
  }

  try {
    if (!cycle || !rows) {
      return res.status(400).json({ error: 'Deductions payroll cycle and file records are required.' });
    }

    await query('BEGIN');

    const results = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      // Look up member database record
      const memberQuery = `
        SELECT m.id, m.full_name, b.outstanding_loans
        FROM members m
        LEFT JOIN savings_balances b ON m.id = b.member_id
        WHERE m.id = $1
      `;
      const memberRes = await query(memberQuery, [row.id]);
      const dbMember = memberRes.rows[0];
      const outstandingDebt = dbMember ? Number(dbMember.outstanding_loans) : 0;

      // Run server-side analytics diagnostics rules
      const auditResult = evaluateRowDiagnostics(row, dbMember, outstandingDebt);

      // If the record exists in the db, save it!
      if (dbMember) {
        // UPSERT record for this cycle period
        const upsertQuery = `
          INSERT INTO deduction_records (
            cycle_period, member_id, ordinary_savings_allocated, special_savings_allocated,
            investment_allocated, commodity_purchase_deduction, loan_repayment_deduction,
            reconciliation_status, error_log, uploaded_by
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (cycle_period, member_id) DO UPDATE SET
            ordinary_savings_allocated = EXCLUDED.ordinary_savings_allocated,
            special_savings_allocated = EXCLUDED.special_savings_allocated,
            investment_allocated = EXCLUDED.investment_allocated,
            commodity_purchase_deduction = EXCLUDED.commodity_purchase_deduction,
            loan_repayment_deduction = EXCLUDED.loan_repayment_deduction,
            reconciliation_status = EXCLUDED.reconciliation_status,
            error_log = EXCLUDED.error_log,
            uploaded_by = EXCLUDED.uploaded_by
          RETURNING id
        `;

        await query(upsertQuery, [
          cycle,
          row.id,
          Number(row.ordinarySavings || 0),
          Number(row.specialSavings || 0),
          Number(row.investment || 0),
          Number(row.commodityPurchase || 0),
          Number(row.loanReimbursement || 0),
          auditResult.status,
          auditResult.message,
          uploadedBy
        ]);
      }

      results.push({
        rowNum: i + 1,
        id: row.id,
        name: row.name || (dbMember ? dbMember.full_name : 'UNKNOWN MEMBER'),
        ordinarySavings: Number(row.ordinarySavings || 0),
        specialSavings: Number(row.specialSavings || 0),
        investment: Number(row.investment || 0),
        commodityPurchase: Number(row.commodityPurchase || 0),
        loanReimbursement: Number(row.loanReimbursement || 0),
        total: Number(row.total || 0),
        status: auditResult.status.toLowerCase(),
        message: auditResult.message
      });
    }

    // Insert centralized audit trail
    await query(`
      INSERT INTO audit_logs (member_id, action_type, description)
      VALUES ($1, 'DEDUCTION_UPLOAD', $2)
    `, [uploadedBy, `Ingested payroll deductions file for '${cycle}' containing ${rows.length} records.`]);

    await query('COMMIT');
    res.status(201).json({
      message: `Batch file for ${cycle} ingested into portal storage.`,
      records: results
    });

  } catch (error) {
    await query('ROLLBACK');
    console.error('Batch upload error:', error);
    res.status(500).json({ error: 'Database exception occurred during ledger batch insertion.' });
  }
};

/**
 * Handle manual grid adjustments / editing of specific cells
 */
export const updateDeductionCell = async (req, res) => {
  const { memberId, cycle } = req.params;
  const { ordinarySavings, specialSavings, investment, commodityPurchase, loanReimbursement, total } = req.body;
  const editorId = req.user.id;

  try {
    // 1. Grab DB Member state and balances for warning audit
    const memberQuery = `
      SELECT m.id, m.full_name, b.outstanding_loans
      FROM members m
      LEFT JOIN savings_balances b ON m.id = b.member_id
      WHERE m.id = $1
    `;
    const memberRes = await query(memberQuery, [memberId]);
    const dbMember = memberRes.rows[0];

    if (!dbMember) {
      return res.status(404).json({ error: 'Requested cooperative member record does not exist.' });
    }

    const outstandingDebt = Number(dbMember.outstanding_loans);
    
    // Construct row payload for validation
    const rowPayload = {
      id: memberId,
      ordinarySavings,
      specialSavings,
      investment,
      commodityPurchase,
      loanReimbursement,
      total
    };

    const auditResult = evaluateRowDiagnostics(rowPayload, dbMember, outstandingDebt);

    // 2. Perform DB Cell Update
    const updateQuery = `
      UPDATE deduction_records
      SET ordinary_savings_allocated = $1,
          special_savings_allocated = $2,
          investment_allocated = $3,
          commodity_purchase_deduction = $4,
          loan_repayment_deduction = $5,
          reconciliation_status = $6,
          error_log = $7,
          uploaded_by = $8
      WHERE cycle_period = $9 AND member_id = $10
      RETURNING *
    `;

    const updateRes = await query(updateQuery, [
      Number(ordinarySavings || 0),
      Number(specialSavings || 0),
      Number(investment || 0),
      Number(commodityPurchase || 0),
      Number(loanReimbursement || 0),
      auditResult.status,
      auditResult.message,
      editorId,
      cycle,
      memberId
    ]);

    if (updateRes.rows.length === 0) {
      // If it doesn't exist, let's insert it
      const insertQuery = `
        INSERT INTO deduction_records (
          cycle_period, member_id, ordinary_savings_allocated, special_savings_allocated,
          investment_allocated, commodity_purchase_deduction, loan_repayment_deduction,
          reconciliation_status, error_log, uploaded_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      await query(insertQuery, [
        cycle,
        memberId,
        Number(ordinarySavings || 0),
        Number(specialSavings || 0),
        Number(investment || 0),
        Number(commodityPurchase || 0),
        Number(loanReimbursement || 0),
        auditResult.status,
        auditResult.message,
        editorId
      ]);
    }

    // Insert Audit log
    await query(`
      INSERT INTO audit_logs (member_id, action_type, description)
      VALUES ($1, 'DEDUCTION_EDIT', $2)
    `, [editorId, `Manually updated deductions row for member ${memberId} (${dbMember.full_name}) for cycle ${cycle}.`]);

    res.json({
      message: `Cell values revised. Diagnostic validation: ${auditResult.status}`,
      record: {
        id: memberId,
        name: dbMember.full_name,
        ordinarySavings,
        specialSavings,
        investment,
        commodityPurchase,
        loanReimbursement,
        total,
        status: auditResult.status.toLowerCase(),
        message: auditResult.message
      }
    });

  } catch (error) {
    console.error('Cell update error:', error);
    res.status(500).json({ error: 'Server error modifying central ledger worksheet.' });
  }
};

/**
 * Remove record row entirely
 */
export const deleteDeductionRow = async (req, res) => {
  const { memberId, cycle } = req.params;
  const editorId = req.user.id;

  try {
    const deleteQuery = `
      DELETE FROM deduction_records
      WHERE cycle_period = $1 AND member_id = $2
      RETURNING id
    `;
    const deleteRes = await query(deleteQuery, [cycle, memberId]);

    if (deleteRes.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found in the specified cycle period.' });
    }

    await query(`
      INSERT INTO audit_logs (member_id, action_type, description)
      VALUES ($1, 'DEDUCTION_ROW_DELETE', $2)
    `, [editorId, `Deleted payroll deduction row for member ${memberId} in cycle ${cycle}.`]);

    res.json({
      message: 'Row successfully deleted from deductions file.'
    });
  } catch (error) {
    console.error('Delete row error:', error);
    res.status(500).json({ error: 'Database error attempting record extraction.' });
  }
};
