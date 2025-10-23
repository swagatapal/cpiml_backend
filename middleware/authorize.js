const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = (roles) => (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded.user;

    // Check user role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Access denied: Insufficient role' });
    }
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
