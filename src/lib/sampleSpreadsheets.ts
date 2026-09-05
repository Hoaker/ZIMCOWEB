import * as XLSX from 'xlsx';
import { ParsedRawSheet, parseSpreadsheetBuffer } from './deductionNormalizer';

export interface SampleTestFileConfig {
  id: string;
  title: string;
  filename: string;
  badge: string;
  badgeColor: string;
  description: string;
  featuresTested: string[];
  recordsCount: number;
  columnsCount: number;
  data: Array<Record<string, any>>;
  sheets?: Array<{
    sheetName: string;
    titleBanner?: string;
    data: Array<Record<string, any>>;
  }>;
}

export const SAMPLE_TEST_FILES: SampleTestFileConfig[] = [
  {
    id: 'official_bursary_breakdown',
    title: 'Official Multi-Sheet Bursary Deduction Breakdown',
    filename: 'ZIMCO_Official_Bursary_Deduction_Breakdown_2026.xlsx',
    badge: 'Official Multi-Sheet File',
    badgeColor: 'emerald',
    description: 'Exact standard cooperative multi-sheet workbook matching the uploaded image, featuring monthly tabs (Jan 26, Feb 26, Mar 26, Apr 26), title banner, and exact cooperator columns (OrdSav, SpecSav, InvAcc, LoanRem, CommPur, MusComm, SENT).',
    featuresTested: [
      'Multi-Sheet Workbook Tab Ribbon (Jan 26, Feb 26, Mar 26, Apr 26)',
      'Exact Header Detection (OrdSav, SpecSav, InvAcc, LoanRem, CommPur, MusComm, SENT)',
      'Automatic Disparity & Shortfall/Surplus Specification',
      'Next-Month Bursary Return Schedule Auto-Calculation',
      'Instant Passbook Split into Member Accounts'
    ],
    recordsCount: 16,
    columnsCount: 9,
    data: [
      {
        'S/N': 1,
        "COOPERATOR'S FULL NAME": 'ABAS, Sharafat T.',
        'OrdSav': 30000,
        'SpecSav': 10000,
        'InvAcc': 20000,
        'LoanRem': 45000,
        'CommPur': 0,
        'MusComm': 5000,
        'SENT (to Bursary)': 110000
      },
      {
        'S/N': 2,
        "COOPERATOR'S FULL NAME": 'ABATAN, Temitope A.',
        'OrdSav': 25000,
        'SpecSav': 15000,
        'InvAcc': 10000,
        'LoanRem': 30000,
        'CommPur': 12000,
        'MusComm': 0,
        'SENT (to Bursary)': 92000
      },
      {
        'S/N': 3,
        "COOPERATOR'S FULL NAME": 'ABAYOMI-JIMOH, Olanshile I.',
        'OrdSav': 40000,
        'SpecSav': 20000,
        'InvAcc': 50000,
        'LoanRem': 60000,
        'CommPur': 25000,
        'MusComm': 10000,
        'SENT (to Bursary)': 205000
      },
      {
        'S/N': 4,
        "COOPERATOR'S FULL NAME": 'ABDUL-GAFAR, Taofeeq A.',
        'OrdSav': 20000,
        'SpecSav': 10000,
        'InvAcc': 15000,
        'LoanRem': 20000,
        'CommPur': 0,
        'MusComm': 5000,
        'SENT (to Bursary)': 70000
      },
      {
        'S/N': 5,
        "COOPERATOR'S FULL NAME": 'ABDULKAREEM, Rahmat B.',
        'OrdSav': 35000,
        'SpecSav': 15000,
        'InvAcc': 30000,
        'LoanRem': 0,
        'CommPur': 15000,
        'MusComm': 8000,
        'SENT (to Bursary)': 103000
      },
      {
        'S/N': 6,
        "COOPERATOR'S FULL NAME": 'ABDULLAHI, Hawwa T.',
        'OrdSav': 50000,
        'SpecSav': 25000,
        'InvAcc': 40000,
        'LoanRem': 35000,
        'CommPur': 10000,
        'MusComm': 12000,
        'SENT (to Bursary)': 172000
      },
      {
        'S/N': 7,
        "COOPERATOR'S FULL NAME": 'ABDULRAUF, Idris A.',
        'OrdSav': 30000,
        'SpecSav': 10000,
        'InvAcc': 10000,
        'LoanRem': 25000,
        'CommPur': 0,
        'MusComm': 5000,
        'SENT (to Bursary)': 80000
      },
      {
        'S/N': 8,
        "COOPERATOR'S FULL NAME": 'ABIA, Nathan F.',
        'OrdSav': 45000,
        'SpecSav': 20000,
        'InvAcc': 25000,
        'LoanRem': 50000,
        'CommPur': 20000,
        'MusComm': 0,
        'SENT (to Bursary)': 160000
      },
      {
        'S/N': 9,
        "COOPERATOR'S FULL NAME": 'ABIDOGUN, Moruf A.',
        'OrdSav': 25000,
        'SpecSav': 10000,
        'InvAcc': 20000,
        'LoanRem': 15000,
        'CommPur': 8000,
        'MusComm': 5000,
        'SENT (to Bursary)': 83000
      },
      {
        'S/N': 10,
        "COOPERATOR'S FULL NAME": 'ABIOLA, Oluwakemi',
        'OrdSav': 30000,
        'SpecSav': 15000,
        'InvAcc': 15000,
        'LoanRem': 40000,
        'CommPur': 0,
        'MusComm': 0,
        'SENT (to Bursary)': 100000
      },
      {
        'S/N': 11,
        "COOPERATOR'S FULL NAME": 'ABOLAJI, Toyin J.',
        'OrdSav': 35000,
        'SpecSav': 10000,
        'InvAcc': 30000,
        'LoanRem': 0,
        'CommPur': 15000,
        'MusComm': 10000,
        'SENT (to Bursary)': 100000
      },
      {
        'S/N': 12,
        "COOPERATOR'S FULL NAME": 'ABU, Mohammed O.',
        'OrdSav': 20000,
        'SpecSav': 5000,
        'InvAcc': 10000,
        'LoanRem': 20000,
        'CommPur': 0,
        'MusComm': 5000,
        'SENT (to Bursary)': 60000
      },
      {
        'S/N': 13,
        "COOPERATOR'S FULL NAME": 'ABUBAKAR, Ibrahim S.',
        'OrdSav': 60000,
        'SpecSav': 30000,
        'InvAcc': 50000,
        'LoanRem': 70000,
        'CommPur': 30000,
        'MusComm': 15000,
        'SENT (to Bursary)': 255000
      },
      {
        'S/N': 14,
        "COOPERATOR'S FULL NAME": 'ADARAMOLA, Oluwatoyin V.',
        'OrdSav': 25000,
        'SpecSav': 10000,
        'InvAcc': 20000,
        'LoanRem': 25000,
        'CommPur': 10000,
        'MusComm': 0,
        'SENT (to Bursary)': 90000
      },
      {
        'S/N': 15,
        "COOPERATOR'S FULL NAME": 'ADEBANWO, Olufunke D.',
        'OrdSav': 40000,
        'SpecSav': 20000,
        'InvAcc': 30000,
        'LoanRem': 30000,
        'CommPur': 0,
        'MusComm': 0,
        'SENT (to Bursary)': 120000
      },
      {
        'S/N': 16,
        "COOPERATOR'S FULL NAME": 'ADEBOWALE, Noah A.',
        'OrdSav': 50000,
        'SpecSav': 20000,
        'InvAcc': 40000,
        'LoanRem': 45000,
        'CommPur': 20000,
        'MusComm': 10000,
        'SENT (to Bursary)': 185000
      }
    ],
    sheets: [
      {
        sheetName: "Jan '26 (Dr)",
        titleBanner: 'BURSARY DEDUCTION BREAKDOWN (January, 2026)',
        data: [
          { 'S/N': 1, "COOPERATOR'S FULL NAME": 'ABAS, Sharafat T.', 'OrdSav': 30000, 'SpecSav': 10000, 'InvAcc': 20000, 'LoanRem': 45000, 'CommPur': 0, 'MusComm': 5000, 'SENT (to Bursary)': 110000 },
          { 'S/N': 2, "COOPERATOR'S FULL NAME": 'ABATAN, Temitope A.', 'OrdSav': 25000, 'SpecSav': 15000, 'InvAcc': 10000, 'LoanRem': 30000, 'CommPur': 12000, 'MusComm': 0, 'SENT (to Bursary)': 92000 },
          { 'S/N': 3, "COOPERATOR'S FULL NAME": 'ABAYOMI-JIMOH, Olanshile I.', 'OrdSav': 40000, 'SpecSav': 20000, 'InvAcc': 50000, 'LoanRem': 60000, 'CommPur': 25000, 'MusComm': 10000, 'SENT (to Bursary)': 205000 },
          { 'S/N': 4, "COOPERATOR'S FULL NAME": 'ABDUL-GAFAR, Taofeeq A.', 'OrdSav': 20000, 'SpecSav': 10000, 'InvAcc': 15000, 'LoanRem': 20000, 'CommPur': 0, 'MusComm': 5000, 'SENT (to Bursary)': 70000 },
          { 'S/N': 5, "COOPERATOR'S FULL NAME": 'ABDULKAREEM, Rahmat B.', 'OrdSav': 35000, 'SpecSav': 15000, 'InvAcc': 30000, 'LoanRem': 0, 'CommPur': 15000, 'MusComm': 8000, 'SENT (to Bursary)': 103000 },
          { 'S/N': 6, "COOPERATOR'S FULL NAME": 'ABDULLAHI, Hawwa T.', 'OrdSav': 50000, 'SpecSav': 25000, 'InvAcc': 40000, 'LoanRem': 35000, 'CommPur': 10000, 'MusComm': 12000, 'SENT (to Bursary)': 172000 },
          { 'S/N': 7, "COOPERATOR'S FULL NAME": 'ABDULRAUF, Idris A.', 'OrdSav': 30000, 'SpecSav': 10000, 'InvAcc': 10000, 'LoanRem': 25000, 'CommPur': 0, 'MusComm': 5000, 'SENT (to Bursary)': 80000 },
          { 'S/N': 8, "COOPERATOR'S FULL NAME": 'ABIA, Nathan F.', 'OrdSav': 45000, 'SpecSav': 20000, 'InvAcc': 25000, 'LoanRem': 50000, 'CommPur': 20000, 'MusComm': 0, 'SENT (to Bursary)': 160000 },
          { 'S/N': 9, "COOPERATOR'S FULL NAME": 'ABIDOGUN, Moruf A.', 'OrdSav': 25000, 'SpecSav': 10000, 'InvAcc': 20000, 'LoanRem': 15000, 'CommPur': 8000, 'MusComm': 5000, 'SENT (to Bursary)': 83000 },
          { 'S/N': 10, "COOPERATOR'S FULL NAME": 'ABIOLA, Oluwakemi', 'OrdSav': 30000, 'SpecSav': 15000, 'InvAcc': 15000, 'LoanRem': 40000, 'CommPur': 0, 'MusComm': 0, 'SENT (to Bursary)': 100000 },
          { 'S/N': 11, "COOPERATOR'S FULL NAME": 'ABOLAJI, Toyin J.', 'OrdSav': 35000, 'SpecSav': 10000, 'InvAcc': 30000, 'LoanRem': 0, 'CommPur': 15000, 'MusComm': 10000, 'SENT (to Bursary)': 100000 },
          { 'S/N': 12, "COOPERATOR'S FULL NAME": 'ABU, Mohammed O.', 'OrdSav': 20000, 'SpecSav': 5000, 'InvAcc': 10000, 'LoanRem': 20000, 'CommPur': 0, 'MusComm': 5000, 'SENT (to Bursary)': 60000 },
          { 'S/N': 13, "COOPERATOR'S FULL NAME": 'ABUBAKAR, Ibrahim S.', 'OrdSav': 60000, 'SpecSav': 30000, 'InvAcc': 50000, 'LoanRem': 70000, 'CommPur': 30000, 'MusComm': 15000, 'SENT (to Bursary)': 255000 },
          { 'S/N': 14, "COOPERATOR'S FULL NAME": 'ADARAMOLA, Oluwatoyin V.', 'OrdSav': 25000, 'SpecSav': 10000, 'InvAcc': 20000, 'LoanRem': 25000, 'CommPur': 10000, 'MusComm': 0, 'SENT (to Bursary)': 90000 },
          { 'S/N': 15, "COOPERATOR'S FULL NAME": 'ADEBANWO, Olufunke D.', 'OrdSav': 40000, 'SpecSav': 20000, 'InvAcc': 30000, 'LoanRem': 30000, 'CommPur': 0, 'MusComm': 0, 'SENT (to Bursary)': 120000 },
          { 'S/N': 16, "COOPERATOR'S FULL NAME": 'ADEBOWALE, Noah A.', 'OrdSav': 50000, 'SpecSav': 20000, 'InvAcc': 40000, 'LoanRem': 45000, 'CommPur': 20000, 'MusComm': 10000, 'SENT (to Bursary)': 185000 }
        ]
      },
      {
        sheetName: "Feb '26 (Dr)",
        titleBanner: 'BURSARY DEDUCTION BREAKDOWN (February, 2026)',
        data: [
          { 'S/N': 1, "COOPERATOR'S FULL NAME": 'ABAS, Sharafat T.', 'OrdSav': 30000, 'SpecSav': 10000, 'InvAcc': 20000, 'LoanRem': 45000, 'CommPur': 0, 'MusComm': 5000, 'SENT (to Bursary)': 110000 },
          { 'S/N': 2, "COOPERATOR'S FULL NAME": 'ABATAN, Temitope A.', 'OrdSav': 25000, 'SpecSav': 15000, 'InvAcc': 10000, 'LoanRem': 30000, 'CommPur': 12000, 'MusComm': 0, 'SENT (to Bursary)': 92000 },
          { 'S/N': 3, "COOPERATOR'S FULL NAME": 'ABAYOMI-JIMOH, Olanshile I.', 'OrdSav': 40000, 'SpecSav': 20000, 'InvAcc': 50000, 'LoanRem': 60000, 'CommPur': 25000, 'MusComm': 10000, 'SENT (to Bursary)': 205000 },
          { 'S/N': 4, "COOPERATOR'S FULL NAME": 'ABDUL-GAFAR, Taofeeq A.', 'OrdSav': 20000, 'SpecSav': 10000, 'InvAcc': 15000, 'LoanRem': 20000, 'CommPur': 0, 'MusComm': 5000, 'SENT (to Bursary)': 70000 },
          { 'S/N': 5, "COOPERATOR'S FULL NAME": 'ABDULKAREEM, Rahmat B.', 'OrdSav': 35000, 'SpecSav': 15000, 'InvAcc': 30000, 'LoanRem': 0, 'CommPur': 15000, 'MusComm': 8000, 'SENT (to Bursary)': 103000 },
          { 'S/N': 6, "COOPERATOR'S FULL NAME": 'ABDULLAHI, Hawwa T.', 'OrdSav': 50000, 'SpecSav': 25000, 'InvAcc': 40000, 'LoanRem': 35000, 'CommPur': 10000, 'MusComm': 12000, 'SENT (to Bursary)': 172000 },
          { 'S/N': 7, "COOPERATOR'S FULL NAME": 'ABDULRAUF, Idris A.', 'OrdSav': 30000, 'SpecSav': 10000, 'InvAcc': 10000, 'LoanRem': 25000, 'CommPur': 0, 'MusComm': 5000, 'SENT (to Bursary)': 80000 },
          { 'S/N': 8, "COOPERATOR'S FULL NAME": 'ABIA, Nathan F.', 'OrdSav': 45000, 'SpecSav': 20000, 'InvAcc': 25000, 'LoanRem': 50000, 'CommPur': 20000, 'MusComm': 0, 'SENT (to Bursary)': 160000 }
        ]
      },
      {
        sheetName: "Mar '26 (Dr)",
        titleBanner: 'BURSARY DEDUCTION BREAKDOWN (March, 2026)',
        data: [
          { 'S/N': 1, "COOPERATOR'S FULL NAME": 'ABAS, Sharafat T.', 'OrdSav': 30000, 'SpecSav': 10000, 'InvAcc': 20000, 'LoanRem': 45000, 'CommPur': 0, 'MusComm': 5000, 'SENT (to Bursary)': 110000 },
          { 'S/N': 2, "COOPERATOR'S FULL NAME": 'ABATAN, Temitope A.', 'OrdSav': 25000, 'SpecSav': 15000, 'InvAcc': 10000, 'LoanRem': 30000, 'CommPur': 12000, 'MusComm': 0, 'SENT (to Bursary)': 92000 },
          { 'S/N': 3, "COOPERATOR'S FULL NAME": 'ABAYOMI-JIMOH, Olanshile I.', 'OrdSav': 40000, 'SpecSav': 20000, 'InvAcc': 50000, 'LoanRem': 60000, 'CommPur': 25000, 'MusComm': 10000, 'SENT (to Bursary)': 205000 },
          { 'S/N': 4, "COOPERATOR'S FULL NAME": 'ABDUL-GAFAR, Taofeeq A.', 'OrdSav': 20000, 'SpecSav': 10000, 'InvAcc': 15000, 'LoanRem': 20000, 'CommPur': 0, 'MusComm': 5000, 'SENT (to Bursary)': 70000 }
        ]
      },
      {
        sheetName: "Apr '26 (Dr)",
        titleBanner: 'BURSARY DEDUCTION BREAKDOWN (April, 2026)',
        data: [
          { 'S/N': 1, "COOPERATOR'S FULL NAME": 'ABAS, Sharafat T.', 'OrdSav': 30000, 'SpecSav': 10000, 'InvAcc': 20000, 'LoanRem': 45000, 'CommPur': 0, 'MusComm': 5000, 'SENT (to Bursary)': 110000 },
          { 'S/N': 2, "COOPERATOR'S FULL NAME": 'ABATAN, Temitope A.', 'OrdSav': 25000, 'SpecSav': 15000, 'InvAcc': 10000, 'LoanRem': 30000, 'CommPur': 12000, 'MusComm': 0, 'SENT (to Bursary)': 92000 }
        ]
      }
    ]
  },
  {
    id: 'clean_standard',
    title: 'Standard Clean Payroll Sheet',
    filename: 'ZIMCO_Clean_Standard_Payroll.xlsx',
    badge: 'Baseline Clean',
    badgeColor: 'emerald',
    description: 'Clean canonical format with Deduction Date and all 6 individual ZIMCO account destinations (including Muslim Community Account) properly labeled and balanced sums.',
    featuresTested: [
      'Automatic Date & Period Cycle Detection (June 2026)',
      'Perfect 1-to-1 Column Detection',
      'Immediate 100% Math Verification',
      'Instant Ledger Injection'
    ],
    recordsCount: 8,
    columnsCount: 10,
    data: [
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-001',
        'Full Name': 'Dr. Abdulhameed Amao',
        'Ordinary Savings': 50000,
        'Special Savings': 30000,
        'Investment Account': 20000,
        'Loan Disbursement Repayment': 25000,
        'Commodity Purchase': 15000,
        'Muslim Community Account': 10000,
        'Total Deduction': 150000
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-002',
        'Full Name': 'Fatima Yusuf',
        'Ordinary Savings': 40000,
        'Special Savings': 25000,
        'Investment Account': 10000,
        'Loan Disbursement Repayment': 0,
        'Commodity Purchase': 10000,
        'Muslim Community Account': 15000,
        'Total Deduction': 100000
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-003',
        'Full Name': 'Babatunde Raji',
        'Ordinary Savings': 60000,
        'Special Savings': 20000,
        'Investment Account': 35000,
        'Loan Disbursement Repayment': 30000,
        'Commodity Purchase': 0,
        'Muslim Community Account': 10000,
        'Total Deduction': 155000
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-004',
        'Full Name': 'Aisha Bello',
        'Ordinary Savings': 35000,
        'Special Savings': 15000,
        'Investment Account': 15000,
        'Loan Disbursement Repayment': 20000,
        'Commodity Purchase': 12000,
        'Muslim Community Account': 8000,
        'Total Deduction': 105000
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-005',
        'Full Name': 'Emmanuel Chukwu',
        'Ordinary Savings': 45000,
        'Special Savings': 10000,
        'Investment Account': 0,
        'Loan Disbursement Repayment': 15000,
        'Commodity Purchase': 20000,
        'Muslim Community Account': 0,
        'Total Deduction': 90000
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-006',
        'Full Name': 'Maryam Garba',
        'Ordinary Savings': 55000,
        'Special Savings': 40000,
        'Investment Account': 50000,
        'Loan Disbursement Repayment': 0,
        'Commodity Purchase': 0,
        'Muslim Community Account': 20000,
        'Total Deduction': 165000
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-007',
        'Full Name': 'Oladimeji Adeyemi',
        'Ordinary Savings': 30000,
        'Special Savings': 10000,
        'Investment Account': 5000,
        'Loan Disbursement Repayment': 10000,
        'Commodity Purchase': 5000,
        'Muslim Community Account': 5000,
        'Total Deduction': 65000
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-008',
        'Full Name': 'Grace Danjuma',
        'Ordinary Savings': 40000,
        'Special Savings': 20000,
        'Investment Account': 20000,
        'Loan Disbursement Repayment': 25000,
        'Commodity Purchase': 15000,
        'Muslim Community Account': 0,
        'Total Deduction': 120000
      }
    ]
  },
  {
    id: 'extra_non_ledger_columns',
    title: 'Multi-Column Payroll (Extra Non-Ledger Fields)',
    filename: 'ZIMCO_Multi_Column_Extra_Fields.xlsx',
    badge: 'Extra Columns & Aliases',
    badgeColor: 'amber',
    description: 'Raw institution payroll export containing 16 columns including Deduction Date, Department, Grade Level, Bank Name, Tax ID, Muslim Community Savings, and non-standard aliases.',
    featuresTested: [
      'Smart Date & Header Alias Detection',
      'In-Grid Column Deletion (🗑️)',
      'Bulk "Delete All Unneeded Columns"',
      'Pre-Flight Gate Validation'
    ],
    recordsCount: 8,
    columnsCount: 16,
    data: [
      {
        'Payroll Date': '2026-06-25',
        'Staff No': 'ZIM-2026-001',
        'Employee Full Name': 'Dr. Abdulhameed Amao',
        'Department': 'Computer Engineering',
        'Grade Level': 'GL 14',
        'Step': 'Step 06',
        'Salary Bank': 'Zenith Bank Plc',
        'Account Number': '1012948291',
        'Regular Savings': 50000,
        'Target SS': 30000,
        'Shares Capital': 20000,
        'Loan Repay': 25000,
        'Commodity Goods': 15000,
        'Muslim Community Savings': 10000,
        'Tax Deduction Code': 'PAYE-7729',
        'Gross Payroll Deduction': 150000
      },
      {
        'Payroll Date': '2026-06-25',
        'Staff No': 'ZIM-2026-002',
        'Employee Full Name': 'Fatima Yusuf',
        'Department': 'Bursary Operations',
        'Grade Level': 'GL 12',
        'Step': 'Step 04',
        'Salary Bank': 'First Bank of Nigeria',
        'Account Number': '3084920194',
        'Regular Savings': 40000,
        'Target SS': 25000,
        'Shares Capital': 10000,
        'Loan Repay': 0,
        'Commodity Goods': 10000,
        'Muslim Community Savings': 15000,
        'Tax Deduction Code': 'PAYE-8831',
        'Gross Payroll Deduction': 100000
      },
      {
        'Payroll Date': '2026-06-25',
        'Staff No': 'ZIM-2026-003',
        'Employee Full Name': 'Babatunde Raji',
        'Department': 'Physical Sciences',
        'Grade Level': 'GL 15',
        'Step': 'Step 08',
        'Salary Bank': 'GTBank Plc',
        'Account Number': '0129481924',
        'Regular Savings': 60000,
        'Target SS': 20000,
        'Shares Capital': 35000,
        'Loan Repay': 30000,
        'Commodity Goods': 0,
        'Muslim Community Savings': 10000,
        'Tax Deduction Code': 'PAYE-9942',
        'Gross Payroll Deduction': 155000
      },
      {
        'Payroll Date': '2026-06-25',
        'Staff No': 'ZIM-2026-004',
        'Employee Full Name': 'Aisha Bello',
        'Department': 'Academic Planning',
        'Grade Level': 'GL 10',
        'Step': 'Step 02',
        'Salary Bank': 'Access Bank Plc',
        'Account Number': '0693829104',
        'Regular Savings': 35000,
        'Target SS': 15000,
        'Shares Capital': 15000,
        'Loan Repay': 20000,
        'Commodity Goods': 12000,
        'Muslim Community Savings': 8000,
        'Tax Deduction Code': 'PAYE-6621',
        'Gross Payroll Deduction': 105000
      },
      {
        'Payroll Date': '2026-06-25',
        'Staff No': 'ZIM-2026-005',
        'Employee Full Name': 'Emmanuel Chukwu',
        'Department': 'Registry Department',
        'Grade Level': 'GL 13',
        'Step': 'Step 05',
        'Salary Bank': 'UBA Plc',
        'Account Number': '2039481928',
        'Regular Savings': 45000,
        'Target SS': 10000,
        'Shares Capital': 0,
        'Loan Repay': 15000,
        'Commodity Goods': 20000,
        'Muslim Community Savings': 0,
        'Tax Deduction Code': 'PAYE-5510',
        'Gross Payroll Deduction': 90000
      },
      {
        'Payroll Date': '2026-06-25',
        'Staff No': 'ZIM-2026-006',
        'Employee Full Name': 'Maryam Garba',
        'Department': 'Health Services',
        'Grade Level': 'GL 14',
        'Step': 'Step 03',
        'Salary Bank': 'Stanbic IBTC',
        'Account Number': '0029381923',
        'Regular Savings': 55000,
        'Target SS': 40000,
        'Shares Capital': 50000,
        'Loan Repay': 0,
        'Commodity Goods': 0,
        'Muslim Community Savings': 20000,
        'Tax Deduction Code': 'PAYE-4409',
        'Gross Payroll Deduction': 165000
      },
      {
        'Payroll Date': '2026-06-25',
        'Staff No': 'ZIM-2026-007',
        'Employee Full Name': 'Oladimeji Adeyemi',
        'Department': 'Works & Physical Services',
        'Grade Level': 'GL 09',
        'Step': 'Step 01',
        'Salary Bank': 'Fidelity Bank',
        'Account Number': '4019283910',
        'Regular Savings': 30000,
        'Target SS': 10000,
        'Shares Capital': 5000,
        'Loan Repay': 10000,
        'Commodity Goods': 5000,
        'Muslim Community Savings': 5000,
        'Tax Deduction Code': 'PAYE-3398',
        'Gross Payroll Deduction': 65000
      },
      {
        'Payroll Date': '2026-06-25',
        'Staff No': 'ZIM-2026-008',
        'Employee Full Name': 'Grace Danjuma',
        'Department': 'Internal Audit Desk',
        'Grade Level': 'GL 13',
        'Step': 'Step 04',
        'Salary Bank': 'Zenith Bank Plc',
        'Account Number': '2019482716',
        'Regular Savings': 40000,
        'Target SS': 20000,
        'Shares Capital': 20000,
        'Loan Repay': 25000,
        'Commodity Goods': 15000,
        'Muslim Community Savings': 0,
        'Tax Deduction Code': 'PAYE-2287',
        'Gross Payroll Deduction': 120000
      }
    ]
  },
  {
    id: 'unsanitized_strings',
    title: 'Unsanitized Currency & Text Artifacts',
    filename: 'ZIMCO_Unsanitized_Currency_Strings.xlsx',
    badge: 'Dirty Values & Symbols',
    badgeColor: 'blue',
    description: 'Realistic messy sheet with Date, currency symbols (₦, NGN), commas, spaces, text annotations like "(Approved)", and Muslim Community Account values.',
    featuresTested: [
      'Date & Cycle Parsing',
      '"Auto-Sanitize Values" Magic Wand',
      'Currency & Symbol Stripper',
      'In-Cell Interactive Value Cleaner'
    ],
    recordsCount: 8,
    columnsCount: 10,
    data: [
      {
        'Date': '25/06/2026',
        'Member ID': 'ZIM-2026-001',
        'Full Name': 'Dr. Abdulhameed Amao',
        'Ordinary Savings': '₦ 50,000.00',
        'Special Savings': 'NGN 30,000',
        'Investment Account': ' 20,000.00 ',
        'Loan Disbursement Repayment': '₦ 25,000',
        'Commodity Purchase': '15,000 (Approved)',
        'Muslim Community Account': '₦ 10,000.00',
        'Total Deduction': '₦ 150,000.00'
      },
      {
        'Date': '25/06/2026',
        'Member ID': 'ZIM-2026-002',
        'Full Name': 'Fatima Yusuf',
        'Ordinary Savings': '40000',
        'Special Savings': '₦ 25,000',
        'Investment Account': '10,000.00',
        'Loan Disbursement Repayment': '0.00',
        'Commodity Purchase': 'NGN 10,000',
        'Muslim Community Account': ' 15,000.00 ',
        'Total Deduction': '₦ 100,000.00'
      },
      {
        'Date': '25/06/2026',
        'Member ID': 'ZIM-2026-003',
        'Full Name': 'Babatunde Raji',
        'Ordinary Savings': '₦ 60,000.00',
        'Special Savings': '20,000',
        'Investment Account': '₦ 35,000.00',
        'Loan Disbursement Repayment': '30,000 (Deducted)',
        'Commodity Purchase': '0',
        'Muslim Community Account': '₦ 10,000',
        'Total Deduction': '₦ 155,000'
      },
      {
        'Date': '25/06/2026',
        'Member ID': 'ZIM-2026-004',
        'Full Name': 'Aisha Bello',
        'Ordinary Savings': ' 35,000 ',
        'Special Savings': '₦ 15,000.00',
        'Investment Account': 'NGN 15000',
        'Loan Disbursement Repayment': '20,000.00',
        'Commodity Purchase': '12,000',
        'Muslim Community Account': '8,000.00',
        'Total Deduction': '105,000.00'
      },
      {
        'Date': '25/06/2026',
        'Member ID': 'ZIM-2026-005',
        'Full Name': 'Emmanuel Chukwu',
        'Ordinary Savings': '₦ 45,000.00',
        'Special Savings': '10,000.00',
        'Investment Account': '0',
        'Loan Disbursement Repayment': '₦ 15,000',
        'Commodity Purchase': '20,000.00',
        'Muslim Community Account': '0.00',
        'Total Deduction': '₦ 90,000'
      },
      {
        'Date': '25/06/2026',
        'Member ID': 'ZIM-2026-006',
        'Full Name': 'Maryam Garba',
        'Ordinary Savings': '55,000.00',
        'Special Savings': '₦ 40,000.00',
        'Investment Account': '₦ 50,000.00',
        'Loan Disbursement Repayment': '0.00',
        'Commodity Purchase': '0.00',
        'Muslim Community Account': '₦ 20,000.00 (Zakat/MCA)',
        'Total Deduction': '₦ 165,000.00'
      },
      {
        'Date': '25/06/2026',
        'Member ID': 'ZIM-2026-007',
        'Full Name': 'Oladimeji Adeyemi',
        'Ordinary Savings': '₦ 30,000',
        'Special Savings': '10,000',
        'Investment Account': '5,000',
        'Loan Disbursement Repayment': '10,000',
        'Commodity Purchase': '5,000',
        'Muslim Community Account': '5,000',
        'Total Deduction': '65,000'
      },
      {
        'Date': '25/06/2026',
        'Member ID': 'ZIM-2026-008',
        'Full Name': 'Grace Danjuma',
        'Ordinary Savings': '₦ 40,000.00',
        'Special Savings': '₦ 20,000.00',
        'Investment Account': '₦ 20,000.00',
        'Loan Disbursement Repayment': '₦ 25,000.00',
        'Commodity Purchase': '₦ 15,000.00',
        'Muslim Community Account': '₦ 0.00',
        'Total Deduction': '₦ 120,000.00'
      }
    ]
  },
  {
    id: 'split_mismatches',
    title: 'Split Discrepancies & Math Mismatches',
    filename: 'ZIMCO_Split_Discrepancies_Math_Mismatches.xlsx',
    badge: 'Discrepancy Audit',
    badgeColor: 'rose',
    description: 'Intentional discrepancies where the declared total deduction does not match the sum of individual account splits (including Muslim Community Account).',
    featuresTested: [
      'Date & Period Tracking',
      'Live Row Math Discrepancy Alerts',
      'Filter by "Split Mismatches"',
      '"Auto-Balance Splits Sum" Synchronizer',
      'In-Cell Manual Rectification'
    ],
    recordsCount: 8,
    columnsCount: 10,
    data: [
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-001',
        'Full Name': 'Dr. Abdulhameed Amao',
        'Ordinary Savings': 50000,
        'Special Savings': 30000,
        'Investment Account': 20000,
        'Loan Disbursement Repayment': 25000,
        'Commodity Purchase': 15000,
        'Muslim Community Account': 10000,
        'Total Deduction': 170000 // Error: 150k actual sum, 170k declared (+20k mismatch)
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-002',
        'Full Name': 'Fatima Yusuf',
        'Ordinary Savings': 40000,
        'Special Savings': 25000,
        'Investment Account': 10000,
        'Loan Disbursement Repayment': 0,
        'Commodity Purchase': 10000,
        'Muslim Community Account': 15000,
        'Total Deduction': 100000 // Balanced
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-003',
        'Full Name': 'Babatunde Raji',
        'Ordinary Savings': 60000,
        'Special Savings': 20000,
        'Investment Account': 35000,
        'Loan Disbursement Repayment': 30000,
        'Commodity Purchase': 0,
        'Muslim Community Account': 10000,
        'Total Deduction': 140000 // Error: 155k actual sum, 140k declared (-15k mismatch)
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-004',
        'Full Name': 'Aisha Bello',
        'Ordinary Savings': 35000,
        'Special Savings': 15000,
        'Investment Account': 15000,
        'Loan Disbursement Repayment': 20000,
        'Commodity Purchase': 12000,
        'Muslim Community Account': 8000,
        'Total Deduction': 105000 // Balanced
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-005',
        'Full Name': 'Emmanuel Chukwu',
        'Ordinary Savings': 45000,
        'Special Savings': 10000,
        'Investment Account': 0,
        'Loan Disbursement Repayment': 15000,
        'Commodity Purchase': 20000,
        'Muslim Community Account': 0,
        'Total Deduction': 80000 // Error: 90k actual sum, 80k declared (-10k mismatch)
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-006',
        'Full Name': 'Maryam Garba',
        'Ordinary Savings': 55000,
        'Special Savings': 40000,
        'Investment Account': 50000,
        'Loan Disbursement Repayment': 0,
        'Commodity Purchase': 0,
        'Muslim Community Account': 20000,
        'Total Deduction': 165000 // Balanced
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-007',
        'Full Name': 'Oladimeji Adeyemi',
        'Ordinary Savings': 30000,
        'Special Savings': 10000,
        'Investment Account': 5000,
        'Loan Disbursement Repayment': 10000,
        'Commodity Purchase': 5000,
        'Muslim Community Account': 5000,
        'Total Deduction': 80000 // Error: 65k actual sum, 80k declared (+15k mismatch)
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-008',
        'Full Name': 'Grace Danjuma',
        'Ordinary Savings': 40000,
        'Special Savings': 20000,
        'Investment Account': 20000,
        'Loan Disbursement Repayment': 25000,
        'Commodity Purchase': 15000,
        'Muslim Community Account': 0,
        'Total Deduction': 120000 // Balanced
      }
    ]
  },
  {
    id: 'high_volume_varied',
    title: 'High-Volume Comprehensive Roster',
    filename: 'ZIMCO_High_Volume_Varied_Allocations.xlsx',
    badge: '16 Member Roster',
    badgeColor: 'purple',
    description: 'Extended roster covering 16 members with Deduction Dates, diverse borrowing repayments, heavy equity investments, Muslim Community Account contributions, and threshold edge cases.',
    featuresTested: [
      'Deduction Date & Month-Year Processing',
      'High-Volume Batch Processing',
      'Ceiling Limit Threshold Alerts',
      'Comprehensive Multi-Account Splits',
      'Complete Ledger Synchronization'
    ],
    recordsCount: 16,
    columnsCount: 10,
    data: [
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-001',
        'Full Name': 'Dr. Abdulhameed Amao',
        'Ordinary Savings': 50000,
        'Special Savings': 30000,
        'Investment Account': 20000,
        'Loan Disbursement Repayment': 25000,
        'Commodity Purchase': 15000,
        'Muslim Community Account': 10000,
        'Total Deduction': 150000
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-002',
        'Full Name': 'Fatima Yusuf',
        'Ordinary Savings': 40000,
        'Special Savings': 25000,
        'Investment Account': 10000,
        'Loan Disbursement Repayment': 0,
        'Commodity Purchase': 10000,
        'Muslim Community Account': 15000,
        'Total Deduction': 100000
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-003',
        'Full Name': 'Babatunde Raji',
        'Ordinary Savings': 60000,
        'Special Savings': 20000,
        'Investment Account': 35000,
        'Loan Disbursement Repayment': 30000,
        'Commodity Purchase': 0,
        'Muslim Community Account': 10000,
        'Total Deduction': 155000
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-004',
        'Full Name': 'Aisha Bello',
        'Ordinary Savings': 35000,
        'Special Savings': 15000,
        'Investment Account': 15000,
        'Loan Disbursement Repayment': 20000,
        'Commodity Purchase': 12000,
        'Muslim Community Account': 8000,
        'Total Deduction': 105000
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-005',
        'Full Name': 'Emmanuel Chukwu',
        'Ordinary Savings': 45000,
        'Special Savings': 10000,
        'Investment Account': 0,
        'Loan Disbursement Repayment': 15000,
        'Commodity Purchase': 20000,
        'Muslim Community Account': 0,
        'Total Deduction': 90000
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-006',
        'Full Name': 'Maryam Garba',
        'Ordinary Savings': 55000,
        'Special Savings': 40000,
        'Investment Account': 50000,
        'Loan Disbursement Repayment': 0,
        'Commodity Purchase': 0,
        'Muslim Community Account': 20000,
        'Total Deduction': 165000
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-007',
        'Full Name': 'Oladimeji Adeyemi',
        'Ordinary Savings': 30000,
        'Special Savings': 10000,
        'Investment Account': 5000,
        'Loan Disbursement Repayment': 10000,
        'Commodity Purchase': 5000,
        'Muslim Community Account': 5000,
        'Total Deduction': 65000
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-008',
        'Full Name': 'Grace Danjuma',
        'Ordinary Savings': 40000,
        'Special Savings': 20000,
        'Investment Account': 20000,
        'Loan Disbursement Repayment': 25000,
        'Commodity Purchase': 15000,
        'Muslim Community Account': 0,
        'Total Deduction': 120000
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-009',
        'Full Name': 'Ibrahim Musa',
        'Ordinary Savings': 45000,
        'Special Savings': 30000,
        'Investment Account': 15000,
        'Loan Disbursement Repayment': 20000,
        'Commodity Purchase': 10000,
        'Muslim Community Account': 10000,
        'Total Deduction': 130000
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-010',
        'Full Name': 'Chioma Nnamdi',
        'Ordinary Savings': 50000,
        'Special Savings': 25000,
        'Investment Account': 40000,
        'Loan Disbursement Repayment': 0,
        'Commodity Purchase': 25000,
        'Muslim Community Account': 0,
        'Total Deduction': 140000
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-011',
        'Full Name': 'Samuel Adekunle',
        'Ordinary Savings': 65000,
        'Special Savings': 15000,
        'Investment Account': 10000,
        'Loan Disbursement Repayment': 35000,
        'Commodity Purchase': 0,
        'Muslim Community Account': 0,
        'Total Deduction': 125000
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-012',
        'Full Name': 'Zainab Aliyu',
        'Ordinary Savings': 35000,
        'Special Savings': 35000,
        'Investment Account': 25000,
        'Loan Disbursement Repayment': 15000,
        'Commodity Purchase': 10000,
        'Muslim Community Account': 15000,
        'Total Deduction': 135000
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-013',
        'Full Name': 'Kayode Ojo',
        'Ordinary Savings': 40000,
        'Special Savings': 10000,
        'Investment Account': 0,
        'Loan Disbursement Repayment': 20000,
        'Commodity Purchase': 30000,
        'Muslim Community Account': 0,
        'Total Deduction': 100000
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-014',
        'Full Name': 'Ngozi Eze',
        'Ordinary Savings': 50000,
        'Special Savings': 45000,
        'Investment Account': 30000,
        'Loan Disbursement Repayment': 0,
        'Commodity Purchase': 15000,
        'Muslim Community Account': 0,
        'Total Deduction': 140000
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-015',
        'Full Name': 'Tunde Balogun',
        'Ordinary Savings': 70000,
        'Special Savings': 20000,
        'Investment Account': 20000,
        'Loan Disbursement Repayment': 40000,
        'Commodity Purchase': 0,
        'Muslim Community Account': 10000,
        'Total Deduction': 160000
      },
      {
        'Date': '2026-06-25',
        'Member ID': 'ZIM-2026-016',
        'Full Name': 'Halima Sadiq',
        'Ordinary Savings': 45000,
        'Special Savings': 15000,
        'Investment Account': 10000,
        'Loan Disbursement Repayment': 10000,
        'Commodity Purchase': 20000,
        'Muslim Community Account': 10000,
        'Total Deduction': 110000
      }
    ]
  }
];

