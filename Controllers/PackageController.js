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
    shared,
    meals,
    guide,
    tickets,
    features,
    highlights,
    images,
    featuredImage,
    maxCapacity,
    availableDates,
  } = req.body;
  
  // Validate required fields
  if (!name || !description || !park || !jeep || !shared || !meals || !guide) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }
  
  const pkg = await Package.create({
    name,
    description,
    park,
    block,
    packageType: packageType || 'both',
    jeep,
    shared,
    meals,
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