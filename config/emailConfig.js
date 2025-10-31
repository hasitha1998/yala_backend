import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // or use 'smtp' with custom host
    auth: {
      user: process.env.EMAIL_USER, // Your email (e.g., yalatours@gmail.com)
      pass: process.env.EMAIL_PASSWORD, // Your email app password
    },
  });
};

// Send booking confirmation email to admin
export const sendBookingEmailToAdmin = async (bookingData) => {
  try {
    const transporter = createTransporter();

    const {
      bookingId,
      customerName,
      customerEmail,
      customerPhone,
      reservationType,
      date,
      timeSlot,
      people,
      selectedSeats,
      jeepType,
      guideOption,
      mealOption,
      includeBreakfast,
      includeLunch,
      visitorType,
      totalPrice,
      ticketPrice,
      jeepPrice,
      guidePrice,
      mealPrice,
      status,
      createdAt,
    } = bookingData;

    // Format the booking details
    const reservationDetails = reservationType === 'private'
      ? `
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Jeep Type:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${jeepType}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Number of People:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${people}</td></tr>
      `
      : `
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Shared Seats:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${selectedSeats || people}</td></tr>
      `;

    const mealDetails = mealOption === 'with'
      ? `
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Breakfast:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${includeBreakfast ? 'Yes' : 'No'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Lunch:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${includeLunch ? 'Yes' : 'No'}</td></tr>
      `
      : '<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Meals:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">No Meals</td></tr>';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; }
          .booking-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .booking-table td { padding: 8px; border: 1px solid #ddd; }
          .price-section { background-color: #e8f5e9; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .total-price { font-size: 24px; font-weight: bold; color: #2e7d32; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New Booking Received!</h1>
            <p>Booking ID: ${bookingId}</p>
          </div>
          
          <div class="content">
            <h2>Customer Information</h2>
            <table class="booking-table">
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${customerEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${customerPhone}</td>
              </tr>
            </table>

            <h2>Booking Details</h2>
            <table class="booking-table">
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Reservation Type:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${reservationType === 'private' ? 'Private' : 'Shared'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Date:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Time Slot:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${timeSlot === 'morning' ? 'Morning Safari' : 'Evening Safari'}</td>
              </tr>
              ${reservationDetails}
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Visitor Type:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${visitorType === 'foreign' ? 'Foreign' : 'Local'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Guide Option:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${guideOption === 'english' ? 'English Guide' : guideOption === 'sinhala' ? 'Sinhala Guide' : 'No Guide'}</td>
              </tr>
              ${mealDetails}
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Status:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;"><span style="background-color: #fff3cd; padding: 5px 10px; border-radius: 3px;">${status}</span></td>
              </tr>
            </table>

            <div class="price-section">
              <h2>Price Breakdown</h2>
              <table class="booking-table">
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Ticket Price:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">$${ticketPrice.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Jeep Price:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">$${jeepPrice.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Guide Price:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">$${guidePrice.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Meal Price:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">$${mealPrice.toFixed(2)}</td>
                </tr>
                <tr style="background-color: #c8e6c9;">
                  <td style="padding: 12px; border: 1px solid #ddd;"><strong>TOTAL PRICE:</strong></td>
                  <td style="padding: 12px; border: 1px solid #ddd;"><span class="total-price">$${totalPrice.toFixed(2)}</span></td>
                </tr>
              </table>
            </div>

            <p style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107;">
              <strong>⚠️ Action Required:</strong> Please contact the customer to confirm payment details and booking status.
            </p>
          </div>

          <div class="footer">
            <p>This is an automated email from your Yala Tours booking system.</p>
            <p>Booking received at: ${new Date(createdAt).toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Yala Tours Booking System" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL, // Admin email address
      subject: `🎉 New Booking: ${bookingId} - ${customerName}`,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send booking confirmation email to customer (optional)
export const sendBookingConfirmationToCustomer = async (bookingData) => {
  try {
    const transporter = createTransporter();
    const { customerName, customerEmail, bookingId, date, timeSlot, totalPrice } = bookingData;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmation</h1>
          </div>
          <div class="content">
            <p>Dear ${customerName},</p>
            <p>Thank you for your booking! We have received your reservation request.</p>
            <p><strong>Booking ID:</strong> ${bookingId}</p>
            <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${timeSlot === 'morning' ? 'Morning Safari' : 'Evening Safari'}</p>
            <p><strong>Total Amount:</strong> $${totalPrice.toFixed(2)}</p>
            <p>Our team will contact you shortly with payment details and further instructions.</p>
            <p>For any queries, please contact us via WhatsApp or email.</p>
            <p>Best regards,<br>Yala Tours Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Yala Tours" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Booking Confirmation - ${bookingId}`,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending customer email:', error);
    return { success: false, error: error.message };
  }
};