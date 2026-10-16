import nodemailer, { type Transporter } from 'nodemailer';

/**
 * Outbound mail via SMTP. Configure with:
 *   SMTP_HOST, SMTP_PORT (default 587), SMTP_SECURE ("true" for port 465),
 *   SMTP_USER, SMTP_PASS, MAIL_FROM (e.g. "Hackday <no-reply@yourdomain>").
 * Works with any provider (Gmail app password, Brevo, SES SMTP, Mailgun, ...).
 */

let transporter: Transporter | null = null;

export function isMailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS,
  );
}

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const port = Number(process.env.SMTP_PORT ?? 587);

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === 'true'
      : port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  return transporter;
}

export type MailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export async function sendMail({ to, subject, text, html }: MailInput) {
  if (!isMailConfigured()) {
    throw new Error('Mail is not configured (SMTP_HOST / SMTP_USER / SMTP_PASS missing)');
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_USER!;

  await getTransporter().sendMail({ from, to, subject, text, html });
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
