import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // must be Gmail App Password
  }
});

// ✅ Send OTP for signup or verification
export const sendOtpEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: `"S3CloudHub OTP" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Email Verification OTP',
    html: `
      <div style="font-family:Arial,sans-serif;">
        <h2>Verify your email</h2>
        <p>Your OTP is:</p>
        <h1 style="color:#1a73e8;">${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ✅ Send reset password email
export const sendResetPasswordEmail = async (to: string, resetToken: string, p0: string) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"S3CloudHub Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset your password',
    html: `
      <div style="font-family:Arial,sans-serif;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the button below:</p>
        <a href="${resetUrl}" style="display:inline-block;margin:10px 0;padding:10px 20px;background-color:#1a73e8;color:white;text-decoration:none;border-radius:4px;">Reset Password</a>
        <p>If you didn’t request this, ignore this email.</p>
        <p>Link expires in 10 minutes.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
