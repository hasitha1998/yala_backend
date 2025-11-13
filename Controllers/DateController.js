import Date from "../models/Date.js";
const { privateDates } = Date;

// @desc    Get availability dates for private reservations
// @route   GET /api/availability
// @access  Public
export const getAvailability = (req, res) => {
  const { park } = req.query;
  
  // Only private reservations available now
  // Shared safari feature has been removed
  res.json({ 
    dates: privateDates,
    type: 'private',
    park: park || 'yala'
  });
};

// @desc    Get private dates only
// @route   GET /api/availability/private
// @access  Public
export const getPrivateDates = (req, res) => {
  res.json({ 
    dates: privateDates,
    type: 'private'
  });
};