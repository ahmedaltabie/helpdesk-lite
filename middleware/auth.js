const { get } = require('../database/db');

// Authentication middleware - checks if user is logged in
const authenticate = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Role-based access control middleware
const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await get('SELECT role FROM users WHERE id = ?', [req.session.userId]);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      req.userRole = user.role;
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};

module.exports = {
  authenticate,
  authorize
};
