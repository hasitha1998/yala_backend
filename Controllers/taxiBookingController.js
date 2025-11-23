const TaxiBooking = require('../models/TaxiBooking');
const Taxi = require('../models/Taxi');
const { sendTaxiBookingConfirmation } = require('../services/emailService');

// @desc    Create taxi booking
// @route   POST /api/taxi-bookings
// @access  Public
const createTaxiBooking = async (req, res) => {
  try {
    const bookingData = req.body;
    
    // Verify taxi exists and is available
    const taxi = await Taxi.findById(bookingData.taxi);
    
    if (!taxi) {
      return res.status(404).json({
        success: false,
        message: 'Taxi not found'
      });
    }
    
    if (!taxi.isActive || !taxi.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Taxi is not available for booking'
      });
    }
    
    // Calculate total amount based on service type
    let totalAmount = taxi.pricing.basePrice;
    
    if (bookingData.tripDetails.serviceType === 'Airport Transfer') {
      totalAmount = taxi.pricing.airportTransfer || taxi.pricing.basePrice;
    } else if (bookingData.tripDetails.serviceType === 'Full Day Rental') {
      totalAmount = taxi.pricing.fullDayRate || taxi.pricing.basePrice;
    } else if (bookingData.tripDetails.distance) {
      // Point to Point or Custom - calculate by distance
      totalAmount = taxi.pricing.basePrice + (bookingData.tripDetails.distance * taxi.pricing.pricePerKm);
    }
    
    bookingData.pricing = {
      basePrice: taxi.pricing.basePrice,
      distanceCharge: bookingData.tripDetails.distance 
        ? bookingData.tripDetails.distance * taxi.pricing.pricePerKm 
        : 0,
      additionalCharges: bookingData.pricing?.additionalCharges || 0,
      totalAmount: totalAmount + (bookingData.pricing?.additionalCharges || 0),
      currency: taxi.pricing.currency
    };
    
    // Create booking
    const booking = await TaxiBooking.create(bookingData);
    
    // Populate taxi details
    await booking.populate('taxi');
    
    // Send confirmation email
    try {
      await sendTaxiBookingConfirmation(booking, taxi);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      // Continue even if email fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Taxi booking created successfully. Confirmation email sent!',
      data: booking
    });
  } catch (error) {
    console.error('❌ Error creating taxi booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating taxi booking',
      error: error.message
    });
  }
};

// @desc    Get all taxi bookings
// @route   GET /api/admin/taxi-bookings
// @access  Private (Admin)
const getAllTaxiBookings = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status) {
      query.bookingStatus = status;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query['tripDetails.pickupDate'] = {};
      if (startDate) query['tripDetails.pickupDate'].$gte = new Date(startDate);
      if (endDate) query['tripDetails.pickupDate'].$lte = new Date(endDate);
    }
    
    const bookings = await TaxiBooking.find(query)
      .populate('taxi')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('❌ Error fetching taxi bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching taxi bookings',
      error: error.message
    });
  }
};

// @desc    Get single taxi booking
// @route   GET /api/taxi-bookings/:id
// @access  Public
const getTaxiBookingById = async (req, res) => {
  try {
    const booking = await TaxiBooking.findById(req.params.id).populate('taxi');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('❌ Error fetching taxi booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching taxi booking',
      error: error.message
    });
  }
};

// @desc    Get booking by reference
// @route   GET /api/taxi-bookings/reference/:ref
// @access  Public
const getTaxiBookingByReference = async (req, res) => {
  try {
    const booking = await TaxiBooking.findOne({ 
      bookingReference: req.params.ref 
    }).populate('taxi');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('❌ Error fetching taxi booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching taxi booking',
      error: error.message
    });
  }
};

// @desc    Update taxi booking
// @route   PUT /api/admin/taxi-bookings/:id
// @access  Private (Admin)
const updateTaxiBooking = async (req, res) => {
  try {
    const booking = await TaxiBooking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('taxi');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('❌ Error updating taxi booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating taxi booking',
      error: error.message
    });
  }
};

// @desc    Update booking status
// @route   PATCH /api/admin/taxi-bookings/:id/status
// @access  Private (Admin)
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingStatus, paymentStatus } = req.body;
    
    const updateFields = {};
    if (bookingStatus) updateFields.bookingStatus = bookingStatus;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    
    const booking = await TaxiBooking.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('taxi');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('❌ Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating booking status',
      error: error.message
    });
  }
};

// @desc    Cancel taxi booking
// @route   DELETE /api/admin/taxi-bookings/:id
// @access  Private (Admin)
const cancelTaxiBooking = async (req, res) => {
  try {
    const booking = await TaxiBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'cancelled';
    await booking.save();
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('❌ Error cancelling taxi booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling taxi booking',
      error: error.message
    });
  }
};

module.exports = {
  createTaxiBooking,
  getAllTaxiBookings,
  getTaxiBookingById,
  getTaxiBookingByReference,
  updateTaxiBooking,
  updateBookingStatus,
  cancelTaxiBooking
};