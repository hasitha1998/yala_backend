import Booking from "../models/Booking.js";
import Package from "../models/Package.js";
import asyncHandler from "express-async-handler";
import { sendBookingEmailToAdmin, sendBookingConfirmationToCustomer } from "../config/emailConfig.js";

// Helper function to calculate pricing based on reservation type
const calculatePricing = async (bookingData) => {
  try {
    // Get current package pricing from database
    const pkg = await Package.findOne().sort({ updatedAt: -1 });
    if (!pkg) {
      throw new Error("Package pricing not found. Please contact administrator.");
    }

    let ticketPrice = 0;
    let jeepPrice = 0;
    let guidePrice = 0;
    let mealPrice = 0;
    let totalPrice = 0;

    const {
      reservationType,
      jeepType,
      timeSlot,
      people,
      selectedSeats,
      guideOption,
      mealOption,
      includeBreakfast,
      includeLunch,
      selectedBreakfastItems,
      selectedLunchItems,
      vegOption,
      includeEggs,
      visitorType
    } = bookingData;

    // ✅ MATCH FRONTEND EXACTLY - Use same ticket prices as frontend
    const TICKET_PRICE_FOREIGN = 15; // Changed from 2 to 15
    const TICKET_PRICE_LOCAL = 5;     // Changed from 1 to 5

    const ticketPricePerPerson = visitorType === 'foreign'
      ? TICKET_PRICE_FOREIGN
      : TICKET_PRICE_LOCAL;

    console.log('💰 Backend Pricing Calculation:');
    console.log('   Visitor Type:', visitorType);
    console.log('   Ticket Price Per Person:', ticketPricePerPerson);

    // PRIVATE RESERVATION CALCULATION
    if (reservationType === 'private') {
      // Ticket price
      ticketPrice = ticketPricePerPerson * people;
      console.log('   Ticket Total:', ticketPrice);
      
      // Jeep price from database
      jeepPrice = pkg.jeep[jeepType]?.[timeSlot] || 0;
      console.log('   Jeep Price:', jeepPrice);
      
      // Guide price from database
      guidePrice = pkg.guide[guideOption] || 0;
      console.log('   Guide Price:', guidePrice);
      
      // ✅ DETAILED MEAL CALCULATION (matching frontend exactly)
      if (mealOption === 'with') {
        // Breakfast menu items
        const breakfastMenuVeg = [
          { name: "Fresh tropical fruits", price: 2 },
          { name: "Toast & butter/jam", price: 1 },
          { name: "Local Sri Lankan pancakes", price: 1.5 },
          { name: "Tea or coffee", price: 1 },
        ];

        const breakfastMenuNonVeg = [
          { name: "Fresh tropical fruits", price: 2 },
          { name: "Pasta (any style)", price: 1.5 },
          { name: "Sandwiches", price: 1 },
          { name: "Local Sri Lankan pancakes", price: 1.5 },
          { name: "Tea or coffee", price: 1 },
        ];

        // Lunch menu items
        const lunchMenuVeg = [
          { name: "Rice & curry (veg)", price: 3 },
          { name: "Fresh salad", price: 1.5 },
          { name: "Seasonal fruit dessert", price: 1.5 },
          { name: "Bottled water & soft drink", price: 1 },
        ];

        const lunchMenuNonVeg = [
          { name: "Rice & curry (non-veg)", price: 3 },
          { name: "Grilled chicken or fish", price: 2.5 },
          { name: "Fresh salad", price: 1.5 },
          { name: "Seasonal fruit dessert", price: 1.5 },
          { name: "Bottled water & soft drink", price: 1 },
        ];

        // Calculate breakfast cost
        if (includeBreakfast && selectedBreakfastItems && selectedBreakfastItems.length > 0) {
          const breakfastMenu = vegOption === 'veg' ? breakfastMenuVeg : breakfastMenuNonVeg;
          
          const breakfastTotal = breakfastMenu
            .filter(item => selectedBreakfastItems.includes(item.name))
            .reduce((sum, item) => sum + item.price, 0);
          
          mealPrice += breakfastTotal * people;
          
          // Add eggs if veg option and includeEggs is true
          if (vegOption === 'veg' && includeEggs) {
            mealPrice += 1.5 * people;
          }
          
          console.log('   Breakfast Price:', breakfastTotal * people);
        }
        
        // Calculate lunch cost
        if (includeLunch && selectedLunchItems && selectedLunchItems.length > 0) {
          const lunchMenu = vegOption === 'veg' ? lunchMenuVeg : lunchMenuNonVeg;
          
          const lunchTotal = lunchMenu
            .filter(item => selectedLunchItems.includes(item.name))
            .reduce((sum, item) => sum + item.price, 0);
          
          mealPrice += lunchTotal * people;
          console.log('   Lunch Price:', lunchTotal * people);
        }
      }
      
      console.log('   Meal Total:', mealPrice);
      
      totalPrice = ticketPrice + jeepPrice + guidePrice + mealPrice;
    }
    // SHARED RESERVATION CALCULATION
    else if (reservationType === 'shared') {
      const seatsBooked = parseInt(selectedSeats) || parseInt(people);
      
      if (seatsBooked < 1 || seatsBooked > 7) {
        throw new Error("Invalid number of seats. Must be between 1 and 7.");
      }

      ticketPrice = ticketPricePerPerson * seatsBooked;
      
      // Shared jeep pricing
      jeepPrice = (pkg.shared[Math.min(seatsBooked, 7)] || 0) * seatsBooked;
      
      guidePrice = pkg.guide[guideOption] || 0;
      
      // Meal calculations (simplified for shared)
      if (mealOption === 'with') {
        if (includeBreakfast) {
          mealPrice += pkg.meals.breakfast * seatsBooked;
        }
        if (includeLunch) {
          mealPrice += pkg.meals.lunch * seatsBooked;
        }
      }
      
      totalPrice = ticketPrice + jeepPrice + guidePrice + mealPrice;
    }

    console.log('✅ FINAL BACKEND CALCULATION:');
    console.log('   Ticket Price:', ticketPrice);
    console.log('   Jeep Price:', jeepPrice);
    console.log('   Guide Price:', guidePrice);
    console.log('   Meal Price:', mealPrice);
    console.log('   TOTAL:', totalPrice);

    return {
      ticketPrice: Number(ticketPrice.toFixed(2)),
      jeepPrice: Number(jeepPrice.toFixed(2)),
      guidePrice: Number(guidePrice.toFixed(2)),
      mealPrice: Number(mealPrice.toFixed(2)),
      totalPrice: Number(totalPrice.toFixed(2))
    };
  } catch (error) {
    console.error('❌ Pricing calculation error:', error);
    throw new Error(`Pricing calculation failed: ${error.message}`);
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public
export const createBooking = asyncHandler(async (req, res) => {
  try {
    console.log('📝 Creating booking with data:', req.body);
    
    const bookingData = req.body;

    // Validate required fields
    const requiredFields = ['customerName', 'customerEmail', 'customerPhone', 'reservationType', 'date', 'timeSlot', 'visitorType'];
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`
        });
      }
    }

    // Calculate pricing
    const pricing = await calculatePricing(bookingData);

    // Generate unique booking ID
    const bookingId = `YALA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create booking object
    const booking = await Booking.create({
      bookingId,
      ...bookingData,
      ...pricing,
      status: 'pending',
      paymentStatus: 'pending',
    });

    // Prepare email data
    const emailData = {
      bookingId: booking.bookingId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      reservationType: booking.reservationType,
      date: booking.date,
      timeSlot: booking.timeSlot,
      people: booking.people,
      selectedSeats: booking.selectedSeats,
      jeepType: booking.jeepType,
      guideOption: booking.guideOption,
      mealOption: booking.mealOption,
      includeBreakfast: booking.includeBreakfast,
      includeLunch: booking.includeLunch,
      visitorType: booking.visitorType,
      totalPrice: booking.totalPrice,
      ticketPrice: booking.ticketPrice,
      jeepPrice: booking.jeepPrice,
      guidePrice: booking.guidePrice,
      mealPrice: booking.mealPrice,
      status: booking.status,
      createdAt: booking.createdAt,
    };

    // Send emails (don't wait)
    sendBookingEmailToAdmin(emailData).catch(err => {
      console.error('Failed to send admin email:', err);
    });

    sendBookingConfirmationToCustomer(emailData).catch(err => {
      console.error('Failed to send customer email:', err);
    });

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully!',
      booking: {
        bookingId: booking.bookingId,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        date: booking.date,
        timeSlot: booking.timeSlot,
        totalPrice: booking.totalPrice,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error('❌ Booking creation error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create booking'
    });
  }
});

// ... keep all other functions exactly as they are ...
export const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 });
  res.json({
    success: true,
    count: bookings.length,
    bookings,
  });
});

