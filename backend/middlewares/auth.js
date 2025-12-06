const jwt = require('jsonwebtoken');
const config = require('../config');
const { Contributor } = require('../models');

// Verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[AUTH] No token provided for:', req.path);
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    console.log('[AUTH] Verifying token for:', req.path);
    
    const decoded = jwt.verify(token, config.jwt.secret);
    console.log('[AUTH] Token decoded successfully, user ID:', decoded.id);
    
    const user = await Contributor.findByPk(decoded.id);
    
    if (!user || !user.isActive) {
      console.log('[AUTH] User not found or inactive:', decoded.id);
      return res.status(401).json({ error: 'Invalid token or user inactive.' });
    }

    req.user = user;
    console.log('[AUTH] Authentication successful for user:', user.email);
    next();
  } catch (error) {
    console.error('[AUTH] Authentication error:', error.name, error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    return res.status(500).json({ error: 'Authentication error.' });
  }
};

// Check user role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.',
        required: roles,
        current: req.user.role,
      });
    }

    next();
  };
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

// Optional authentication (for public routes that can show more info if logged in)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await Contributor.findByPk(decoded.id);
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Token invalid, but that's okay for optional auth
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  generateToken,
  optionalAuth,
};

