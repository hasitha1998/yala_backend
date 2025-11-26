import Taxi from '../models/Taxi.js';

// @desc    Create new taxi
// @route   POST /api/admin/taxis
// @access  Private (Admin)
export const createTaxi = async (req, res) => {
  try {
    const taxi = await Taxi.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Taxi created successfully',
      data: taxi
    });
  } catch (error) {
    console.error('❌ Error creating taxi:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating taxi',
      error: error.message
    });
  }
};

// @desc    Get all taxis
// @route   GET /api/taxis
// @access  Public
export const getAllTaxis = async (req, res) => {
  try {
    const { vehicleType, isAvailable, minPrice, maxPrice } = req.query;
    
    let query = { isActive: true };
    
    // Filter by vehicle type
    if (vehicleType) {
      query.vehicleType = vehicleType;
    }
    
    // Filter by availability
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query['pricing.basePrice'] = {};
      if (minPrice) query['pricing.basePrice'].$gte = Number(minPrice);
      if (maxPrice) query['pricing.basePrice'].$lte = Number(maxPrice);
    }
    
    const taxis = await Taxi.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: taxis.length,
      data: taxis
    });
  } catch (error) {
    console.error('❌ Error fetching taxis:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching taxis',
      error: error.message
    });
  }
};

// @desc    Get single taxi
// @route   GET /api/taxis/:id
// @access  Public
export const getTaxiById = async (req, res) => {
  try {
    const taxi = await Taxi.findById(req.params.id);
    
    if (!taxi) {
      return res.status(404).json({
        success: false,
        message: 'Taxi not found'
      });
    }
    
    res.json({
      success: true,
      data: taxi
    });
  } catch (error) {
    console.error('❌ Error fetching taxi:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching taxi',
      error: error.message
    });
  }
};

// @desc    Update taxi
// @route   PUT /api/admin/taxis/:id
// @access  Private (Admin)
export const updateTaxi = async (req, res) => {
  try {
    const taxi = await Taxi.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!taxi) {
      return res.status(404).json({
        success: false,
        message: 'Taxi not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Taxi updated successfully',
      data: taxi
    });
  } catch (error) {
    console.error('❌ Error updating taxi:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating taxi',
      error: error.message
    });
  }
};

// @desc    Update taxi availability
// @route   PATCH /api/admin/taxis/:id/availability
// @access  Private (Admin)
export const updateTaxiAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    
    const taxi = await Taxi.findByIdAndUpdate(
      req.params.id,
      { isAvailable: isAvailable },
      { new: true, runValidators: true }
    );
    
    if (!taxi) {
      return res.status(404).json({
        success: false,
        message: 'Taxi not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Taxi availability updated successfully',
      data: taxi
    });
  } catch (error) {
    console.error('❌ Error updating taxi availability:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating taxi availability',
      error: error.message
    });
  }
};

// @desc    Delete taxi (soft delete)
// @route   DELETE /api/admin/taxis/:id
// @access  Private (Admin)
export const deleteTaxi = async (req, res) => {
  try {
    const taxi = await Taxi.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!taxi) {
      return res.status(404).json({
        success: false,
        message: 'Taxi not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Taxi deleted successfully',
      data: taxi
    });
  } catch (error) {
    console.error('❌ Error deleting taxi:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting taxi',
      error: error.message
    });
  }
};

// @desc    Check taxi availability
// @route   GET /api/taxis/availability/check
// @access  Public
export const checkTaxiAvailability = async (req, res) => {
  try {
    const { date, passengers, vehicleType } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }
    
    // Get all active and available taxis
    let query = { 
      isActive: true,
      isAvailable: true
    };
    
    // Filter by vehicle type if provided
    if (vehicleType) {
      query.vehicleType = vehicleType;
    }
    
    // Filter by capacity if provided
    if (passengers) {
      query['capacity.passengers'] = { $gte: Number(passengers) };
    }
    
    const taxis = await Taxi.find(query);
    
    // TODO: Check against existing bookings to determine actual availability
    // For now, returning all taxis that match criteria
    
    res.json({
      success: true,
      count: taxis.length,
      data: taxis,
      searchCriteria: {
        date,
        passengers: passengers || 'Any',
        vehicleType: vehicleType || 'Any'
      }
    });
  } catch (error) {
    console.error('❌ Error checking taxi availability:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking taxi availability',
      error: error.message
    });
  }
};