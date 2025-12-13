const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    console.warn('SMTP is not fully configured. Emails will be logged to console only.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });

  return transporter;
}

async function sendMail({ to, subject, text, html }) {
  const tx = getTransporter();
  const message = { from: process.env.SMTP_FROM || 'husky-ai@example.com', to, subject, text, html };

  if (!tx) {
    console.log('EMAIL (simulation):', message);
    return;
  }

  await tx.sendMail(message);
}

module.exports = { sendMail };
