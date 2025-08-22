const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  secure: true,
  port: 465,
});

// Function to send notification to admin
exports.sendAdminNotification = async (contactData) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: 'New Contact Form Submission',
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${contactData.name}</p>
      <p><strong>Email:</strong> ${contactData.email}</p>
      <p><strong>Phone:</strong> ${contactData.phone || 'Not provided'}</p>
      <p><strong>Subject:</strong> ${contactData.subject || 'No subject'}</p>
      <p><strong>Message:</strong></p>
      <p>${contactData.message}</p>
      <br>
      <p>This message was received at ${new Date().toLocaleString()}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent');
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
};

// Function to send thank you email to user
exports.sendThankYouEmail = async (contactData) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: contactData.email,
    subject: 'Thank you for contacting Yala Safari',
    html: `
      <h2>Dear ${contactData.name},</h2>
      <p>Thank you for reaching out to Yala Safari! We've received your message and will get back to you as soon as possible.</p>
      <p>Here's a copy of your message for reference:</p>
      <blockquote>
        <p>${contactData.message}</p>
      </blockquote>
      <p>If you have any urgent inquiries, please feel free to call us at +94 773 742 700.</p>
      <br>
      <p>Best regards,</p>
      <p>The Yala Safari Team</p>
      <img src="https://your-logo-url.com/logo.png" alt="Yala Safari Logo" width="150">
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Thank you email sent to user');
  } catch (error) {
    console.error('Error sending thank you email:', error);
  }
};