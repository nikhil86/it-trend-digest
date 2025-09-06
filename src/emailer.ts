import nodemailer from 'nodemailer';
import { config } from './config.js';
import logger from './logger.js';

function createTransport(port: number, secure: boolean) {
  return nodemailer.createTransport({
    host: config.SMTP_HOST,
    port,
    secure,
    auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
  });
}

export async function sendEmail(args: { subject: string; html: string; text: string }) {
  const primaryPort = config.SMTP_PORT;
  const primarySecure = primaryPort === 465;
  const primary = createTransport(primaryPort, primarySecure);

  try {
    const info = await primary.sendMail({
      from: config.FROM_EMAIL,
      to: config.toEmails.join(', '),
      subject: args.subject,
      text: args.text,
      html: args.html,
    });
    logger.info(`Email sent: ${info.messageId}`);
    return;
  } catch (err: any) {
    logger.warn(`Primary SMTP (${config.SMTP_HOST}:${primaryPort}) failed: ${err?.code || err?.message || err}`);
    // Fallback to 465/TLS if primary wasn't 465
    if (primaryPort !== 465) {
      try {
        const fallback = createTransport(465, true);
        const info = await fallback.sendMail({
          from: config.FROM_EMAIL,
          to: config.toEmails.join(', '),
          subject: args.subject,
          text: args.text,
          html: args.html,
        });
        logger.info(`Email sent via fallback TLS 465: ${info.messageId}`);
        return;
      } catch (err2: any) {
        logger.error(`Fallback SMTP (TLS 465) failed: ${err2?.code || err2?.message || err2}`);
        throw err2;
      }
    }
    throw err;
  }
}