/**
 * Generates an in-memory binary ArrayBuffer for an Excel (.xlsx) file
 */
export function generateSampleExcelBuffer(config: SampleTestFileConfig): ArrayBuffer {
  const workbook = XLSX.utils.book_new();

  if (config.sheets && config.sheets.length > 0) {
    config.sheets.forEach(sh => {
      let sheetRows: any[][] = [];
      if (sh.titleBanner) {
        sheetRows.push([sh.titleBanner]);
        sheetRows.push([]); // Blank separator row
      }

      if (sh.data && sh.data.length > 0) {
        const headers = Object.keys(sh.data[0]);
        sheetRows.push(headers);
        sh.data.forEach(item => {
          sheetRows.push(headers.map(h => item[h]));
        });
      }

      const worksheet = XLSX.utils.aoa_to_sheet(sheetRows);
      XLSX.utils.book_append_sheet(workbook, worksheet, sh.sheetName);
    });
  } else {
    const worksheet = XLSX.utils.json_to_sheet(config.data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Deductions');
  }

  const binaryString = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
  const buffer = new ArrayBuffer(binaryString.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binaryString.length; i++) {
    view[i] = binaryString.charCodeAt(i) & 0xFF;
  }
  return buffer;
}

/**
 * Triggers a direct browser download of the sample Excel (.xlsx) file
 */
export function downloadSampleExcelFile(config: SampleTestFileConfig): void {
  const buffer = generateSampleExcelBuffer(config);
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = config.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads all 5 sample Excel files in sequence
 */
export function downloadAllSampleExcelFiles(): void {
  SAMPLE_TEST_FILES.forEach((config, idx) => {
    setTimeout(() => {
      downloadSampleExcelFile(config);
    }, idx * 300);
  });
}

/**
 * Converts a sample test file config directly into a ParsedRawSheet for instant in-app workbench loading
 */
export function loadSampleAsParsedSheet(config: SampleTestFileConfig): ParsedRawSheet {
  const buffer = generateSampleExcelBuffer(config);
  return parseSpreadsheetBuffer(buffer, config.filename);
}
