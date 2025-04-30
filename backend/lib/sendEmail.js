import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config(); 

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text) => {
  const senderEmail = process.env.SENDGRID_SENDER_EMAIL;

  if (!senderEmail) {
    console.error('SENDGRID_SENDER_EMAIL is not defined in environment variables!');
    throw new Error('Missing sender email configuration.');
  }

  if (!to || typeof to !== 'string') {
    console.error('Invalid recipient email:', to);
    throw new Error('Missing or invalid recipient email address.');
  }

  const msg = {
    to: to,
    from: senderEmail,
    subject: subject,
    text: text,
  };

  try {
    console.log(`Sending email from ${senderEmail} to ${to}`);
    await sgMail.send(msg);
  } catch (error) {
    if (error.response) {
      console.error('Error response from SendGrid:', error.response.body);
    } else {
      console.error('General error sending email:', error.message);
    }
    throw new Error('Error sending email');
  }
};

export default sendEmail;