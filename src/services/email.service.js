const https = require('https');

class EmailService {
  constructor() {
    this.apiKey = process.env.RESEND_API_KEY;
    this.fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
  }

  async _send(to, subject, html) {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({
        from: `Portfolio Admin <${this.fromEmail}>`,
        to: [to],
        subject,
        html,
      });

      const options = {
        hostname: 'api.resend.com',
        port: 443,
        path: '/emails',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`Resend API error: ${res.statusCode} - ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  async sendLogin2FACode(email, code) {
    await this._send(
      email,
      'Your login verification code',
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Security verification</h2>
        <p>Your one-time login code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; margin: 20px 0; color: #FF6B6B;">
          ${code}
        </div>
        <p>This code is valid for <strong>10 minutes</strong>.</p>
        <p>If this wasn't you, please ignore this email.</p>
      </div>`
    );
    console.log(`✅ 2FA code sent to ${email}`);
  }

  async sendResetPasswordEmail(email, resetToken) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await this._send(
      email,
      'Password Reset Request',
      `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
    );
  }

  async sendNewMessageEmail(userEmail, messageData) {
    await this._send(
      userEmail,
      `New Message: ${messageData.subject}`,
      `<p>From: ${messageData.name} (${messageData.email})</p>
       <p>${messageData.message}</p>`
    );
  }

  async sendMessageConfirmation(email, data) {
    await this._send(
      email,
      'Message Confirmation',
      `<p>Dear ${data.name}, we received your message and will reply soon.</p>`
    );
  }
}

module.exports = new EmailService();