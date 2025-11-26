import RoomBooking from '../models/RoomBooking.js';
import Room from '../models/Room.js';
import { sendRoomBookingConfirmation } from '../config/emailConfig.js';

// @desc    Create room booking
// @route   POST /api/room-bookings
// @access  Public
export const createRoomBooking = async (req, res) => {
  try {
    const bookingData = req.body;
    
    // Verify room exists and is available
    const room = await Room.findById(bookingData.room);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    if (!room.isActive || !room.availability.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for booking'
      });
    }
    
    // Verify capacity
    const totalGuests = bookingData.guests.adults + (bookingData.guests.children || 0);
    const roomCapacity = room.capacity.adults + (room.capacity.children || 0);
    
    if (totalGuests > roomCapacity) {
      return res.status(400).json({
        success: false,
        message: `Room capacity exceeded. Maximum capacity is ${roomCapacity} guests.`
      });
    }
    
    // Calculate total amount
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const diffTime = Math.abs(checkOut - checkIn);
    const numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (numberOfNights < 1) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }
    
    const totalAmount = room.pricing.perNight * numberOfNights;
    
    bookingData.numberOfNights = numberOfNights;
    bookingData.pricing = {
      roomRate: room.pricing.perNight,
      totalAmount: totalAmount,
      currency: room.pricing.currency
    };
    
    // Create booking
    const booking = await RoomBooking.create(bookingData);
    
    // Populate room details
    await booking.populate('room');
    
    // Send confirmation email
    try {
      await sendRoomBookingConfirmation(booking, room);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      // Continue even if email fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Room booking created successfully. Confirmation email sent!',
      data: booking
    });
  } catch (error) {
    console.error('❌ Error creating room booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating room booking',
      error: error.message
    });
  }
};

// @desc    Get all room bookings
// @route   GET /api/admin/room-bookings
// @access  Private (Admin)
export const getAllRoomBookings = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status) {
      query.bookingStatus = status;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.checkIn = {};
      if (startDate) query.checkIn.$gte = new Date(startDate);
      if (endDate) query.checkIn.$lte = new Date(endDate);
    }
    
    const bookings = await RoomBooking.find(query)
      .populate('room')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('❌ Error fetching room bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching room bookings',
      error: error.message
    });
  }
};

// @desc    Get single room booking
// @route   GET /api/room-bookings/:id
// @access  Public
export const getRoomBookingById = async (req, res) => {
  try {
    const booking = await RoomBooking.findById(req.params.id).populate('room');
    
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
    console.error('❌ Error fetching room booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching room booking',
      error: error.message
    });
  }
};

// @desc    Get booking by reference
// @route   GET /api/room-bookings/reference/:ref
// @access  Public
export const getRoomBookingByReference = async (req, res) => {
  try {
    const booking = await RoomBooking.findOne({ 
      bookingReference: req.params.ref 
    }).populate('room');
    
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
    console.error('❌ Error fetching room booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching room booking',
      error: error.message
    });
  }
};

// @desc    Calculate room booking price
// @route   POST /api/room-bookings/calculate-price
// @access  Public
export const calculateRoomPrice = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.body;
    
    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Room ID, check-in and check-out dates are required'
      });
    }
    
    const room = await Room.findById(roomId);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (numberOfNights < 1) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }
    
    const totalAmount = room.pricing.perNight * numberOfNights;
    
    res.json({
      success: true,
      data: {
        roomName: room.name,
        roomType: room.roomType,
        numberOfNights,
        pricePerNight: room.pricing.perNight,
        totalAmount,
        currency: room.pricing.currency,
        checkIn: checkInDate,
        checkOut: checkOutDate
      }
    });
  } catch (error) {
    console.error('❌ Error calculating room price:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating room price',
      error: error.message
    });
  }
};

// @desc    Update room booking
// @route   PUT /api/admin/room-bookings/:id
// @access  Private (Admin)
export const updateRoomBooking = async (req, res) => {
  try {
    const booking = await RoomBooking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('room');
    
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
    console.error('❌ Error updating room booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating room booking',
      error: error.message
    });
  }
};

// @desc    Update booking status
// @route   PATCH /api/admin/room-bookings/:id/status
// @access  Private (Admin)
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingStatus, paymentStatus } = req.body;
    
    const updateFields = {};
    if (bookingStatus) updateFields.bookingStatus = bookingStatus;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    
    const booking = await RoomBooking.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('room');
    
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

// @desc    Cancel room booking
// @route   DELETE /api/admin/room-bookings/:id
// @access  Private (Admin)
export const cancelRoomBooking = async (req, res) => {
  try {
    const booking = await RoomBooking.findById(req.params.id);
    
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
    console.error('❌ Error cancelling room booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling room booking',
      error: error.message
    });
  }
};