const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// Resend requires sending from onboarding@resend.dev for unverified domains (testing accounts)
const SMTP_FROM = process.env.SMTP_FROM || 'Satnamy Matrimony <onboarding@resend.dev>';

let resend = null;
if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
}

/**
 * Send password reset email.
 */
async function sendResetPasswordEmail(email, name, resetLink) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px;">
      <h2 style="color: #9333ea; text-align: center;">Satnamy Matrimony</h2>
      <p>Hello ${name},</p>
      <p>You requested to reset your password. Please click the button below to set a new password. This link is valid for 1 hour.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #9333ea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p>If you did not request this, you can safely ignore this email.</p>
      <p style="color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${resetLink}">${resetLink}</a>
      </p>
    </div>
  `;

  if (resend) {
    try {
      const response = await resend.emails.send({
        from: SMTP_FROM,
        to: email,
        subject: 'Reset Your Password - Satnamy Matrimony',
        html: htmlContent,
      });
      console.log(`Password reset email successfully sent to ${email} via Resend. ID: ${response.data?.id}`);
      return { sent: true };
    } catch (err) {
      console.error('Resend API send error:', err);
      return { sent: false, error: err.message };
    }
  } else {
    console.log('---------------- RESET PASSWORD LINK (CONSOLE LOG FALLBACK) ----------------');
    console.log(`To: ${email} (${name})`);
    console.log(`Reset Link: ${resetLink}`);
    console.log('----------------------------------------------------------------------------');
    return { sent: false, fallback: true };
  }
}

module.exports = {
  sendResetPasswordEmail
};
