import 'server-only';

import nodemailer from 'nodemailer';

export type EmailMessage = { to: string; subject: string; html: string; text?: string };
export type EmailProvider = { send(message: EmailMessage): Promise<void> };

class LogEmailProvider implements EmailProvider {
  async send(message: EmailMessage) {
    console.info('[Lumina email:mock]', JSON.stringify(message, null, 2));
  }
}

class SmtpEmailProvider implements EmailProvider {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  async send(message: EmailMessage) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM ?? process.env.SMTP_USER,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
  }
}

export function emailProvider(): EmailProvider {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) return new SmtpEmailProvider();
  return new LogEmailProvider();
}
