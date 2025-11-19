import Package from '../models/Package.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all packages (with filters)
// @route   GET /api/packages
// @access  Public
export const getAllPackages = asyncHandler(async (req, res) => {
  const { park, packageType, isActive } = req.query;
  
  const filter = {};
  if (park) filter.park = park;
  if (packageType) filter.packageType = packageType;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  
  const packages = await Package.find(filter).sort({ createdAt: -1 });
  
  res.json({
    success: true,
    count: packages.length,
    packages,
  });
});

// @desc    Get single package by ID
// @route   GET /api/packages/:id
// @access  Public
export const getPackageById = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  
  if (!pkg) {
    res.status(404);
    throw new Error('Package not found');
  }
  
  res.json({
    success: true,
    package: pkg,
  });
});

// @desc    Get current/active pricing
// @route   GET /api/packages/current
// @access  Public
export const getCurrentPricing = asyncHandler(async (req, res) => {
  const pkg = await Package.findOne({ isActive: true }).sort({ updatedAt: -1 });
  
  if (!pkg) {
    // Initialize if no package exists
    await Package.initialize();
    const newPkg = await Package.findOne({ isActive: true });
    return res.json(newPkg);
  }
  
  res.json(pkg);
});

// @desc    Create new package
// @route   POST /api/packages
// @access  Private/Admin
export const createPackage = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    park,
    block,
    packageType,
    jeep,
    meals,
    mealOptions,
    guide,
    tickets,
    features,
    highlights,
    images,
    featuredImage,
    maxCapacity,
    availableDates,
    shared,
  } = req.body;
  
  // Validate required fields
  if (!name || !description || !park || !jeep || !meals || !guide) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }
  
  const pkg = await Package.create({
    name,
    description,
    park,
    block,
    packageType: packageType || 'private',
    jeep,
    shared: shared || { 1: 25, 2: 20, 3: 18, 4: 15, 5: 15, 6: 15, 7: 15 },
    meals,
    mealOptions: mealOptions || { breakfast: [], lunch: [] },
    guide,
    tickets: tickets || { foreign: 15, local: 5 },
    features: features || [],
    highlights: highlights || [],
    images: images || [],
    featuredImage,
    maxCapacity: maxCapacity || 7,
    availableDates,
    isActive: true,
    createdBy: req.admin?._id,
  });
  
  res.status(201).json({
    success: true,
    message: 'Package created successfully',
    package: pkg,
  });
});

// @desc    Update package
// @route   PUT /api/packages/:id
// @access  Private/Admin
export const updatePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  
  if (!pkg) {
    res.status(404);
    throw new Error('Package not found');
  }
  
  const updatedFields = { ...req.body };
  updatedFields.lastModifiedBy = req.admin?._id;
  
  const updatedPackage = await Package.findByIdAndUpdate(
    req.params.id,
    updatedFields,
    { new: true, runValidators: true }
  );
  
  res.json({
    success: true,
    message: 'Package updated successfully',
    package: updatedPackage,
  });
});

// @desc    Delete package
// @route   DELETE /api/packages/:id
// @access  Private/Admin
export const deletePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  
  if (!pkg) {
    res.status(404);
    throw new Error('Package not found');
  }
  
  await pkg.deleteOne();
  
  res.json({
    success: true,
    message: 'Package deleted successfully',
  });
});

// @desc    Toggle package active status
// @route   PATCH /api/packages/:id/toggle-status
// @access  Private/Admin
export const togglePackageStatus = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  
  if (!pkg) {
    res.status(404);
    throw new Error('Package not found');
  }
  
  pkg.isActive = !pkg.isActive;
  await pkg.save();
  
  res.json({
    success: true,
    message: `Package ${pkg.isActive ? 'activated' : 'deactivated'} successfully`,
    package: pkg,
  });
});

// @desc    Get packages by park
// @route   GET /api/packages/park/:park
// @access  Public
export const getPackagesByPark = asyncHandler(async (req, res) => {
  const packages = await Package.find({ 
    park: req.params.park,
    isActive: true 
  });
  
  res.json({
    success: true,
    count: packages.length,
    packages,
  });
});

