import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
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
      status,
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

    // Format time slot display
    const timeSlotDisplay = {
      morning: 'Morning Safari (5:30 AM - 9:30 AM)',
      afternoon: 'Afternoon Safari (2:30 PM - 6:30 PM)',
      extended: 'Extended Safari (5:30 AM - 12:00 PM)',
      fullDay: 'Full Day Safari (5:30 AM - 6:30 PM)'
    }[timeSlot] || timeSlot;

    // Format guide option display
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
                <td style="padding: 8px; border: 1px solid #ddd;"><span style="background-color: #fff3cd; padding: 5px 10px; border-radius: 3px;">${status}</span></td>
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
                <tr style="background-color: #c8e6c9;">
                  <td style="padding: 12px; border: 1px solid #ddd;"><strong>TOTAL PRICE:</strong></td>
                  <td style="padding: 12px; border: 1px solid #ddd; text-align: right;"><span class="total-price">$${Number(totalPrice).toFixed(2)}</span></td>
                </tr>
              </table>
              
              <p style="margin-top: 15px; font-size: 12px; color: #666;">
                <strong>Note:</strong> Total = Ticket ($${Number(ticketPrice).toFixed(2)}) + Jeep ($${Number(jeepPrice).toFixed(2)}) + Guide ($${Number(guidePrice).toFixed(2)}) + Meals ($${Number(mealPrice).toFixed(2)})
              </p>
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
      to: process.env.ADMIN_EMAIL,
      subject: `🎉 New Booking: ${bookingId} - ${customerName}`,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Admin email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending admin email:', error);
    return { success: false, error: error.message };
  }
};

// Send booking confirmation email to customer
export const sendBookingConfirmationToCustomer = async (bookingData) => {
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

    // Format time slot display
    const timeSlotDisplay = {
      morning: 'Morning Safari (5:30 AM - 9:30 AM)',
      afternoon: 'Afternoon Safari (2:30 PM - 6:30 PM)',
      extended: 'Extended Safari (5:30 AM - 12:00 PM)',
      fullDay: 'Full Day Safari (5:30 AM - 6:30 PM)'
    }[timeSlot] || timeSlot;

    // Format guide option display
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
                <tr style="background-color: #c8e6c9;">
                  <td><strong>TOTAL AMOUNT:</strong></td>
                  <td style="text-align: right;"><span class="total-price">$${Number(totalPrice).toFixed(2)}</span></td>
                </tr>
              </table>
            </div>

            <p style="margin-top: 20px; padding: 15px; background-color: #fff9e6; border-left: 4px solid #ffc107;">
              <strong>📞 Next Steps:</strong><br>
              Our team will contact you shortly with payment details and further instructions.<br>
              Please keep your Booking ID <strong>${bookingId}</strong> for reference.
            </p>

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
    console.log('Customer confirmation email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending customer email:', error);
    return { success: false, error: error.message };
  }
};