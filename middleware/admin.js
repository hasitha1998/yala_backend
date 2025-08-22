module.exports = function(req, res, next) {
  // Assuming your user model has an 'isAdmin' field
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};