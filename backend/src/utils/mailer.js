const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtpEmail = async (to, name, otp) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;background:#0284c7;border-radius:12px;margin-bottom:12px;">
          <span style="color:#fff;font-size:24px;">+</span>
        </div>
        <h1 style="color:#0f172a;font-size:22px;margin:0;">MediShare</h1>
      </div>
      <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e2e8f0;">
        <h2 style="color:#0f172a;font-size:18px;margin:0 0 8px;">Verify your email</h2>
        <p style="color:#64748b;font-size:14px;margin:0 0 24px;">Hi ${name}, use the OTP below to verify your email address. It expires in <strong>10 minutes</strong>.</p>
        <div style="text-align:center;margin:24px 0;">
          <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#0284c7;">${otp}</span>
        </div>
        <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">Do not share this OTP with anyone.</p>
      </div>
    </div>
  `;
  await transporter.sendMail({
    from: `"MediShare" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${otp} is your MediShare verification code`,
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
  await transporter.sendMail({
    from: `"MediShare" <${process.env.EMAIL_USER}>`,
    to,
    subject: `MediShare NGO Account ${approved ? 'Approved' : 'Rejected'}`,
    html,
  });
};

module.exports = { generateOtp, sendOtpEmail, sendApprovalEmail };