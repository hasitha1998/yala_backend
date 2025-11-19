import Booking from "../models/Booking.js";
import Package from "../models/Package.js";
import asyncHandler from "express-async-handler";
import { 
  sendBookingPendingToAdmin, 
  sendBookingPendingToCustomer,
  sendBookingConfirmedToCustomer,
  sendBookingRejectedToCustomer
} from "../config/emailConfig.js";

// @desc Create new booking (PRIVATE LUXURY ONLY)
// @route POST /api/bookings
// @access Public
export const createBooking = asyncHandler(async (req, res) => {
  try {
    console.log('📝 Creating booking with data:', req.body);
    
    const bookingData = req.body;

    // Validate required fields
    const requiredFields = ['customerName', 'customerEmail', 'customerPhone', 'date', 'timeSlot', 'visitorType', 'people', 'guideOption'];
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`
        });
      }
    }

    // ✅ CHECK DATE AVAILABILITY BEFORE CREATING BOOKING
    const requestedDate = new Date(bookingData.date);
    requestedDate.setHours(0, 0, 0, 0);

    const existingBooking = await Booking.findOne({
      date: requestedDate,
      status: { $in: ['pending', 'confirmed'] }, // Check for pending or confirmed bookings
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This date is already booked or has a pending booking. Please choose another date.',
        bookedDate: requestedDate
      });
    }

    // FORCE private and luxury (only options available)
    bookingData.reservationType = 'private';
    bookingData.jeepType = 'luxury';

    // Validate visitor-specific fields
    if (bookingData.visitorType === 'foreign' && !bookingData.passportNumber) {
      return res.status(400).json({
        success: false,
        message: 'Passport number is required for foreign visitors'
      });
    }

    if (bookingData.visitorType === 'local' && !bookingData.nicNumber) {
      return res.status(400).json({
        success: false,
        message: 'NIC number is required for local visitors'
      });
    }

    // ✅ USE PRICES FROM FRONTEND (already calculated with dynamic meal prices)
    const pricing = {
      ticketPrice: Number(bookingData.ticketPrice) || 0,
      jeepPrice: Number(bookingData.jeepPrice) || 0,
      guidePrice: Number(bookingData.guidePrice) || 0,
      mealPrice: Number(bookingData.mealPrice) || 0,
      totalPrice: Number(bookingData.totalPrice) || 0,
    };

    console.log('💰 Using Frontend Calculated Prices:');
    console.log('  Ticket:', pricing.ticketPrice);
    console.log('  Luxury Jeep:', pricing.jeepPrice);
    console.log('  Guide:', pricing.guidePrice);
    console.log('  Meal:', pricing.mealPrice);
    console.log('  TOTAL:', pricing.totalPrice);

    // Validate pricing
    if (pricing.totalPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid total price'
      });
    }

    // Generate unique booking ID
    const bookingId = `YALA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create booking object with PENDING status
    const booking = await Booking.create({
      bookingId,
      customerName: bookingData.customerName,
      customerEmail: bookingData.customerEmail,
      customerPhone: bookingData.customerPhone,
      reservationType: 'private',
      park: bookingData.park,
      block: bookingData.block,
      jeepType: 'luxury',
      timeSlot: bookingData.timeSlot,
      guideOption: bookingData.guideOption,
      visitorType: bookingData.visitorType,
      date: bookingData.date,
      people: bookingData.people,
      mealOption: bookingData.mealOption || 'without',
      vegOption: bookingData.vegOption,
      includeEggs: bookingData.includeEggs || false,
      includeLunch: bookingData.includeLunch || false,
      includeBreakfast: bookingData.includeBreakfast || false,
      selectedBreakfastItems: bookingData.selectedBreakfastItems || [],
      selectedLunchItems: bookingData.selectedLunchItems || [],
      pickupLocation: bookingData.pickupLocation,
      hotelWhatsapp: bookingData.hotelWhatsapp,
      accommodation: bookingData.accommodation,
      passportNumber: bookingData.passportNumber,
      nicNumber: bookingData.nicNumber,
      localContact: bookingData.localContact,
      localAccommodation: bookingData.localAccommodation,
      specialRequests: bookingData.specialRequests,
      packageId: bookingData.packageId,
      packageName: bookingData.packageName,
      ...pricing,
      status: 'pending', // ✅ Always starts as pending
      paymentStatus: 'pending',
    });

    console.log('✅ Booking created with PENDING status:', booking.bookingId);

    // Prepare email data
    const emailData = {
      bookingId: booking.bookingId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      reservationType: 'private',
      date: booking.date,
      timeSlot: booking.timeSlot,
      people: booking.people,
      jeepType: 'luxury',
      guideOption: booking.guideOption,
      mealOption: booking.mealOption,
      includeBreakfast: booking.includeBreakfast,
      includeLunch: booking.includeLunch,
      selectedBreakfastItems: booking.selectedBreakfastItems,
      selectedLunchItems: booking.selectedLunchItems,
      vegOption: booking.vegOption,
      includeEggs: booking.includeEggs,
      visitorType: booking.visitorType,
      totalPrice: booking.totalPrice,
      ticketPrice: booking.ticketPrice,
      jeepPrice: booking.jeepPrice,
      guidePrice: booking.guidePrice,
      mealPrice: booking.mealPrice,
      status: booking.status,
      createdAt: booking.createdAt,
    };

    // Send PENDING emails (don't wait)
    sendBookingPendingToAdmin(emailData).catch(err => {
      console.error('Failed to send admin pending email:', err);
    });

    sendBookingPendingToCustomer(emailData).catch(err => {
      console.error('Failed to send customer pending email:', err);
    });

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully! Awaiting confirmation.',
      booking: {
        bookingId: booking.bookingId,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        date: booking.date,
        timeSlot: booking.timeSlot,
        totalPrice: booking.totalPrice,
        status: booking.status, // Will be 'pending'
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

// @desc Approve booking (Admin only)
// @route PATCH /api/bookings/:id/approve
// @access Private/Admin
export const approveBooking = asyncHandler(async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve booking with status: ${booking.status}`
      });
    }

    // Update status to confirmed
    booking.status = 'confirmed';
    const updatedBooking = await booking.save();

    console.log('✅ Booking approved:', booking.bookingId);

    // Send confirmation email to customer
    const emailData = {
      bookingId: booking.bookingId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      date: booking.date,
      timeSlot: booking.timeSlot,
      people: booking.people,
      visitorType: booking.visitorType,
      guideOption: booking.guideOption,
      mealOption: booking.mealOption,
      totalPrice: booking.totalPrice,
    };

    sendBookingConfirmedToCustomer(emailData).catch(err => {
      console.error('Failed to send confirmation email:', err);
    });

    res.json({
      success: true,
      message: 'Booking approved successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Error approving booking:', error);
    res.status(400);
    throw new Error(error.message || 'Failed to approve booking');
  }
});

// @desc Reject booking (Admin only)
// @route PATCH /api/bookings/:id/reject
// @access Private/Admin
export const rejectBooking = asyncHandler(async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject booking with status: ${booking.status}`
      });
    }

    // Update status to cancelled with reason
    booking.status = 'cancelled';
    if (reason) {
      booking.adminNotes = reason;
    }
    const updatedBooking = await booking.save();

    console.log('❌ Booking rejected:', booking.bookingId);

    // Send rejection email to customer
    const emailData = {
      bookingId: booking.bookingId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      date: booking.date,
      timeSlot: booking.timeSlot,
    };

    sendBookingRejectedToCustomer(emailData, reason).catch(err => {
      console.error('Failed to send rejection email:', err);
    });

    res.json({
      success: true,
      message: 'Booking rejected successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(400);
    throw new Error(error.message || 'Failed to reject booking');
  }
});

// @desc Check date availability
// @route GET /api/bookings/check-availability/:date
// @access Public

export const checkDateAvailability = asyncHandler(async (req, res) => {
  try {
    const requestedDate = new Date(req.params.date);
    requestedDate.setHours(0, 0, 0, 0);

    // Check if there's any pending or confirmed booking for this date
    const existingBooking = await Booking.findOne({
      date: requestedDate,
      status: { $in: ['pending', 'confirmed'] },
    }).select('bookingId status date timeSlot');

    if (existingBooking) {
      return res.json({
        success: true,
        available: false,
        message: 'Date is not available',
        booking: {
          bookingId: existingBooking.bookingId,
          status: existingBooking.status,
          date: existingBooking.date,
          timeSlot: existingBooking.timeSlot
        }
      });
    }

    res.json({
      success: true,
      available: true,
      message: 'Date is available for booking',
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(400);
    throw new Error(error.message || 'Failed to check availability');
  }
});

// @desc Get booked dates (for calendar display)
// @route GET /api/bookings/booked-dates
// @access Public
export const getBookedDates = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {
      status: { $in: ['pending', 'confirmed'] }
    };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const bookings = await Booking.find(query)
      .select('date status bookingId timeSlot')
      .sort({ date: 1 });

    // Group bookings by date
    const bookedDates = bookings.map(booking => ({
      date: booking.date,
      status: booking.status,
      bookingId: booking.bookingId,
      timeSlot: booking.timeSlot,
    }));

    res.json({
      success: true,
      count: bookedDates.length,
      bookedDates,
    });
  } catch (error) {
    console.error('Error getting booked dates:', error);
    res.status(400);
    throw new Error(error.message || 'Failed to get booked dates');
  }
});