// @desc    Get package statistics (Admin)
// @route   GET /api/packages/stats/overview
// @access  Private/Admin
export const getPackageStats = asyncHandler(async (req, res) => {
  const totalPackages = await Package.countDocuments();
  const activePackages = await Package.countDocuments({ isActive: true });
  const packagesByPark = await Package.aggregate([
    { $group: { _id: '$park', count: { $sum: 1 } } }
  ]);
  const totalBookings = await Package.aggregate([
    { $group: { _id: null, total: { $sum: '$totalBookings' } } }
  ]);
  
  res.json({
    success: true,
    stats: {
      totalPackages,
      activePackages,
      inactivePackages: totalPackages - activePackages,
      packagesByPark,
      totalBookings: totalBookings[0]?.total || 0,
    },
  });
});

// 🆕 @desc    Update jeep pricing
// @route   PUT /api/packages/:id/jeep-pricing
// @access  Private/Admin
export const updateJeepPricing = asyncHandler(async (req, res) => {
  const { jeepType, timeSlot, price } = req.body;
  
  const pkg = await Package.findById(req.params.id);
  
  if (!pkg) {
    res.status(404);
    throw new Error('Package not found');
  }
  
  // Validate jeep type and time slot
  const validJeepTypes = ['basic', 'luxury', 'superLuxury'];
  const validTimeSlots = ['morning', 'afternoon', 'extended', 'fullDay'];
  
  if (!validJeepTypes.includes(jeepType)) {
    res.status(400);
    throw new Error('Invalid jeep type');
  }
  
  if (!validTimeSlots.includes(timeSlot)) {
    res.status(400);
    throw new Error('Invalid time slot');
  }
  
  // Update specific price
  pkg.jeep[jeepType][timeSlot] = price;
  pkg.lastModifiedBy = req.admin?._id;
  
  await pkg.save();
  
  res.json({
    success: true,
    message: 'Jeep pricing updated successfully',
    package: pkg,
  });
});

// 🆕 @desc    Update guide pricing
// @route   PUT /api/packages/:id/guide-pricing
// @access  Private/Admin
export const updateGuidePricing = asyncHandler(async (req, res) => {
  const { guideType, price } = req.body;
  
  const pkg = await Package.findById(req.params.id);
  
  if (!pkg) {
    res.status(404);
    throw new Error('Package not found');
  }
  
  // Validate guide type
  const validGuideTypes = ['driver', 'driverGuide', 'separateGuide'];
  
  if (!validGuideTypes.includes(guideType)) {
    res.status(400);
    throw new Error('Invalid guide type');
  }
  
  // Update specific price
  pkg.guide[guideType] = price;
  pkg.lastModifiedBy = req.admin?._id;
  
  await pkg.save();
  
  res.json({
    success: true,
    message: 'Guide pricing updated successfully',
    package: pkg,
  });
});

// Add this to your PackageController.js

// @desc    Get package availability (available dates)
// @route   GET /api/packages/:id/availability
// @access  Public
export const getPackageAvailability = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  
  if (!pkg) {
    res.status(404);
    throw new Error('Package not found');
  }
  
  // Return available dates from package
  // If no specific dates are set, return default availability
  const availability = {
    success: true,
    packageId: pkg._id,
    packageName: pkg.name,
    availableDates: pkg.availableDates || {
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
    },
    isActive: pkg.isActive,
  };
  
  res.json(availability);
});

// 🆕 @desc    Add meal option item
// @route   POST /api/packages/:id/meal-options
// @access  Private/Admin
export const addMealOption = asyncHandler(async (req, res) => {
  const { mealType, name, price, isVegetarian, description } = req.body;
  
  const pkg = await Package.findById(req.params.id);
  
  if (!pkg) {
    res.status(404);
    throw new Error('Package not found');
  }
  
  // Validate meal type
  if (mealType !== 'breakfast' && mealType !== 'lunch') {
    res.status(400);
    throw new Error('Invalid meal type. Must be "breakfast" or "lunch"');
  }
  
  // Validate required fields
  if (!name || price === undefined) {
    res.status(400);
    throw new Error('Name and price are required');
  }
  
  // Initialize mealOptions if not exists
  if (!pkg.mealOptions) {
    pkg.mealOptions = { breakfast: [], lunch: [] };
  }
  
  // Add new meal item
  pkg.mealOptions[mealType].push({
    name,
    price,
    isVegetarian: isVegetarian !== undefined ? isVegetarian : false,
    description: description || '',
  });
  
  pkg.lastModifiedBy = req.admin?._id;
  
  await pkg.save();
  
  res.json({
    success: true,
    message: `${mealType} option added successfully`,
    package: pkg,
  });
});

