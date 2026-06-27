import express from 'express';
import { register, login } from '../controllers/authController.js';
import { getProfile, getDeductionHistory, getMembersList } from '../controllers/memberController.js';
import { getDeductionRecords, uploadDeductionsBatch, updateDeductionCell, deleteDeductionRow } from '../controllers/bursaryController.js';
import { applyLoan, getMemberLoans, getAllLoans, updateLoanStatus } from '../controllers/loanController.js';
import { authenticateUser, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// ==========================================
// 1. PUBLIC AUTHENTICATION PORTALS
// ==========================================
router.post('/auth/register', register);
router.post('/auth/login', login);

// ==========================================
// 2. PROTECTED MEMBER SECURE ROUTES
// ==========================================
router.get('/members/profile', authenticateUser, getProfile);
router.get('/members/deductions', authenticateUser, getDeductionHistory);
router.get('/members/list', authenticateUser, restrictTo('Super Admin', 'Bursary Ingestion Officer', 'Loan Credit Officer', 'Audit Inspector'), getMembersList);

// ==========================================
// 3. LOAN APPLICATIONS PIPELINE
// ==========================================
router.post('/loans/apply', authenticateUser, restrictTo('Member', 'Super Admin'), applyLoan);
router.get('/loans/my', authenticateUser, getMemberLoans);
router.get('/loans/list', authenticateUser, restrictTo('Super Admin', 'Loan Credit Officer'), getAllLoans);
router.put('/loans/:id/decision', authenticateUser, restrictTo('Super Admin', 'Loan Credit Officer'), updateLoanStatus);

// ==========================================
// 4. BURSARY / SALARY DEDUCTIONS LEDGER WORKBOOK
// ==========================================
router.get('/bursary/deductions', authenticateUser, restrictTo('Super Admin', 'Bursary Ingestion Officer', 'Audit Inspector'), getDeductionRecords);
router.post('/bursary/deductions/batch', authenticateUser, restrictTo('Super Admin', 'Bursary Ingestion Officer'), uploadDeductionsBatch);
router.put('/bursary/deductions/:cycle/:memberId', authenticateUser, restrictTo('Super Admin', 'Bursary Ingestion Officer'), updateDeductionCell);
router.delete('/bursary/deductions/:cycle/:memberId', authenticateUser, restrictTo('Super Admin', 'Bursary Ingestion Officer'), deleteDeductionRow);

export default router;