export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ 
    $or: [
      { bookingId: req.params.id },
      { _id: req.params.id }
    ]
  });

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  res.json({
    success: true,
    booking,
  });
});

export const updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  const { status, paymentStatus, adminNotes } = req.body;

  if (status) booking.status = status;
  if (paymentStatus) booking.paymentStatus = paymentStatus;
  if (adminNotes) booking.adminNotes = adminNotes;

  const updatedBooking = await booking.save();

  res.json({
    success: true,
    message: 'Booking updated successfully',
    booking: updatedBooking,
  });
});

export const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  await booking.deleteOne();

  res.json({
    success: true,
    message: 'Booking deleted successfully',
  });
});

export const getBookingsByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const query = {};
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const bookings = await Booking.find(query).sort({ date: 1 });

  res.json({
    success: true,
    count: bookings.length,
    bookings,
  });
});

export const calculatePrice = asyncHandler(async (req, res) => {
  try {
    const bookingData = req.body;

    const requiredFields = ['reservationType', 'timeSlot', 'visitorType'];
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        res.status(400);
        throw new Error(`Missing required field for price calculation: ${field}`);
      }
    }

    const pricing = await calculatePricing(bookingData);

    res.json({
      success: true,
      pricing: {
        ticketPrice: pricing.ticketPrice,
        jeepPrice: pricing.jeepPrice,
        guidePrice: pricing.guidePrice,
        mealPrice: pricing.mealPrice,
        totalPrice: pricing.totalPrice,
      },
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export const getUserBookings = asyncHandler(async (req, res) => {
  const { email, phone } = req.query;

  if (!email && !phone) {
    res.status(400);
    throw new Error('Please provide email or phone number');
  }

  const query = {};
  if (email) query.customerEmail = email;
  if (phone) query.customerPhone = phone;

  const bookings = await Booking.find(query).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: bookings.length,
    bookings,
  });
});

export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  const { paymentStatus } = req.body;

  if (!paymentStatus) {
    res.status(400);
    throw new Error('Payment status is required');
  }

  booking.paymentStatus = paymentStatus;
  const updatedBooking = await booking.save();

  res.json({
    success: true,
    message: 'Payment status updated successfully',
    booking: updatedBooking,
  });
});

export const getBookingsByDate = asyncHandler(async (req, res) => {
  const { date } = req.params;
  
  if (!date) {
    res.status(400);
    throw new Error('Date parameter is required');
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const bookings = await Booking.find({
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: bookings.length,
    date: date,
    bookings,
  });
});