// 🆕 @desc    Update meal option item
// @route   PUT /api/packages/:id/meal-options/:mealType/:itemIndex
// @access  Private/Admin
export const updateMealOption = asyncHandler(async (req, res) => {
  const { mealType, itemIndex } = req.params;
  const { name, price, isVegetarian, description } = req.body;
  
  const pkg = await Package.findById(req.params.id);
  
  if (!pkg) {
    res.status(404);
    throw new Error('Package not found');
  }
  
  // Validate meal type
  if (mealType !== 'breakfast' && mealType !== 'lunch') {
    res.status(400);
    throw new Error('Invalid meal type');
  }
  
  // Check if item exists
  if (!pkg.mealOptions?.[mealType]?.[itemIndex]) {
    res.status(404);
    throw new Error('Meal option item not found');
  }
  
  // Update item
  if (name !== undefined) pkg.mealOptions[mealType][itemIndex].name = name;
  if (price !== undefined) pkg.mealOptions[mealType][itemIndex].price = price;
  if (isVegetarian !== undefined) pkg.mealOptions[mealType][itemIndex].isVegetarian = isVegetarian;
  if (description !== undefined) pkg.mealOptions[mealType][itemIndex].description = description;
  
  pkg.lastModifiedBy = req.admin?._id;
  
  await pkg.save();
  
  res.json({
    success: true,
    message: 'Meal option updated successfully',
    package: pkg,
  });
});

// 🆕 @desc    Delete meal option item
// @route   DELETE /api/packages/:id/meal-options/:mealType/:itemIndex
// @access  Private/Admin
export const deleteMealOption = asyncHandler(async (req, res) => {
  const { mealType, itemIndex } = req.params;
  
  const pkg = await Package.findById(req.params.id);
  
  if (!pkg) {
    res.status(404);
    throw new Error('Package not found');
  }
  
  // Validate meal type
  if (mealType !== 'breakfast' && mealType !== 'lunch') {
    res.status(400);
    throw new Error('Invalid meal type');
  }
  
  // Check if item exists
  if (!pkg.mealOptions?.[mealType]?.[itemIndex]) {
    res.status(404);
    throw new Error('Meal option item not found');
  }
  
  // Remove item
  pkg.mealOptions[mealType].splice(itemIndex, 1);
  pkg.lastModifiedBy = req.admin?._id;
  
  await pkg.save();
  
  res.json({
    success: true,
    message: 'Meal option deleted successfully',
    package: pkg,
  });
});

// 🆕 @desc    Batch update all pricing
// @route   PUT /api/packages/:id/pricing-bulk
// @access  Private/Admin
export const bulkUpdatePricing = asyncHandler(async (req, res) => {
  const { jeep, guide, tickets, shared, mealOptions } = req.body;
  
  const pkg = await Package.findById(req.params.id);
  
  if (!pkg) {
    res.status(404);
    throw new Error('Package not found');
  }
  
  // Update all pricing at once
  if (jeep) pkg.jeep = { ...pkg.jeep, ...jeep };
  if (guide) pkg.guide = { ...pkg.guide, ...guide };
  if (tickets) pkg.tickets = { ...pkg.tickets, ...tickets };
  if (shared) pkg.shared = { ...pkg.shared, ...shared };
  if (mealOptions) pkg.mealOptions = { ...pkg.mealOptions, ...mealOptions };
  
  pkg.lastModifiedBy = req.admin?._id;
  
  await pkg.save();
  
  res.json({
    success: true,
    message: 'All pricing updated successfully',
    package: pkg,
  });
});