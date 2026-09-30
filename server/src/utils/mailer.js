import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { user, pass, service, host, port, secure } = config.email || {};

  const cleanUser = user ? user.trim() : '';
  const cleanPass = pass ? pass.trim().replace(/\s+/g, '') : '';

  if (!cleanUser || !cleanPass) {
    return null;
  }

  try {
    if (service === 'gmail' || (host && host.includes('gmail'))) {
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: cleanUser,
          pass: cleanPass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        tls: {
          rejectUnauthorized: false,
        },
      });
    } else {
      transporter = nodemailer.createTransport({
        host,
        port: parseInt(port || '465', 10),
        secure: Boolean(secure),
        auth: {
          user: cleanUser,
          pass: cleanPass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
      });
    }
    return transporter;
  } catch (err) {
    console.error('❌ Failed to initialize email transporter:', err.message);
    return null;
  }
}

/**
 * Send an OTP email to a user
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.name - Recipient name
 * @param {string} params.code - 6-digit OTP code
 * @param {'verification'|'login'|'reset'} params.purpose - Purpose of OTP
 */
export async function sendOtpEmail({ to, name = 'Student', code, purpose = 'verification' }) {
  const isLogin = purpose === 'login';
  const subject = isLogin
    ? `CampusMart - Your Login OTP Code is ${code}`
    : `CampusMart - Verify Your Account (Code: ${code})`;

  const headline = isLogin ? 'Your Login Verification Code' : 'Verify Your Campus Account';
  const description = isLogin
    ? 'Use the 6-digit one-time password below to complete your login to CampusMart.'
    : 'Welcome to CampusMart! Use the 6-digit verification code below to verify your email and activate your account.';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .container { max-width: 520px; margin: 30px auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: #0f172a; padding: 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .body { padding: 32px 28px; }
        .greeting { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #0f172a; }
        .desc { font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 24px; }
        .code-box { background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px; }
        .code { font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #2563eb; }
        .expiry { font-size: 13px; color: #94a3b8; text-align: center; margin-bottom: 24px; }
        .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 CampusMart</h1>
        </div>
        <div class="body">
          <div class="greeting">Hello ${name},</div>
          <div class="desc">${description}</div>
          <div class="code-box">
            <div class="code">${code}</div>
          </div>
          <div class="expiry">⚠️ This code expires in <strong>15 minutes</strong>. Do not share this code with anyone.</div>
        </div>
        <div class="footer">
          If you did not request this email, you can safely ignore it.<br/>
          &copy; ${new Date().getFullYear()} CampusMart. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const mailClient = getTransporter();

  if (!mailClient) {
    console.warn(`\n⚠️  [EMAIL CONFIG MISSING] Could not send email to ${to}. EMAIL_USER or EMAIL_PASS is not configured in server/.env.`);
    console.log(`✉️  [OTP Code for ${to}]: ${code}\n`);
    return false;
  }

  try {
    const info = await mailClient.sendMail({
      from: config.email.from || `CampusMart <${config.email.user}>`,
      to,
      subject,
      text: `${headline}\n\nHello ${name},\n\nYour OTP code is: ${code}\n\nThis code will expire in 15 minutes.\n\nCampusMart Team`,
      html,
    });
    console.log(`✅ [EMAIL SENT] Successfully sent ${purpose} OTP to ${to} (Message ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`❌ [EMAIL SEND ERROR] Failed to send email to ${to}:`, error.message);
    console.log(`✉️  [Fallback OTP Code for ${to}]: ${code}\n`);
    return false;
  }
}
