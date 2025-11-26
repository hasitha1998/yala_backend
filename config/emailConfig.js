import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create reusable transporter at module level
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Helper function to format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper function to format time
const formatTime = (time) => {
  return time || 'N/A';
};

// ========================================
// SAFARI BOOKING EMAILS
// ========================================

// Send booking pending notification to admin
const sendBookingPendingToAdmin = async (bookingData) => {
  try {
    const transporter = createTransporter();
    
    const {
      bookingId,
      customerName,
      customerEmail,
      customerPhone,
      date,
      timeSlot,
      people,
      guideOption,
      mealOption,
      includeBreakfast,
      includeLunch,
      selectedBreakfastItems,
      selectedLunchItems,
      vegOption,
      includeEggs,
      visitorType,
      totalPrice,
      ticketPrice,
      jeepPrice,
      guidePrice,
      mealPrice,
      createdAt,
    } = bookingData;

    // Format meal details
    let mealDetailsHtml = '';
    if (mealOption === 'with') {
      if (includeBreakfast && selectedBreakfastItems && selectedBreakfastItems.length > 0) {
        mealDetailsHtml += `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Breakfast Items:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${selectedBreakfastItems.join(', ')}${vegOption === 'veg' && includeEggs ? ' + Eggs' : ''}</td>
          </tr>
        `;
      }
      if (includeLunch && selectedLunchItems && selectedLunchItems.length > 0) {
        mealDetailsHtml += `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Lunch Items:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${selectedLunchItems.join(', ')}</td>
          </tr>
        `;
      }
      mealDetailsHtml += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Meal Type:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${vegOption === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}</td>
        </tr>
      `;
    } else {
      mealDetailsHtml = '<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Meals:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">No Meals</td></tr>';
    }

    const timeSlotDisplay = {
      morning: 'Morning Safari (5:30 AM - 9:30 AM)',
      afternoon: 'Afternoon Safari (2:30 PM - 6:30 PM)',
      extended: 'Extended Safari (5:30 AM - 12:00 PM)',
      fullDay: 'Full Day Safari (5:30 AM - 6:30 PM)'
    }[timeSlot] || timeSlot;

    const guideDisplay = {
      driver: 'Driver Only',
      driverGuide: 'Driver Guide',
      separateGuide: 'Driver + Separate Guide'
    }[guideOption] || guideOption;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ff9800; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; }
          .booking-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .booking-table td { padding: 8px; border: 1px solid #ddd; }
          .price-section { background-color: #fff3e0; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .total-price { font-size: 24px; font-weight: bold; color: #e65100; }
          .action-button { display: inline-block; padding: 12px 24px; margin: 10px 5px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .approve-btn { background-color: #4CAF50; color: white; }
          .reject-btn { background-color: #f44336; color: white; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏳ New Booking Pending Approval</h1>
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
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Safari Type:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">Private Safari (Luxury Jeep)</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Date:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Time Slot:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${timeSlotDisplay}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Number of People:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${people}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Visitor Type:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${visitorType === 'foreign' ? 'Foreign Visitor' : 'Local Visitor'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Guide Option:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${guideDisplay}</td>
              </tr>
              ${mealDetailsHtml}
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Status:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;"><span style="background-color: #fff3cd; padding: 5px 10px; border-radius: 3px;">PENDING APPROVAL</span></td>
              </tr>
            </table>

            <div class="price-section">
              <h2>Price Breakdown</h2>
              <table class="booking-table">
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Ticket Price:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${Number(ticketPrice).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Luxury Jeep:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${Number(jeepPrice).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Guide:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${Number(guidePrice).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Meals:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${Number(mealPrice).toFixed(2)}</td>
                </tr>
                <tr style="background-color: #ffe0b2;">
                  <td style="padding: 12px; border: 1px solid #ddd;"><strong>TOTAL PRICE:</strong></td>
                  <td style="padding: 12px; border: 1px solid #ddd; text-align: right;"><span class="total-price">$${Number(totalPrice).toFixed(2)}</span></td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p style="font-size: 18px; margin-bottom: 20px;"><strong>⚠️ Action Required: Please review and approve/reject this booking</strong></p>
              <p style="font-size: 14px; color: #666;">Login to your admin panel to manage this booking</p>
            </div>
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
      to: process.env.ADMIN_EMAIL,
      subject: `⏳ PENDING: New Booking ${bookingId} - ${customerName}`,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Admin pending notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending admin pending notification:', error);
    return { success: false, error: error.message };
  }
};

// Send booking pending confirmation to customer
const sendBookingPendingToCustomer = async (bookingData) => {
  try {
    const transporter = createTransporter();
    
    const {
      customerName,
      customerEmail,
      bookingId,
      date,
      timeSlot,
      totalPrice,
      ticketPrice,
      jeepPrice,
      guidePrice,
      mealPrice,
      people,
      visitorType,
      guideOption,
      mealOption
    } = bookingData;

    const timeSlotDisplay = {
      morning: 'Morning Safari (5:30 AM - 9:30 AM)',
      afternoon: 'Afternoon Safari (2:30 PM - 6:30 PM)',
      extended: 'Extended Safari (5:30 AM - 12:00 PM)',
      fullDay: 'Full Day Safari (5:30 AM - 6:30 PM)'
    }[timeSlot] || timeSlot;

    const guideDisplay = {
      driver: 'Driver Only',
      driverGuide: 'Driver Guide',
      separateGuide: 'Driver + Separate Guide'
    }[guideOption] || guideOption;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ff9800; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; }
          .booking-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .booking-table td { padding: 10px; border: 1px solid #ddd; }
          .price-section { background-color: #fff3e0; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .total-price { font-size: 24px; font-weight: bold; color: #e65100; }
          .status-box { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Received - Pending Confirmation</h1>
          </div>

          <div class="content">
            <p>Dear ${customerName},</p>
            <p>Thank you for your booking! We have received your reservation request and it is currently <strong>pending confirmation</strong>.</p>
            
            <div class="status-box">
              <p style="margin: 0; font-size: 16px;"><strong>📋 Current Status: PENDING</strong></p>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Our team will review your booking and confirm within 24 hours. You will receive another email once your booking is confirmed.</p>
            </div>

            <table class="booking-table">
              <tr>
                <td><strong>Booking ID:</strong></td>
                <td>${bookingId}</td>
              </tr>
              <tr>
                <td><strong>Date:</strong></td>
                <td>${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
              <tr>
                <td><strong>Time:</strong></td>
                <td>${timeSlotDisplay}</td>
              </tr>
              <tr>
                <td><strong>Safari Type:</strong></td>
                <td>Private Safari (Luxury Jeep)</td>
              </tr>
              <tr>
                <td><strong>Number of People:</strong></td>
                <td>${people}</td>
              </tr>
              <tr>
                <td><strong>Visitor Type:</strong></td>
                <td>${visitorType === 'foreign' ? 'Foreign Visitor' : 'Local Visitor'}</td>
              </tr>
              <tr>
                <td><strong>Guide:</strong></td>
                <td>${guideDisplay}</td>
              </tr>
              <tr>
                <td><strong>Meals:</strong></td>
                <td>${mealOption === 'with' ? 'Included' : 'Not Included'}</td>
              </tr>
            </table>

            <div class="price-section">
              <h2>Price Breakdown</h2>
              <table class="booking-table">
                <tr>
                  <td><strong>Ticket Price:</strong></td>
                  <td style="text-align: right;">$${Number(ticketPrice).toFixed(2)}</td>
                </tr>
                <tr>
                  <td><strong>Luxury Jeep:</strong></td>
                  <td style="text-align: right;">$${Number(jeepPrice).toFixed(2)}</td>
                </tr>
                <tr>
                  <td><strong>Guide:</strong></td>
                  <td style="text-align: right;">$${Number(guidePrice).toFixed(2)}</td>
                </tr>
                <tr>
                  <td><strong>Meals:</strong></td>
                  <td style="text-align: right;">$${Number(mealPrice).toFixed(2)}</td>
                </tr>
                <tr style="background-color: #ffe0b2;">
                  <td><strong>TOTAL AMOUNT:</strong></td>
                  <td style="text-align: right;"><span class="total-price">$${Number(totalPrice).toFixed(2)}</span></td>
                </tr>
              </table>
            </div>

            <p style="margin-top: 20px; padding: 15px; background-color: #e3f2fd; border-left: 4px solid #2196F3;">
              <strong>📞 What happens next?</strong><br>
              1. Our team will review your booking request<br>
              2. We will confirm availability for your selected date<br>
              3. You will receive a confirmation email with payment details<br>
              4. Please keep your Booking ID <strong>${bookingId}</strong> for reference
            </p>

            <p>For urgent queries, please contact us via WhatsApp or email.</p>
            
            <p>Best regards,<br>Yala Tours Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Yala Tours" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Booking Pending Confirmation - ${bookingId}`,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    console.log('Customer pending notification sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending customer pending notification:', error);
    return { success: false, error: error.message };
  }
};

// Send booking confirmed email to customer
const sendBookingConfirmedToCustomer = async (bookingData) => {
  try {
    const transporter = createTransporter();
    
    const {
      customerName,
      customerEmail,
      bookingId,
      date,
      timeSlot,
      totalPrice,
      people,
      visitorType,
      guideOption,
      mealOption
    } = bookingData;

    const timeSlotDisplay = {
      morning: 'Morning Safari (5:30 AM - 9:30 AM)',
      afternoon: 'Afternoon Safari (2:30 PM - 6:30 PM)',
      extended: 'Extended Safari (5:30 AM - 12:00 PM)',
      fullDay: 'Full Day Safari (5:30 AM - 6:30 PM)'
    }[timeSlot] || timeSlot;

    const guideDisplay = {
      driver: 'Driver Only',
      driverGuide: 'Driver Guide',
      separateGuide: 'Driver + Separate Guide'
    }[guideOption] || guideOption;

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
          .booking-table td { padding: 10px; border: 1px solid #ddd; }
          .price-section { background-color: #e8f5e9; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .total-price { font-size: 24px; font-weight: bold; color: #2e7d32; }
          .confirmed-box { background-color: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Booking Confirmed!</h1>
          </div>

          <div class="content">
            <p>Dear ${customerName},</p>
            <p>Great news! Your booking has been <strong>CONFIRMED</strong>!</p>
            
            <div class="confirmed-box">
              <p style="margin: 0; font-size: 18px;"><strong>✅ Status: CONFIRMED</strong></p>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Your safari experience is secured. We look forward to making your visit memorable!</p>
            </div>

            <h2>Booking Details</h2>
            <table class="booking-table">
              <tr>
                <td><strong>Booking ID:</strong></td>
                <td>${bookingId}</td>
              </tr>
              <tr>
                <td><strong>Date:</strong></td>
                <td>${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
              <tr>
                <td><strong>Time:</strong></td>
                <td>${timeSlotDisplay}</td>
              </tr>
              <tr>
                <td><strong>Safari Type:</strong></td>
                <td>Private Safari (Luxury Jeep)</td>
              </tr>
              <tr>
                <td><strong>Number of People:</strong></td>
                <td>${people}</td>
              </tr>
              <tr>
                <td><strong>Visitor Type:</strong></td>
                <td>${visitorType === 'foreign' ? 'Foreign Visitor' : 'Local Visitor'}</td>
              </tr>
              <tr>
                <td><strong>Guide:</strong></td>
                <td>${guideDisplay}</td>
              </tr>
              <tr>
                <td><strong>Meals:</strong></td>
                <td>${mealOption === 'with' ? 'Included' : 'Not Included'}</td>
              </tr>
              <tr style="background-color: #c8e6c9;">
                <td><strong>Total Amount:</strong></td>
                <td style="text-align: right;"><span class="total-price">$${Number(totalPrice).toFixed(2)}</span></td>
              </tr>
            </table>

            <div style="background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0;">
              <h3 style="margin-top: 0;">💳 Payment Information</h3>
              <p>Our team will contact you shortly with payment details and instructions.</p>
              <p><strong>Please have your Booking ID ready: ${bookingId}</strong></p>
            </div>

            <div style="background-color: #e3f2fd; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
              <h3 style="margin-top: 0;">📋 Before Your Safari</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Arrive 15 minutes before your scheduled time</li>
                <li>Bring your booking confirmation</li>
                <li>Wear comfortable clothing and bring sunscreen</li>
                <li>Camera and binoculars recommended</li>
              </ul>
            </div>

            <p>For any questions, please contact us via WhatsApp or email.</p>
            
            <p>We can't wait to show you the wonders of Yala!</p>
            
            <p>Best regards,<br>Yala Tours Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Yala Tours" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `✅ Booking Confirmed - ${bookingId}`,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    console.log('Customer confirmation email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending customer confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Send booking rejected email to customer
const sendBookingRejectedToCustomer = async (bookingData, reason = '') => {
  try {
    const transporter = createTransporter();
    
    const {
      customerName,
      customerEmail,
      bookingId,
      date,
      timeSlot,
    } = bookingData;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; }
          .rejected-box { background-color: #ffebee; padding: 15px; border-left: 4px solid #f44336; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Update</h1>
          </div>

          <div class="content">
            <p>Dear ${customerName},</p>
            
            <div class="rejected-box">
              <p style="margin: 0; font-size: 18px;"><strong>⚠️ Booking Not Confirmed</strong></p>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Unfortunately, we are unable to confirm your booking at this time.</p>
            </div>

            <p><strong>Booking ID:</strong> ${bookingId}</p>
            <p><strong>Requested Date:</strong> ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}

            <div style="background-color: #e3f2fd; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
              <h3 style="margin-top: 0;">What can you do?</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Try booking for a different date</li>
                <li>Contact us for alternative options</li>
                <li>Check our availability calendar</li>
              </ul>
            </div>

            <p>We apologize for any inconvenience. Please feel free to contact us if you have any questions or would like to explore other options.</p>
            
            <p>Best regards,<br>Yala Tours Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Yala Tours" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Booking Update - ${bookingId}`,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    console.log('Customer rejection email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending customer rejection email:', error);
    return { success: false, error: error.message };
  }
};

// ========================================
// ROOM BOOKING EMAILS
// ========================================



// ========================================
// TAXI BOOKING EMAILS
// ========================================



// ========================================
// ADMIN NOTIFICATION EMAIL
// ========================================



// ========================================
// EXPORTS
// ========================================

export const sendRoomBookingConfirmation = async (booking, room) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: booking.guestDetails.email,
      subject: `Room Booking Confirmation - ${booking.bookingReference}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2c5f2d; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
            .detail-row { padding: 10px 0; border-bottom: 1px solid #ddd; }
            .label { font-weight: bold; color: #2c5f2d; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏨 Room Booking Confirmed!</h1>
            </div>
            
            <div class="content">
              <h2>Dear ${booking.guestDetails.firstName} ${booking.guestDetails.lastName},</h2>
              <p>Thank you for booking with Yala Safari! Your room reservation has been confirmed.</p>
              
              <div class="detail-row">
                <span class="label">Booking Reference:</span> ${booking.bookingReference}
              </div>
              
              <div class="detail-row">
                <span class="label">Room Type:</span> ${room.roomType} - ${room.name}
              </div>
              
              <div class="detail-row">
                <span class="label">Check-In:</span> ${formatDate(booking.checkIn)} at ${room.policies?.checkIn || '2:00 PM'}
              </div>
              
              <div class="detail-row">
                <span class="label">Check-Out:</span> ${formatDate(booking.checkOut)} at ${room.policies?.checkOut || '11:00 AM'}
              </div>
              
              <div class="detail-row">
                <span class="label">Number of Nights:</span> ${booking.numberOfNights}
              </div>
              
              <div class="detail-row">
                <span class="label">Guests:</span> ${booking.guests.adults} Adult(s), ${booking.guests.children || 0} Child(ren)
              </div>
              
              <div class="detail-row">
                <span class="label">Total Amount:</span> ${booking.pricing.currency} ${booking.pricing.totalAmount}
              </div>
              
              ${booking.guestDetails.specialRequests ? `
              <div class="detail-row">
                <span class="label">Special Requests:</span> ${booking.guestDetails.specialRequests}
              </div>
              ` : ''}
              
              <p style="margin-top: 20px;">
                <strong>Contact Information:</strong><br>
                Phone: ${booking.guestDetails.phone}<br>
                Email: ${booking.guestDetails.email}
              </p>
              
              ${room.policies?.cancellationPolicy ? `
              <p style="margin-top: 20px; font-size: 12px; color: #666;">
                <strong>Cancellation Policy:</strong> ${room.policies.cancellationPolicy}
              </p>
              ` : ''}
            </div>
            
            <div class="footer">
              <p>If you have any questions, please contact us at ${process.env.EMAIL_USER}</p>
              <p>Yala Safari Tours © ${new Date().getFullYear()}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Room booking confirmation email sent to:', booking.guestDetails.email);
    
    // Send notification to admin
    if (process.env.ADMIN_EMAIL) {
      await sendAdminNotification('room', booking, room);
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending room booking email:', error);
    throw error;
  }
};

// ========================================
// TAXI BOOKING EMAILS
// ========================================

export const sendTaxiBookingConfirmation = async (booking, taxi) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: booking.customerDetails.email,
      subject: `Taxi Booking Confirmation - ${booking.bookingReference}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ff9800; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
            .detail-row { padding: 10px 0; border-bottom: 1px solid #ddd; }
            .label { font-weight: bold; color: #ff9800; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚕 Taxi Booking Confirmed!</h1>
            </div>
            
            <div class="content">
              <h2>Dear ${booking.customerDetails.firstName} ${booking.customerDetails.lastName},</h2>
              <p>Your taxi has been booked successfully. We'll be there on time!</p>
              
              <div class="detail-row">
                <span class="label">Booking Reference:</span> ${booking.bookingReference}
              </div>
              
              <div class="detail-row">
                <span class="label">Vehicle:</span> ${taxi.vehicleType} - ${taxi.vehicleName}
              </div>
              
              <div class="detail-row">
                <span class="label">Service Type:</span> ${booking.tripDetails.serviceType}
              </div>
              
              <div class="detail-row">
                <span class="label">Pickup Location:</span> ${booking.tripDetails.pickupLocation}
              </div>
              
              <div class="detail-row">
                <span class="label">Dropoff Location:</span> ${booking.tripDetails.dropoffLocation}
              </div>
              
              <div class="detail-row">
                <span class="label">Pickup Date & Time:</span> ${formatDate(booking.tripDetails.pickupDate)} at ${booking.tripDetails.pickupTime}
              </div>
              
              <div class="detail-row">
                <span class="label">Passengers:</span> ${booking.passengers.adults} Adult(s), ${booking.passengers.children || 0} Child(ren)
              </div>
              
              <div class="detail-row">
                <span class="label">Luggage:</span> ${booking.passengers.luggage || 0} Piece(s)
              </div>
              
              ${booking.tripDetails.distance ? `
              <div class="detail-row">
                <span class="label">Distance:</span> ${booking.tripDetails.distance} km
              </div>
              ` : ''}
              
              <div class="detail-row">
                <span class="label">Total Amount:</span> ${booking.pricing.currency} ${booking.pricing.totalAmount}
              </div>
              
              ${booking.specialRequests ? `
              <div class="detail-row">
                <span class="label">Special Requests:</span> ${booking.specialRequests}
              </div>
              ` : ''}
              
              <p style="margin-top: 20px;">
                <strong>Contact Information:</strong><br>
                Phone: ${booking.customerDetails.phone}<br>
                Email: ${booking.customerDetails.email}
              </p>
              
              <p style="margin-top: 20px; background: #fff3cd; padding: 15px; border-left: 4px solid #ff9800;">
                <strong>Important:</strong> Please be ready 10 minutes before the pickup time. 
                Our driver will contact you 30 minutes before arrival.
              </p>
            </div>
            
            <div class="footer">
              <p>If you have any questions, please contact us at ${process.env.EMAIL_USER}</p>
              <p>Yala Safari Tours © ${new Date().getFullYear()}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Taxi booking confirmation email sent to:', booking.customerDetails.email);
    
    // Send notification to admin
    if (process.env.ADMIN_EMAIL) {
      await sendAdminNotification('taxi', booking, taxi);
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending taxi booking email:', error);
    throw error;
  }
};

// ========================================
// ADMIN NOTIFICATION EMAIL
// ========================================

const sendAdminNotification = async (type, booking, item) => {
  try {
    const transporter = createTransporter();
    let subject, content;
    
    if (type === 'room') {
      subject = `New Room Booking: ${booking.bookingReference}`;
      content = `
        <h2>New Room Booking Received</h2>
        <p><strong>Guest:</strong> ${booking.guestDetails.firstName} ${booking.guestDetails.lastName}</p>
        <p><strong>Room:</strong> ${item.name}</p>
        <p><strong>Check-In:</strong> ${formatDate(booking.checkIn)}</p>
        <p><strong>Check-Out:</strong> ${formatDate(booking.checkOut)}</p>
        <p><strong>Total:</strong> ${booking.pricing.currency} ${booking.pricing.totalAmount}</p>
        <p><strong>Contact:</strong> ${booking.guestDetails.email} | ${booking.guestDetails.phone}</p>
      `;
    } else if (type === 'taxi') {
      subject = `New Taxi Booking: ${booking.bookingReference}`;
      content = `
        <h2>New Taxi Booking Received</h2>
        <p><strong>Customer:</strong> ${booking.customerDetails.firstName} ${booking.customerDetails.lastName}</p>
        <p><strong>Vehicle:</strong> ${item.vehicleName}</p>
        <p><strong>Pickup:</strong> ${booking.tripDetails.pickupLocation} on ${formatDate(booking.tripDetails.pickupDate)} at ${booking.tripDetails.pickupTime}</p>
        <p><strong>Dropoff:</strong> ${booking.tripDetails.dropoffLocation}</p>
        <p><strong>Total:</strong> ${booking.pricing.currency} ${booking.pricing.totalAmount}</p>
        <p><strong>Contact:</strong> ${booking.customerDetails.email} | ${booking.customerDetails.phone}</p>
      `;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
            h2 { color: #2c5f2d; }
            p { margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            ${content}
            <p style="margin-top: 20px; color: #666; font-size: 12px;">
              This is an automated notification from Yala Safari booking system.
            </p>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Admin notification sent');
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
    return { success: false, error: error.message };
  }
};

export {
  sendBookingPendingToAdmin,
  sendBookingPendingToCustomer,
  sendBookingConfirmedToCustomer,
  sendBookingRejectedToCustomer,
  
};