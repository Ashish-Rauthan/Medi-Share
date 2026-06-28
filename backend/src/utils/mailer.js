const SibApiV3Sdk = require('sib-api-v3-sdk');

function getClient() {
  if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY must be set in environment variables.');
  }

  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  return new SibApiV3Sdk.TransactionalEmailsApi();
}

// ── Verify at startup ─────────────────────────────────────────────────────────
async function verifyMailer() {
  try {
    getClient();
    console.log('✅ Mailer: Brevo client initialised successfully');
    return true;
  } catch (err) {
    console.error('❌ Mailer: Brevo init FAILED —', err.message);
    return false;
  }
}

// ── Send helper ───────────────────────────────────────────────────────────────
async function sendMail({ fromName, fromEmail, to, subject, html }) {
  const apiInstance = getClient();

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.sender      = { name: fromName, email: fromEmail };
  sendSmtpEmail.to          = [{ email: to }];
  sendSmtpEmail.subject     = subject;
  sendSmtpEmail.htmlContent = html;

  try {
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email sent to ${to} | messageId: ${result?.body?.messageId || 'ok'}`);
    return result;
  } catch (err) {
    const message = err?.response?.body?.message || err.message;
    console.error(`❌ Email FAILED to ${to} | error: ${message}`);
    throw new Error(message);
  }
}

// ── Utilities ─────────────────────────────────────────────────────────────────
const generateOtp = () =>
  Math.floor(100_000 + Math.random() * 900_000).toString();

const SENDER_NAME  = 'MediShare';
const SENDER_EMAIL = process.env.EMAIL_FROM || process.env.EMAIL_USER;

// ── Templates ─────────────────────────────────────────────────────────────────
const sendOtpEmail = async (to, name, otp) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#0f172a;font-size:22px;margin:0;">MediShare</h1>
      </div>
      <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e2e8f0;">
        <h2 style="color:#0f172a;font-size:18px;margin:0 0 8px;">Verify your email</h2>
        <p style="color:#64748b;font-size:14px;margin:0 0 24px;">
          Hi ${name}, use the OTP below to verify your email address.
          It expires in <strong>10 minutes</strong>.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#0284c7;">${otp}</span>
        </div>
        <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
          Do not share this OTP with anyone. MediShare staff will never ask for it.
        </p>
      </div>
    </div>
  `;

  return sendMail({
    fromName:  SENDER_NAME,
    fromEmail: SENDER_EMAIL,
    to,
    subject: `${otp} — your MediShare verification code`,
    html,
  });
};

const sendApprovalEmail = async (to, name, approved) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
      <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e2e8f0;">
        <h2 style="color:#0f172a;">NGO Account ${approved ? 'Approved ✅' : 'Rejected ❌'}</h2>
        <p style="color:#64748b;">Hi ${name},</p>
        ${approved
          ? `<p style="color:#64748b;">Your NGO account on MediShare has been <strong style="color:#16a34a;">approved</strong>. You can now log in and start browsing available medicines.</p>`
          : `<p style="color:#64748b;">Unfortunately your NGO account has been <strong style="color:#ef4444;">rejected</strong>. Please contact support for more information.</p>`
        }
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login"
           style="display:inline-block;margin-top:16px;padding:10px 24px;background:#0284c7;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
          Go to MediShare
        </a>
      </div>
    </div>
  `;

  return sendMail({
    fromName:  SENDER_NAME,
    fromEmail: SENDER_EMAIL,
    to,
    subject: `MediShare NGO Account ${approved ? 'Approved' : 'Rejected'}`,
    html,
  });
};

const sendContactEmail = async ({ name, email, subject, message }) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
      <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e2e8f0;">
        <h2 style="color:#0f172a;margin:0 0 8px;">New contact form message</h2>
        <p style="color:#64748b;margin:0 0 16px;">A visitor filled out the contact form on MediShare.</p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
          <p style="margin:0 0 8px;"><strong>Name:</strong> ${name}</p>
          <p style="margin:0 0 8px;"><strong>Email:</strong> ${email}</p>
          <p style="margin:0 0 8px;"><strong>Subject:</strong> ${subject}</p>
          <p style="margin:0;"><strong>Message:</strong><br />${message.replace(/\n/g, '<br />')}</p>
        </div>
      </div>
    </div>
  `;

  return sendMail({
    fromName:  SENDER_NAME,
    fromEmail: SENDER_EMAIL,
    to: process.env.CONTACT_ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: `MediShare Contact: ${subject}`,
    html,
  });
};

module.exports = { generateOtp, sendOtpEmail, sendApprovalEmail, sendContactEmail, verifyMailer };