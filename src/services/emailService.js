import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export const emailService = {
  async sendMagicLink(email, token) {
    const loginUrl = `${config.app.url}/auth/verify?token=${token}`;

    await transporter.sendMail({
      from: config.email.from,
      to: email,
      subject: 'Your login link for the Client Portal',
      text: `Click this link to log in to your client portal:\n\n${loginUrl}\n\nThis link expires in ${config.auth.tokenExpiryMinutes} minutes.\n\nIf you didn't request this link, you can safely ignore this email.`,
      html: `
        <p>Click the button below to log in to your client portal:</p>
        <p style="margin: 24px 0;">
          <a href="${loginUrl}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Log in to Portal
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This link expires in ${config.auth.tokenExpiryMinutes} minutes.
        </p>
        <p style="color: #666; font-size: 14px;">
          If you didn't request this link, you can safely ignore this email.
        </p>
      `,
    });
  },

  async verifyConnection() {
    await transporter.verify();
  },
};
