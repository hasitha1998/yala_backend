import { Resend } from 'resend';

const RESEND_API_KEY = 're_iB6539WJ_2bDQhove3YBXFJuJVrEB2Rfq';
const ADMIN_EMAIL = 'yalagihan@gmail.com';

// Check if API key exists before initializing
if (!RESEND_API_KEY) {
  console.error('⚠️ RESEND_API_KEY is not defined in environment variables');
  console.error('Make sure to load .env file before importing this module');
  console.error('Current value:', RESEND_API_KEY);
}

// Initialize Resend with API key (provide empty string as fallback to see better error)
const resend = new Resend(RESEND_API_KEY);

//console.log(RESEND_API_KEY)

// Send booking notification to ADMIN
export const sendBookingEmailToAdmin = async (bookingData) => {
  if (!resend) {
    console.error('❌ Resend client not initialized. Check your RESEND_API_KEY');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Yala Safari <onboarding@resend.dev>', // ✅ Works immediately
      to: [process.env.ADMIN_EMAIL],
      subject: `🎉 New Booking: ${bookingData.bookingId} - ${bookingData.customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">🎉 New Safari Booking!</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Booking Details</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #667eea;">👤 Customer Information</h3>
              <p><strong>Name:</strong> ${bookingData.customerName}</p>
              <p><strong>Email:</strong> ${bookingData.customerEmail}</p>
              <p><strong>Phone:</strong> ${bookingData.customerPhone}</p>
              <p><strong>Visitor Type:</strong> ${bookingData.visitorType === 'foreign' ? 'Foreign' : 'Local'}</p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #667eea;">🚙 Safari Details</h3>
              <p><strong>Booking ID:</strong> <span style="background: #667eea; color: white; padding: 4px 8px; border-radius: 4px;">${bookingData.bookingId}</span></p>
              <p><strong>Type:</strong> ${bookingData.reservationType === 'private' ? '🔒 Private Safari' : '👥 Shared Safari'}</p>
              <p><strong>Date:</strong> ${new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Time Slot:</strong> ${bookingData.timeSlot === 'morning' ? '🌅 Morning Safari' : '🌆 Evening Safari'}</p>
              <p><strong>People:</strong> ${bookingData.people || bookingData.selectedSeats}</p>
              ${bookingData.jeepType ? `<p><strong>Jeep Type:</strong> ${bookingData.jeepType}</p>` : ''}
              ${bookingData.guideOption ? `<p><strong>Guide:</strong> ${bookingData.guideOption}</p>` : ''}
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h3 style="color: #4CAF50;">💰 Payment Information</h3>
              <p><strong>Ticket Price:</strong> $${bookingData.ticketPrice?.toFixed(2) || '0.00'}</p>
              <p><strong>Jeep Price:</strong> $${bookingData.jeepPrice?.toFixed(2) || '0.00'}</p>
              <p><strong>Guide Price:</strong> $${bookingData.guidePrice?.toFixed(2) || '0.00'}</p>
              <p><strong>Meal Price:</strong> $${bookingData.mealPrice?.toFixed(2) || '0.00'}</p>
              <p style="font-size: 20px; color: #4CAF50;"><strong>Total Amount: $${bookingData.totalPrice?.toFixed(2)}</strong></p>
              <div style="padding: 10px; background: #FFF3CD; border-left: 4px solid #FFC107; border-radius: 4px; margin-top: 10px;">
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
    });

    if (error) {
      console.error('❌ Resend Error:', error);
      throw error;
    }

    console.log('✅ Admin booking email sent via Resend:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error sending admin email:', error);
    throw error;
  }
};

// Send booking confirmation to CUSTOMER
export const sendBookingConfirmationToCustomer = async (bookingData) => {
  if (!resend) {
    console.error('❌ Resend client not initialized. Check your RESEND_API_KEY');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Yala Safari <onboarding@resend.dev>', // ✅ Works immediately
      to: [bookingData.customerEmail],
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
    });

    if (error) {
      console.error('❌ Resend Error:', error);
      throw error;
    }

    console.log('✅ Customer confirmation sent via Resend:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error sending customer email:', error);
    throw error;
  }
};

// Contact form emails
export const sendAdminNotification = async (contactData) => {
  if (!resend) {
    console.error('❌ Resend client not initialized. Check your RESEND_API_KEY');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Yala Safari <onboarding@resend.dev>',
      to: [process.env.ADMIN_EMAIL],
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
    });

    if (error) throw error;
    console.log('✅ Admin notification sent via Resend');
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

export const sendThankYouEmail = async (contactData) => {
  if (!resend) {
    console.error('❌ Resend client not initialized. Check your RESEND_API_KEY');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Yala Safari <onboarding@resend.dev>',
      to: [contactData.email],
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
    });

    if (error) throw error;
    console.log('✅ Thank you email sent via Resend');
  } catch (error) {
    console.error('❌ Error:', error);
  }
};