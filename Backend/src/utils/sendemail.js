import nodemailer from "nodemailer";
import Brevo from "@getbrevo/brevo";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // use STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const brevoClient = () => {
  if (!process.env.BREVO_API_KEY) return null;
  return new Brevo({ apiKey: process.env.BREVO_API_KEY });
};

/**
 * Send email verification email
 */
const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">🏃 Health Tracker</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">Hi ${name}! 👋</h2>
          <p style="color: #666; font-size: 16px;">Welcome to Health Tracker! Please verify your email address to activate your account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 14px 30px; 
                      border-radius: 25px; 
                      text-decoration: none; 
                      font-size: 16px;
                      font-weight: bold;">
              Verify My Email
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #ccc; font-size: 12px; text-align: center;">Health Tracker App © ${new Date().getFullYear()}</p>
        </div>
      </div>
    `;

  const brevo = brevoClient();
  if (brevo) {
    const tranEmailApi = new brevo.TransactionalEmailsApi();
    const sendSmtpEmail = {
      sender: { name: "Health Tracker", email: process.env.SENDER_EMAIL },
      to: [{ email, name }],
      subject: "✅ Verify Your Email – Health Tracker",
      htmlContent: htmlContent,
    };

    const response = await tranEmailApi.sendTransacEmail(sendSmtpEmail);
    return response;
  }

  const transporter = createTransporter();
  const mailOptions = {
    from: `"Health Tracker App" <${process.env.SMTP_USER || process.env.SENDER_EMAIL}>`,
    to: email,
    subject: "✅ Verify Your Email – Health Tracker",
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

/**
 * Send password reset email (optional extension)
 */
const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Hi ${name},</h2>
        <p>You requested a password reset. Click the link below:</p>
        <a href="${resetUrl}" style="background:#667eea; color:white; padding:12px 25px; border-radius:20px; text-decoration:none;">Reset Password</a>
        <p style="color:#999; font-size:13px; margin-top:20px;">This link expires in 1 hour.</p>
      </div>
    `;

  const brevo = brevoClient();
  if (brevo) {
    const tranEmailApi = new brevo.TransactionalEmailsApi();
    const sendSmtpEmail = {
      sender: { name: "Health Tracker", email: process.env.SENDER_EMAIL },
      to: [{ email, name }],
      subject: "🔑 Reset Your Password – Health Tracker",
      htmlContent: htmlContent,
    };

    const response = await tranEmailApi.sendTransacEmail(sendSmtpEmail);
    return response;
  }

  const transporter = createTransporter();
  const mailOptions = {
    from: `"Health Tracker App" <${process.env.SMTP_USER || process.env.SENDER_EMAIL}>`,
    to: email,
    subject: "🔑 Reset Your Password – Health Tracker",
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

export default { sendVerificationEmail, sendPasswordResetEmail };