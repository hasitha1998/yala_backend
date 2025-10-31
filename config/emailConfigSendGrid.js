import sgMail from '@sendgrid/mail';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ==========================================
// BOOKING EMAILS
// ==========================================

// Send booking notification to ADMIN
export const sendBookingEmailToAdmin = async (bookingData) => {
  const msg = {
    to: process.env.ADMIN_EMAIL,
    from: process.env.EMAIL_FROM, // Must be verified in SendGrid
    subject: `🎉 New Booking: ${bookingData.bookingId} - ${bookingData.customerName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎉 New Safari Booking!</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Booking Details</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #667eea; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">👤 Customer Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0;"><strong>Name:</strong></td>
                <td style="padding: 8px 0;">${bookingData.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Email:</strong></td>
                <td style="padding: 8px 0;">${bookingData.customerEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Phone:</strong></td>
                <td style="padding: 8px 0;">${bookingData.customerPhone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Visitor Type:</strong></td>
                <td style="padding: 8px 0;">${bookingData.visitorType === 'foreign' ? 'Foreign' : 'Local'}</td>
              </tr>
            </table>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #667eea; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">🚙 Safari Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0;"><strong>Booking ID:</strong></td>
                <td style="padding: 8px 0;"><span style="background: #667eea; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${bookingData.bookingId}</span></td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Type:</strong></td>
                <td style="padding: 8px 0;">${bookingData.reservationType === 'private' ? '🔒 Private Safari' : '👥 Shared Safari'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Date:</strong></td>
                <td style="padding: 8px 0;">${new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Time Slot:</strong></td>
                <td style="padding: 8px 0;">${bookingData.timeSlot === 'morning' ? '🌅 Morning Safari' : '🌆 Evening Safari'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>People:</strong></td>
                <td style="padding: 8px 0;">${bookingData.people || bookingData.selectedSeats}</td>
              </tr>
              ${bookingData.jeepType ? `
              <tr>
                <td style="padding: 8px 0;"><strong>Jeep Type:</strong></td>
                <td style="padding: 8px 0;">${bookingData.jeepType}</td>
              </tr>
              ` : ''}
              ${bookingData.guideOption ? `
              <tr>
                <td style="padding: 8px 0;"><strong>Guide:</strong></td>
                <td style="padding: 8px 0;">${bookingData.guideOption}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #4CAF50; margin-top: 0; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">💰 Payment Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0;"><strong>Ticket Price:</strong></td>
                <td style="padding: 8px 0; text-align: right;">$${bookingData.ticketPrice?.toFixed(2) || '0.00'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Jeep Price:</strong></td>
                <td style="padding: 8px 0; text-align: right;">$${bookingData.jeepPrice?.toFixed(2) || '0.00'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Guide Price:</strong></td>
                <td style="padding: 8px 0; text-align: right;">$${bookingData.guidePrice?.toFixed(2) || '0.00'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Meal Price:</strong></td>
                <td style="padding: 8px 0; text-align: right;">$${bookingData.mealPrice?.toFixed(2) || '0.00'}</td>
              </tr>
              <tr style="border-top: 2px solid #4CAF50; font-size: 18px;">
                <td style="padding: 12px 0;"><strong>Total Amount:</strong></td>
                <td style="padding: 12px 0; text-align: right; color: #4CAF50;"><strong>$${bookingData.totalPrice?.toFixed(2)}</strong></td>
              </tr>
            </table>
            <div style="margin-top: 10px; padding: 10px; background: #FFF3CD; border-left: 4px solid #FFC107; border-radius: 4px;">
              <p style="margin: 0;"><strong>Status:</strong> ${bookingData.status || 'Pending'}</p>
            </div>
          </div>
        </div>

        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 14px;">📧 Yala Tours - Safari Booking System</p>
          <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Received at ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Admin booking email sent successfully via SendGrid');
    return { success: true };
  } catch (error) {
    console.error('❌ SendGrid Error:', error.response?.body || error);
    throw error;
  }
};

// Send booking confirmation to CUSTOMER
export const sendBookingConfirmationToCustomer = async (bookingData) => {
  const msg = {
    to: bookingData.customerEmail,
    from: process.env.EMAIL_FROM,
    subject: `Booking Confirmation - ${bookingData.bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4CAF50; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Booking Confirmation</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <p>Dear ${bookingData.customerName},</p>
          
          <p>Thank you for your booking! We have received your reservation request.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Booking ID:</strong> ${bookingData.bookingId}</p>
            <p><strong>Date:</strong> ${new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Time:</strong> ${bookingData.timeSlot === 'morning' ? 'Morning Safari' : 'Evening Safari'}</p>
            <p><strong>Total Amount:</strong> $${bookingData.totalPrice?.toFixed(2)}</p>
          </div>

          <p>Our team will contact you shortly with payment details and further instructions.</p>
          
          <p>For any queries, please contact us via WhatsApp or email.</p>
          
          <p>Best regards,<br>Yala Tours Team</p>
        </div>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Customer booking confirmation sent successfully via SendGrid');
    return { success: true };
  } catch (error) {
    console.error('❌ SendGrid Error:', error.response?.body || error);
    throw error;
  }
};

// Contact form emails
export const sendAdminNotification = async (contactData) => {
  const msg = {
    to: process.env.ADMIN_EMAIL,
    from: process.env.EMAIL_FROM,
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
      <p>Received at ${new Date().toLocaleString()}</p>
    `
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Admin notification sent via SendGrid');
  } catch (error) {
    console.error('❌ SendGrid Error:', error);
  }
};

export const sendThankYouEmail = async (contactData) => {
  const msg = {
    to: contactData.email,
    from: process.env.EMAIL_FROM,
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
    `
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Thank you email sent via SendGrid');
  } catch (error) {
    console.error('❌ SendGrid Error:', error);
  }
};

export const testEmailConfig = () => {
  console.log('📧 SendGrid Configuration:');
  console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Not Set');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
};