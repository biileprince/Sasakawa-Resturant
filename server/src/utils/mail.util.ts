import nodemailer from 'nodemailer';

export function getMailer() {
  const host = process.env.SMTP_HOST;
  if (!host) throw new Error('SMTP_HOST not set');
  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transporter;
}

export async function sendSimpleMail(to: string, subject: string, text: string) {
  const from = process.env.SMTP_FROM || 'no-reply@example.com';
  const transporter = getMailer();
  await transporter.sendMail({ from, to, subject, text });
}
