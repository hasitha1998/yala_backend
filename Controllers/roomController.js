import Room from '../models/Room.js';

// @desc    Create new room
// @route   POST /api/admin/rooms
// @access  Private (Admin)
export const createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room
    });
  } catch (error) {
    console.error('❌ Error creating room:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating room',
      error: error.message
    });
  }
};

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
export const getAllRooms = async (req, res) => {
  try {
    const { roomType, isAvailable, minPrice, maxPrice } = req.query;
    
    let query = { isActive: true };
    
    // Filter by room type
    if (roomType) {
      query.roomType = roomType;
    }
    
    // Filter by availability
    if (isAvailable !== undefined) {
      query['availability.isAvailable'] = isAvailable === 'true';
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query['pricing.perNight'] = {};
      if (minPrice) query['pricing.perNight'].$gte = Number(minPrice);
      if (maxPrice) query['pricing.perNight'].$lte = Number(maxPrice);
    }
    
    const rooms = await Room.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    console.error('❌ Error fetching rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rooms',
      error: error.message
    });
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('❌ Error fetching room:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching room',
      error: error.message
    });
  }
};

// @desc    Update room
// @route   PUT /api/admin/rooms/:id
// @access  Private (Admin)
export const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Room updated successfully',
      data: room
    });
  } catch (error) {
    console.error('❌ Error updating room:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating room',
      error: error.message
    });
  }
};

// @desc    Update room availability
// @route   PATCH /api/admin/rooms/:id/availability
// @access  Private (Admin)
export const updateRoomAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { 'availability.isAvailable': isAvailable },
      { new: true, runValidators: true }
    );
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Room availability updated successfully',
      data: room
    });
  } catch (error) {
    console.error('❌ Error updating room availability:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating room availability',
      error: error.message
    });
  }
};

// @desc    Delete room (soft delete)
// @route   DELETE /api/admin/rooms/:id
// @access  Private (Admin)
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Room deleted successfully',
      data: room
    });
  } catch (error) {
    console.error('❌ Error deleting room:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting room',
      error: error.message
    });
  }
};

// @desc    Get available rooms for date range
// @route   GET /api/rooms/availability/check
// @access  Public
export const checkRoomAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut, adults, children } = req.query;
    
    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Check-in and check-out dates are required'
      });
    }
    
    // Get all active and available rooms
    let query = { 
      isActive: true,
      'availability.isAvailable': true
    };
    
    // Filter by capacity if provided
    if (adults) {
      query['capacity.adults'] = { $gte: Number(adults) };
    }
    
    const rooms = await Room.find(query);
    
    // TODO: Check against existing bookings to determine actual availability
    // For now, returning all rooms that match criteria
    
    res.json({
      success: true,
      count: rooms.length,
      data: rooms,
      searchCriteria: {
        checkIn,
        checkOut,
        adults: adults || 'Any',
        children: children || 0
      }
    });
  } catch (error) {
    console.error('❌ Error checking room availability:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking room availability',
      error: error.message
    });
  }
};