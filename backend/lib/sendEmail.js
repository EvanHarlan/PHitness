import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config(); 

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text) => {
  const senderEmail = process.env.SENDGRID_SENDER_EMAIL;

  if (!senderEmail) {
    throw new Error('Missing sender email configuration.');
  }

  if (!to || typeof to !== 'string') {
    throw new Error('Missing or invalid recipient email address.');
  }

  const msg = {
    to: to,
    from: senderEmail,
    subject: subject,
    text: text,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    if (error.response) {
    throw new Error('Error sending email');
  }
}

};

export default sendEmail;