// @desc Get all bookings
// @route GET /api/bookings
// @access Private/Admin
export const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 });
  res.json({
    success: true,
    count: bookings.length,
    bookings,
  });
});

// @desc Get pending bookings (Admin)
// @route GET /api/bookings/pending
// @access Private/Admin
export const getPendingBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ status: 'pending' }).sort({ createdAt: -1 });
  res.json({
    success: true,
    count: bookings.length,
    bookings,
  });
});

// @desc Get booking by ID or bookingId
// @route GET /api/bookings/:id
// @access Public
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({
    $or: [
      { bookingId: req.params.id },
      { _id: req.params.id }
    ]
  }).populate('packageId', 'name description');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  res.json({
    success: true,
    booking,
  });
});

// @desc Update booking
// @route PUT /api/bookings/:id
// @access Private/Admin
export const updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  const { status, paymentStatus, adminNotes } = req.body;

  if (status) booking.status = status;
  if (paymentStatus) booking.paymentStatus = paymentStatus;
  if (adminNotes !== undefined) booking.adminNotes = adminNotes;

  const updatedBooking = await booking.save();

  res.json({
    success: true,
    message: 'Booking updated successfully',
    booking: updatedBooking,
  });
});

// @desc Delete booking
// @route DELETE /api/bookings/:id
// @access Private/Admin
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

