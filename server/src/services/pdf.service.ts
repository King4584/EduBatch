export interface ReceiptData {
  receiptNumber: string;
  studentName: string;
  studentEmail: string;
  batchName: string;
  subject: string;
  amount: number;
  date: string;
  transactionId: string;
  method: string;
  status: string;
  instituteName?: string;
}

export const generateReceiptHtml = (data: ReceiptData): string => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Receipt - ${data.receiptNumber}</title>
    <style>
      body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; margin: 0; padding: 40px; background: #f8fafc; }
      .receipt-container { max-width: 650px; margin: 0 auto; background: #fff; padding: 36px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
      .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 24px; }
      .logo { font-size: 26px; font-weight: 800; color: #4f46e5; letter-spacing: -0.5px; }
      .sub { font-size: 13px; color: #64748b; margin-top: 2px; }
      .badge { display: inline-block; padding: 4px 12px; background: #ecfdf5; color: #059669; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
      .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
      .field label { display: block; font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 600; margin-bottom: 4px; }
      .field p { margin: 0; font-size: 14px; font-weight: 600; color: #0f172a; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 24px; }
      th { text-align: left; padding: 12px; background: #f1f5f9; font-size: 12px; text-transform: uppercase; color: #64748b; }
      td { padding: 14px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
      .total-row td { font-size: 18px; font-weight: 700; color: #0f172a; border-top: 2px solid #e2e8f0; border-bottom: none; }
      .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; }
      @media print {
        body { background: #fff; padding: 0; }
        .receipt-container { border: none; box-shadow: none; }
      }
    </style>
  </head>
  <body>
    <div class="receipt-container">
      <div class="header">
        <div>
          <div class="logo">EduBatch</div>
          <div class="sub">${data.instituteName || 'EduBatch Learning Centre'}</div>
        </div>
        <div style="text-align: right;">
          <span class="badge">Payment Successful</span>
          <div style="font-size: 13px; color: #64748b; margin-top: 6px;">Receipt #${data.receiptNumber}</div>
        </div>
      </div>

      <div class="details-grid">
        <div class="field">
          <label>Billed To</label>
          <p>${data.studentName}</p>
          <div style="font-size: 12px; color: #64748b;">${data.studentEmail}</div>
        </div>
        <div class="field">
          <label>Payment Date</label>
          <p>${data.date}</p>
          <div style="font-size: 12px; color: #64748b;">Method: ${data.method}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Batch / Subject</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Course Tuition Fee</strong><br><span style="font-size: 12px; color: #64748b;">Ref: ${data.transactionId}</span></td>
            <td>${data.batchName}<br><span style="font-size: 12px; color: #64748b;">${data.subject}</span></td>
            <td style="text-align: right; font-weight: 600;">₹${data.amount.toLocaleString('en-IN')}</td>
          </tr>
          <tr class="total-row">
            <td colspan="2">Total Paid</td>
            <td style="text-align: right; color: #16a34a;">₹${data.amount.toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        This is a computer-generated tax receipt. For queries, contact support@edubatch.com.
      </div>
    </div>
  </body>
  </html>
  `;
};
