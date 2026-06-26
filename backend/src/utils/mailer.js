const nodemailer = require('nodemailer');

// ── Lazy transporter — created on first use, not at module load ───────────────
// This prevents the server from crashing at startup when EMAIL creds are missing
// in environments that don't need mail (e.g. running tests).
let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error(
      'EMAIL_USER and EMAIL_PASS must be set in .env to send emails. ' +
      'Use a Gmail App Password — see backend/.env.example.'
    );
  }

  _transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return _transporter;
}

// ── Utilities ─────────────────────────────────────────────────────────────────
const generateOtp = () =>
  Math.floor(100_000 + Math.random() * 900_000).toString();

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
  await getTransporter().sendMail({
    from: `"MediShare" <${process.env.EMAIL_USER}>`,
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
  await getTransporter().sendMail({
    from: `"MediShare" <${process.env.EMAIL_USER}>`,
    to,
    subject: `MediShare NGO Account ${approved ? 'Approved' : 'Rejected'}`,
    html,
  });
};

const sendContactEmail = async ({ name, email, subject, message }) => {
  // Note: name/subject/message should already be HTML-escaped by the route handler
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
  await getTransporter().sendMail({
    from: `"MediShare Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.CONTACT_ADMIN_EMAIL || process.env.EMAIL_USER,
    replyTo: email,
    subject: `MediShare Contact: ${subject}`,
    html,
  });
};

module.exports = { generateOtp, sendOtpEmail, sendApprovalEmail, sendContactEmail };