// @desc Get bookings by date range
// @route GET /api/bookings/date-range
// @access Private/Admin
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

// @desc Calculate price for booking (PRIVATE LUXURY ONLY)
// @route POST /api/bookings/calculate-price
// @access Public
export const calculatePrice = asyncHandler(async (req, res) => {
  try {
    const { packageId, timeSlot, guideOption, visitorType, people, mealOption, includeBreakfast, includeLunch, selectedBreakfastItems, selectedLunchItems, vegOption, includeEggs } = req.body;

    // Validate required fields
    if (!timeSlot || !guideOption || !visitorType || !people) {
      res.status(400);
      throw new Error('Missing required fields for price calculation');
    }

    // Get package for pricing
    let pkg;
    if (packageId) {
      pkg = await Package.findById(packageId);
    } else {
      pkg = await Package.findOne({ isActive: true }).sort({ updatedAt: -1 });
    }

    if (!pkg) {
      res.status(404);
      throw new Error('Package pricing not found');
    }

    let ticketPrice = 0;
    let jeepPrice = 0;
    let guidePrice = 0;
    let mealPrice = 0;

    // Ticket price
    const ticketPricePerPerson = visitorType === 'foreign' ? pkg.tickets.foreign : pkg.tickets.local;
    ticketPrice = ticketPricePerPerson * people;

    // Luxury jeep price (only option)
    jeepPrice = pkg.jeep.luxury?.[timeSlot] || 0;

    // Guide price
    guidePrice = pkg.guide[guideOption] || 0;

    // Meal price - use dynamic meal options from package
    if (mealOption === 'with' && pkg.mealOptions) {
      if (includeBreakfast && selectedBreakfastItems && selectedBreakfastItems.length > 0) {
        const breakfastTotal = pkg.mealOptions.breakfast
          .filter(item => {
            if (vegOption === 'veg' && !item.isVegetarian) return false;
            return selectedBreakfastItems.includes(item.name);
          })
          .reduce((sum, item) => sum + (item.price || 0), 0);
        
        mealPrice += breakfastTotal * people;

        if (vegOption === 'veg' && includeEggs) {
          mealPrice += 1.5 * people;
        }
      }

      if (includeLunch && selectedLunchItems && selectedLunchItems.length > 0) {
        const lunchTotal = pkg.mealOptions.lunch
          .filter(item => {
            if (vegOption === 'veg' && !item.isVegetarian) return false;
            return selectedLunchItems.includes(item.name);
          })
          .reduce((sum, item) => sum + (item.price || 0), 0);
        
        mealPrice += lunchTotal * people;
      }
    }

    const totalPrice = ticketPrice + jeepPrice + guidePrice + mealPrice;

    res.json({
      success: true,
      pricing: {
        ticketPrice: Number(ticketPrice.toFixed(2)),
        jeepPrice: Number(jeepPrice.toFixed(2)),
        guidePrice: Number(guidePrice.toFixed(2)),
        mealPrice: Number(mealPrice.toFixed(2)),
        totalPrice: Number(totalPrice.toFixed(2)),
      },
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc Get user bookings by email or phone
// @route GET /api/bookings/user
// @access Public
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

// @desc Update payment status
// @route PATCH /api/bookings/:id/payment-status
// @access Private/Admin
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

// @desc Get bookings by specific date
// @route GET /api/bookings/date/:date
// @access Private/Admin
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

// @desc Get booking statistics
// @route GET /api/bookings/stats/overview
// @access Private/Admin
export const getBookingStats = asyncHandler(async (req, res) => {
  const totalBookings = await Booking.countDocuments();
  const pendingBookings = await Booking.countDocuments({ status: 'pending' });
  const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
  const completedBookings = await Booking.countDocuments({ status: 'completed' });

  const totalRevenue = await Booking.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);

  res.json({
    success: true,
    stats: {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
    },
  });
});