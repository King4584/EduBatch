import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

let transporter: nodemailer.Transporter | null = null;

try {
  if (ENV.SMTP_USER && ENV.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: ENV.SMTP_HOST,
      port: ENV.SMTP_PORT,
      secure: ENV.SMTP_PORT === 465,
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS,
      },
    });
  }
} catch (err) {
  console.warn('[Email] Could not initialize nodemailer transporter:', err);
}

export const sendPaymentReceiptEmail = async (
  recipientEmail: string,
  studentName: string,
  paymentDetails: {
    receiptNumber: string;
    batchName: string;
    amount: number;
    paymentId: string;
    date: string;
    method: string;
  }
): Promise<boolean> => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 20px;">
        <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">EduBatch</h1>
        <p style="color: #64748b; margin: 4px 0 0; font-size: 14px;">Education Batch Management</p>
      </div>
      
      <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 8px;">Payment Receipt Confirmation</h2>
      <p style="color: #475569; font-size: 14px;">Dear <strong>${studentName}</strong>,</p>
      <p style="color: #475569; font-size: 14px;">Thank you for your payment. Your fee for <strong>${paymentDetails.batchName}</strong> has been successfully processed.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; border-radius: 8px;">
        <tr>
          <td style="padding: 10px 16px; color: #64748b; font-size: 13px;">Receipt Number:</td>
          <td style="padding: 10px 16px; color: #0f172a; font-weight: bold; font-size: 13px; text-align: right;">${paymentDetails.receiptNumber}</td>
        </tr>
        <tr>
          <td style="padding: 10px 16px; color: #64748b; font-size: 13px;">Transaction ID:</td>
          <td style="padding: 10px 16px; color: #0f172a; font-family: monospace; font-size: 12px; text-align: right;">${paymentDetails.paymentId}</td>
        </tr>
        <tr>
          <td style="padding: 10px 16px; color: #64748b; font-size: 13px;">Date & Time:</td>
          <td style="padding: 10px 16px; color: #0f172a; font-size: 13px; text-align: right;">${paymentDetails.date}</td>
        </tr>
        <tr>
          <td style="padding: 10px 16px; color: #64748b; font-size: 13px;">Payment Method:</td>
          <td style="padding: 10px 16px; color: #0f172a; font-size: 13px; text-align: right;">${paymentDetails.method}</td>
        </tr>
        <tr style="border-top: 1px solid #cbd5e1;">
          <td style="padding: 12px 16px; color: #0f172a; font-weight: bold; font-size: 15px;">Total Paid:</td>
          <td style="padding: 12px 16px; color: #16a34a; font-weight: bold; font-size: 16px; text-align: right;">₹${paymentDetails.amount.toLocaleString('en-IN')}</td>
        </tr>
      </table>
      
      <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 24px;">
        Need help? Contact support at support@edubatch.com or call your institute administrator.
      </p>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: ENV.SMTP_FROM,
        to: recipientEmail,
        subject: `Payment Receipt: ${paymentDetails.batchName} [${paymentDetails.receiptNumber}]`,
        html: htmlContent,
      });
      console.log(`[Email] Receipt email sent to ${recipientEmail}`);
      return true;
    } catch (error) {
      console.warn(`[Email] Failed to send email via SMTP:`, error);
    }
  }

  // Development fallback: Log simulation
  console.log(`[Email Simulation] Payment receipt generated for ${recipientEmail}: ₹${paymentDetails.amount} for ${paymentDetails.batchName} (${paymentDetails.receiptNumber})`);
  return true;
};

export const sendPasswordResetEmail = async (
  recipientEmail: string,
  resetUrl: string
): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 20px;">
      <h2>EduBatch Password Reset</h2>
      <p>You requested a password reset for your EduBatch account. Click the button below to set a new password:</p>
      <div style="margin: 25px 0;">
        <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #64748b; font-size: 12px;">This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: ENV.SMTP_FROM,
        to: recipientEmail,
        subject: 'EduBatch - Password Reset Request',
        html,
      });
      return true;
    } catch (err) {
      console.warn('[Email] Reset email delivery failed:', err);
    }
  }

  console.log(`[Email Simulation] Password reset link for ${recipientEmail}: ${resetUrl}`);
  return true;
};
