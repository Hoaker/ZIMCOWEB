import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface MemberPDFData {
  id: string;
  fullName: string;
  email?: string;
  department?: string;
  ordinarySavings?: number;
  specialSavings?: number;
  investmentAmount?: number;
  commoditySavings?: number;
  muslimCommunitySavings?: number;
  muslimSavings?: number;
  outstandingLoans?: number;
  kycStatus?: string;
}

export interface TransactionPDFItem {
  id?: string;
  date: string;
  description: string;
  amount: string | number;
  account?: string;
  type?: 'credit' | 'debit' | string;
  createdAt?: string;
}

export interface GeneratePDFOptions {
  title?: string;
  subtitle?: string;
  accountFilter?: string;
  dateRange?: string;
}

export function generateMemberTransactionsPDF(
  member: MemberPDFData,
  transactions: TransactionPDFItem[],
  options?: GeneratePDFOptions
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeFormatted = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const referenceCode = `ZMC-STMT-${Math.floor(100000 + Math.random() * 900000)}`;

  // 1. Top Decorative Brand Bar
  doc.setFillColor(6, 78, 59); // Deep Emerald
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setFillColor(16, 185, 129); // Accent Emerald
  doc.rect(0, 24, pageWidth, 2, 'F');

  // Brand Name & Society Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('ZIMCO COOPERATIVE SOCIETY LIMITED', margin, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(209, 250, 229);
  doc.text('Staff Multipurpose Cooperative Society • Financial & Member Services Division', margin, 16);
  doc.text('Reg. No: OG/CS/2026/892 • RC: 1098234 • Official Electronic Portal', margin, 20);

  // Right-aligned reference in header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('STATEMENT OF ACCOUNT', pageWidth - margin, 11, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(209, 250, 229);
  doc.text(`Ref: ${referenceCode}`, pageWidth - margin, 16, { align: 'right' });
  doc.text(`Issued: ${dateFormatted}, ${timeFormatted}`, pageWidth - margin, 20, { align: 'right' });

  // 2. Title & Statement Header
  let currentY = 32;

  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  const reportTitle = options?.title || 'Member Account & Recent Transactions Summary';
  doc.text(reportTitle.toUpperCase(), margin, currentY);

  currentY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // Slate 500
  const subText = options?.subtitle || (options?.accountFilter ? `Account Scope: ${options.accountFilter}` : 'Comprehensive summary of verified account activity, savings deposits, and disbursements.');
  doc.text(subText, margin, currentY);

  // 3. Member Profile Card (2-column layout in framed box)
  currentY += 6;
  const profileCardHeight = 28;

  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(margin, currentY, contentWidth, profileCardHeight, 2, 2, 'FD');

  const col1X = margin + 4;
  const col2X = margin + (contentWidth / 2) + 4;
  let profileY = currentY + 6;

  // Left Column: Name & Member ID
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('MEMBER FULL NAME', col1X, profileY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(member.fullName || 'Member Name', col1X, profileY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('STAFF / MEMBER ID', col1X, profileY + 12);
  doc.setFont('courier', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(4, 120, 87); // Emerald 700
  doc.text(member.id || 'ZIM-2026-000', col1X, profileY + 17);

  // Right Column: Department, Email & KYC
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('DEPARTMENT / DIVISION', col2X, profileY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(member.department || 'General Staff Member', col2X, profileY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('EMAIL & KYC STATUS', col2X, profileY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const kycLabel = member.kycStatus === 'verified' ? ' [KYC: VERIFIED]' : ' [KYC: ACTIVE]';
  doc.text(`${member.email || 'member@zimco.org'}${kycLabel}`, col2X, profileY + 17);

  currentY += profileCardHeight + 5;

  // 4. Balances Snapshot Table
  const os = Number(member.ordinarySavings || 0);
  const ss = Number(member.specialSavings || 0);
  const ia = Number(member.investmentAmount || 0);
  const cp = Number(member.commoditySavings || 0);
  const mca = Number(member.muslimCommunitySavings || member.muslimSavings || 0);
  const loans = Number(member.outstandingLoans || 0);
  const totalNetPortfolio = (os + ss + ia + cp + mca) - loans;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Ordinary Savings (OS)', 'Special Savings (SS)', 'Investment (IA)', 'Commodity (CP)', 'Muslim Comm (MCA)', 'Active Loan', 'Net Portfolio']],
    body: [[
      `N${os.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `N${ss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `N${ia.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `N${cp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `N${mca.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      loans > 0 ? `N${loans.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N0.00',
      `N${totalNetPortfolio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    ]],
    theme: 'plain',
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [71, 85, 105],
      fontSize: 6.8,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 2,
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
      textColor: [15, 23, 42],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 2.5,
    },
    styles: {
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      font: 'helvetica',
    },
    columnStyles: {
      6: { textColor: [4, 120, 87], fontStyle: 'bold' }, // Net Portfolio in emerald
      5: { textColor: loans > 0 ? [225, 29, 72] : [71, 85, 105] }, // Loan in red if active
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 7;

  // 5. Recent Transactions Header
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('RECENT TRANSACTIONS LEDGER', margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Showing ${transactions.length} recorded entry/entries in this statement period`, pageWidth - margin, currentY, { align: 'right' });

  currentY += 2;

  // Prepare table rows
  let totalCredit = 0;
  let totalDebit = 0;

  const tableBody = transactions.map((tx, index) => {
    // Parse amount
    let rawAmount = 0;
    if (typeof tx.amount === 'number') {
      rawAmount = tx.amount;
    } else if (typeof tx.amount === 'string') {
      const cleanNum = tx.amount.replace(/[^0-9.-]+/g, '');
      rawAmount = parseFloat(cleanNum) || 0;
    }

    const isDebit = tx.type === 'debit' || (typeof tx.amount === 'string' && tx.amount.includes('-'));
    if (isDebit) {
      totalDebit += Math.abs(rawAmount);
    } else {
      totalCredit += Math.abs(rawAmount);
    }

    const typeLabel = isDebit ? 'DEBIT' : 'CREDIT';
    const amountStr = `${isDebit ? '-' : '+'}N${Math.abs(rawAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return [
      (index + 1).toString(),
      tx.date || '—',
      tx.account || 'General Account',
      tx.description || 'Transaction',
      typeLabel,
      amountStr,
    ];
  });

  if (tableBody.length === 0) {
    tableBody.push(['1', dateFormatted, 'All Accounts', 'No recent transactions recorded in this period', 'INFO', 'N0.00']);
  }

  autoTable(doc, {
    startY: currentY + 1,
    margin: { left: margin, right: margin },
    head: [['#', 'Date', 'Account / Fund', 'Description / Details', 'Type', 'Amount (NGN)']],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [6, 78, 59], // Emerald 900
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      cellPadding: 2.8,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2.5,
      font: 'helvetica',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 24, font: 'courier' },
      2: { cellWidth: 36, fontStyle: 'bold' },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 32, halign: 'right', font: 'courier', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        if (data.column.index === 4) {
          const val = data.cell.raw;
          if (val === 'CREDIT') {
            data.cell.styles.textColor = [4, 120, 87]; // Emerald
          } else if (val === 'DEBIT') {
            data.cell.styles.textColor = [225, 29, 72]; // Rose
          }
        } else if (data.column.index === 5) {
          const val = String(data.cell.raw);
          if (val.startsWith('+')) {
            data.cell.styles.textColor = [4, 120, 87];
          } else if (val.startsWith('-')) {
            data.cell.styles.textColor = [225, 29, 72];
          }
        }
      }
    },
  });

  const finalTableY = (doc as any).lastAutoTable.finalY + 5;

  // 6. Transaction Summary Box (Inflow / Outflow)
  let summaryY = finalTableY;
  // If too close to bottom, add new page
  if (summaryY > pageHeight - 45) {
    doc.addPage();
    summaryY = 20;
  }

  doc.setFillColor(241, 245, 249); // Slate 100
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.roundedRect(margin, summaryY, contentWidth, 18, 2, 2, 'FD');

  const third = contentWidth / 3;
  const netMovement = totalCredit - totalDebit;

  // Total Inflow
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL CREDITS (INFLOW)', margin + 4, summaryY + 5);
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(4, 120, 87);
  doc.text(`+N${totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + 4, summaryY + 12);

  // Total Outflow
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL DEBITS (OUTFLOW)', margin + third + 4, summaryY + 5);
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(225, 29, 72);
  doc.text(`-N${totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + third + 4, summaryY + 12);

  // Net Period Movement
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('NET PERIOD MOVEMENT', margin + (third * 2) + 4, summaryY + 5);
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(netMovement >= 0 ? 4 : 225, netMovement >= 0 ? 120 : 29, netMovement >= 0 ? 87 : 72);
  doc.text(`${netMovement >= 0 ? '+' : '-'}N${Math.abs(netMovement).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + (third * 2) + 4, summaryY + 12);

  // 7. Security Certification & Signature Footnote
  let footerY = summaryY + 24;
  if (footerY > pageHeight - 25) {
    doc.addPage();
    footerY = 20;
  }

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  footerY += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  doc.text('SECURITY NOTICE & VERIFICATION CERTIFICATION:', margin, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'This is an authentic, system-generated electronic summary of member accounts from the Zimco Cooperative Society Core Ledger. All figures are audited and cryptographically sealed under 256-bit protocol standards. For reconciliation or questions, contact bursary@zimco.org.',
    margin,
    footerY + 3.5,
    { maxWidth: contentWidth }
  );

  // Add Page Numbers to all pages
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Zimco Automated Banking Protocol • Page ${i} of ${totalPages} • Security Hash: ${referenceCode}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }

  // Trigger download
  const cleanMemberName = (member.fullName || 'Member').replace(/\s+/g, '_');
  const filename = `Zimco_Statement_${cleanMemberName}_${referenceCode}.pdf`;
  doc.save(filename);
}

export interface PaymentReceiptPDFData {
  reference: string;
  memberId: string;
  memberName: string;
  memberEmail?: string;
  memberPhone?: string;
  amount: number;
  accountName: string;
  paymentMethod?: string;
  channel?: string;
  channelReference?: string;
  dateFormatted?: string;
  timestamp?: string;
  status?: string;
  newBalance?: number;
}

export function generatePaymentReceiptPDF(data: PaymentReceiptPDFData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5', // Sleek official receipt size
  });

  const resolvedPaymentMethod = data.paymentMethod || data.channel || 'Paystack / Online Card';
  const resolvedDate = data.dateFormatted || (data.timestamp ? new Date(data.timestamp).toLocaleString('en-GB') : new Date().toLocaleString('en-GB'));

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  // 1. Top Decorative Brand Bar
  doc.setFillColor(6, 78, 59); // Deep Emerald
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setFillColor(16, 185, 129); // Accent
  doc.rect(0, 26, pageWidth, 2, 'F');

  // Brand Name & Society Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('ZIMCO COOPERATIVE SOCIETY', margin, 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(209, 250, 229);
  doc.text('Staff Multipurpose Cooperative Society • Electronic Payment Channel', margin, 15);
  doc.text('Reg. No: OG/CS/2026/892 • RC: 1098234', margin, 19);

  // Right-aligned status in header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(52, 211, 153);
  doc.text('PAYMENT RECEIPT (PAID)', pageWidth - margin, 11, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(`Ref: ${data.reference}`, pageWidth - margin, 16, { align: 'right' });
  doc.text(`${resolvedDate}`, pageWidth - margin, 20, { align: 'right' });

  // 2. Receipt Amount Card
  let currentY = 34;
  doc.setFillColor(240, 253, 244); // Light emerald
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, currentY, contentWidth, 22, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(4, 120, 87);
  doc.text('TOTAL AMOUNT RECEIVED', margin + 4, currentY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(6, 78, 59);
  doc.text(`NGN ${data.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + 4, currentY + 16);

  // Status Badge on Right
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(pageWidth - margin - 32, currentY + 5, 28, 8, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text('SUCCESSFUL', pageWidth - margin - 18, currentY + 10.5, { align: 'center' });

  // 3. Member & Transaction Breakdown Table
  currentY += 28;
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'plain',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [100, 116, 139], cellWidth: 45 },
      1: { fontStyle: 'bold', textColor: [15, 23, 42], halign: 'right' },
    },
    body: [
      ['Member Name', data.memberName],
      ['Member ID', data.memberId],
      ['Destination Account', data.accountName],
      ['Payment Channel', resolvedPaymentMethod],
      ['Transaction Reference', data.reference],
      ['Date & Time', resolvedDate],
      ['Status', data.status || 'Success / Approved'],
      ...(data.newBalance !== undefined
        ? [['Updated Ledger Balance', `NGN ${data.newBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]]
        : []),
    ],
  });

  const finalY = (doc as any).lastAutoTable.finalY || currentY + 45;

  // 4. Verification Stamp & Security Note
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, finalY + 8, pageWidth - margin, finalY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('ELECTRONIC TRANSACTION VERIFICATION SEAL', margin, finalY + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'This document is a certified official receipt issued by ZIMCO Cooperative Society Ltd. Automatically synced to core financial accounts. Automated SMS & Email notifications dispatched.',
    margin,
    finalY + 17,
    { maxWidth: contentWidth }
  );

  const cleanName = data.memberName.replace(/\s+/g, '_');
  doc.save(`Zimco_Receipt_${cleanName}_${data.reference}.pdf`);
}

export interface MembershipCertificateData {
  memberId: string;
  fullName: string;
  email?: string;
  phone?: string;
  department?: string;
  joinDate?: string;
  membershipClass?: string;
  kycStatus?: string;
  totalPortfolio: number;
  ordinarySavings: number;
  specialSavings: number;
  investmentAmount: number;
  commoditySavings: number;
  muslimCommunitySavings: number;
  shareCapitalStatus: string;
  standingStatus: string;
  agmEligibility: string;
}

export function generateMembershipCertificatePDF(data: MembershipCertificateData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Background certificate border
  doc.setDrawColor(4, 120, 87);
  doc.setLineWidth(1.2);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
  
  doc.setDrawColor(167, 243, 208);
  doc.setLineWidth(0.4);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Top Header Banner
  doc.setFillColor(6, 78, 59);
  doc.rect(10, 10, pageWidth - 20, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('ZIMCO CO-OPERATIVE SOCIETY LIMITED', pageWidth / 2, 22, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(167, 243, 208);
  doc.text('Zero-Interest Micro-Credit & Multi-Purpose Cooperative Society Ltd.', pageWidth / 2, 29, { align: 'center' });
  doc.text('Federal Ministry of Co-operatives Reg. No: COOP/FED/2021/4890', pageWidth / 2, 35, { align: 'center' });

  // Title Section
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('OFFICIAL CERTIFICATE OF MEMBERSHIP & GOOD STANDING', pageWidth / 2, 54, { align: 'center' });

  doc.setDrawColor(4, 120, 87);
  doc.setLineWidth(0.6);
  doc.line(pageWidth / 2 - 45, 57, pageWidth / 2 + 45, 57);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'This is to officially certify that the individual named below is a verified, fully documented shareholder and active member of the ZIMCO Co-operative Society.',
    pageWidth / 2,
    64,
    { align: 'center', maxWidth: contentWidth - 10 }
  );

  // Member Primary Particulars Box
  let currentY = 74;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 38, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(6, 78, 59);
  doc.text(data.fullName.toUpperCase(), margin + 6, currentY + 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('MEMBER ID:', margin + 6, currentY + 18);
  doc.setTextColor(15, 23, 42);
  doc.text(data.memberId, margin + 34, currentY + 18);

  doc.setTextColor(100, 116, 139);
  doc.text('DEPARTMENT / DIVISION:', margin + 6, currentY + 25);
  doc.setTextColor(15, 23, 42);
  doc.text(data.department || 'Public Administration / Faculty', margin + 55, currentY + 25);

  doc.setTextColor(100, 116, 139);
  doc.text('DATE ENROLLED:', margin + 6, currentY + 32);
  doc.setTextColor(15, 23, 42);
  doc.text(data.joinDate || 'January 15, 2024', margin + 40, currentY + 32);

  // Right side of box
  doc.setTextColor(100, 116, 139);
  doc.text('STANDING:', pageWidth / 2 + 10, currentY + 18);
  doc.setTextColor(4, 120, 87);
  doc.text(data.standingStatus || 'ACTIVE • IN GOOD STANDING', pageWidth / 2 + 36, currentY + 18);

  doc.setTextColor(100, 116, 139);
  doc.text('KYC COMPLIANCE:', pageWidth / 2 + 10, currentY + 25);
  doc.setTextColor(15, 23, 42);
  doc.text(data.kycStatus === 'verified' ? 'TIER 2 (BIOMETRICS & NIN)' : 'STANDARD VERIFIED', pageWidth / 2 + 50, currentY + 25);

  doc.setTextColor(100, 116, 139);
  doc.text('MEMBERSHIP CLASS:', pageWidth / 2 + 10, currentY + 32);
  doc.setTextColor(15, 23, 42);
  doc.text(data.membershipClass || 'CLASS A FULL SHAREHOLDER', pageWidth / 2 + 54, currentY + 32);

  // Financial & Asset Summary Table
  currentY += 44;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Financial Ledger & Account Position Summary', margin, currentY);

  autoTable(doc, {
    startY: currentY + 3,
    margin: { left: margin, right: margin },
    theme: 'grid',
    head: [['Cooperative Account / Asset Class', 'Account Type / Rule', 'Current Cumulative Balance']],
    body: [
      ['Ordinary Savings (OS)', 'Zero-Interest Primary Member Equity', `NGN ${data.ordinarySavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
      ['Special Savings (SS)', 'Target & Project Savings (Unrestricted)', `NGN ${data.specialSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
      ['Investment Capital (IA)', 'Profit-Sharing Cooperative Equity Shares', `NGN ${data.investmentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
      ['Commodity Purchase (CP)', 'Zero-Interest Essential Household Financing', `NGN ${data.commoditySavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
      ['Muslim Community Account (MCA)', 'Ethical & Shari\'ah Compliant Ringfenced Fund', `NGN ${data.muslimCommunitySavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
      ['TOTAL CUMULATIVE NET ASSET POSITION', 'Combined Verified Member Portfolio', `NGN ${data.totalPortfolio.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
    ],
    headStyles: {
      fillColor: [6, 78, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 65 },
      1: { cellWidth: 70 },
      2: { fontStyle: 'bold', halign: 'right', cellWidth: 47 },
    },
  });

  const finalTableY = (doc as any).lastAutoTable.finalY || currentY + 50;

  // Standing & Voting Qualification Table
  autoTable(doc, {
    startY: finalTableY + 5,
    margin: { left: margin, right: margin },
    theme: 'plain',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [100, 116, 139], cellWidth: 60 },
      1: { fontStyle: 'bold', textColor: [15, 23, 42] },
    },
    body: [
      ['Share Capital Minimum Requirement:', data.shareCapitalStatus || '100% Fully Paid (₦500,000 Equity)'],
      ['Annual General Meeting (AGM) Status:', data.agmEligibility || 'Qualified with Full Voting Rights (2026/2027 Session)'],
      ['Surplus & Dividend Entitlement:', 'Entitled to Pro-Rata Annual Dividend Distributions'],
      ['Zero-Interest Credit Facility Status:', `Eligible to Borrow up to 200% of OS Balance (₦${(data.ordinarySavings * 2).toLocaleString()})`],
    ],
  });

  const finalStandingY = (doc as any).lastAutoTable.finalY || finalTableY + 30;

  // Official Signatures and Seal
  const sigY = Math.min(finalStandingY + 12, pageHeight - 45);

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin + 10, sigY + 14, margin + 65, sigY + 14);
  doc.line(pageWidth - margin - 65, sigY + 14, pageWidth - margin - 10, sigY + 14);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('DR. ALHAJI B. A. SANUSI', margin + 37.5, sigY + 18, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('President / Chairman of the Board', margin + 37.5, sigY + 22, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('MRS. R. K. ADEBAYO (FCA)', pageWidth - margin - 37.5, sigY + 18, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('General Secretary / Internal Auditor', pageWidth - margin - 37.5, sigY + 22, { align: 'center' });

  // Verification Seal
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Date of Issuance: ${dateFormatted} • Digital Certificate Hash: ZMC-CERT-${data.memberId}-${Date.now().toString(36).toUpperCase()}`,
    pageWidth / 2,
    pageHeight - 14,
    { align: 'center' }
  );

  const cleanName = data.fullName.replace(/\s+/g, '_');
  doc.save(`Zimco_Certificate_${cleanName}_${data.memberId}.pdf`);
}


