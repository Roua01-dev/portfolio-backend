const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendResetPasswordEmail(email, resetToken) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: `"Portfolio Admin" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested a password reset for your portfolio admin account.</p>
          <p>Click the link below to reset your password (valid for 30 minutes):</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #FF6B6B; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Reset Password
          </a>
          <p>Or copy this link:</p>
          <code style="background-color: #f4f4f4; padding: 10px; border-radius: 4px; display: block; margin: 10px 0;">
            ${resetUrl}
          </code>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message from your portfolio admin system.</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Reset email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending reset email:', error);
      throw new Error('Failed to send reset email');
    }
  }

  async send2FASetupEmail(email, secret) {
    const mailOptions = {
      from: `"Portfolio Admin" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: '2FA Setup Instructions',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Two-Factor Authentication Setup</h2>
          <p>You've enabled 2FA for your portfolio admin account.</p>
          <p>Your secret key for Google Authenticator:</p>
          <code style="background-color: #f4f4f4; padding: 10px; border-radius: 4px; display: block; margin: 10px 0; font-size: 18px; letter-spacing: 2px;">
            ${secret}
          </code>
          <p><strong>Instructions:</strong></p>
          <ol>
            <li>Install Google Authenticator on your phone</li>
            <li>Add a new account with the secret key above</li>
            <li>Save this email for backup</li>
          </ol>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message from your portfolio admin system.</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`2FA setup email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending 2FA email:', error);
      throw new Error('Failed to send 2FA email');
    }
  }

  async sendMessageConfirmation(email, data) {
  const mailOptions = {
    from: `"${process.env.APP_NAME || 'Portfolio'}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Message Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank You for Your Message!</h2>
        <p>Dear ${data.name},</p>
        <p>This is to confirm that we've received your message:</p>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p>We'll get back to you as soon as possible.</p>
        </div>
        <p>Best regards,<br>${process.env.APP_NAME || 'Portfolio Team'}</p>
      </div>
    `
  };

  await this.transporter.sendMail(mailOptions);
}
async sendLogin2FACode(email, code) {
  const mailOptions = {
    from: `"Portfolio Security" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Your login verification code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Security verification</h2>
        <p>Your one-time login code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; margin: 20px 0;">
          ${code}
        </div>
        <p>This code is valid for <strong>10 minutes</strong>.</p>
        <p>If this wasn't you, please ignore this email.</p>
      </div>
    `
  };

  await this.transporter.sendMail(mailOptions);
}

  async sendNewMessageEmail(userEmail, messageData) {
    const mailOptions = {
      from: `"Portfolio Contact Form" <${process.env.EMAIL_FROM}>`,
      to: userEmail, // Votre email pour recevoir les messages
      replyTo: messageData.email, // L'email de l'expéditeur
      subject: `New Message from Portfolio: ${messageData.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Message from Your Portfolio</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>From:</strong> ${messageData.name} &lt;${messageData.email}&gt;</p>
            <p><strong>Subject:</strong> ${messageData.subject}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
            <p>${messageData.message.replace(/\n/g, '<br>')}</p>
          </div>
          <div style="margin-top: 30px; padding: 15px; background-color: #e8f4fd; border-radius: 6px;">
            <p><strong>Reply to:</strong> ${messageData.email}</p>
            <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">This message was sent via your portfolio contact form.</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`New message notification sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending new message email:', error);
      throw new Error('Failed to send notification email');
    }
  }
}

module.exports = new EmailService();