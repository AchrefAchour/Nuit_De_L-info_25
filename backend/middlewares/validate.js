const { validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => {
      const field = err.path || err.param || 'unknown';
      return `${field}: ${err.msg}`;
    }).join(', ');
    
    console.log('[VALIDATION] Validation failed:', errorMessages);
    console.log('[VALIDATION] Request body:', JSON.stringify(req.body, null, 2));
    
    return res.status(400).json({
      error: 'Validation failed',
      message: errorMessages,
      details: errors.array().map(err => ({
        field: err.path || err.param || 'unknown',
        message: err.msg,
        value: err.value,
      })),
    });
  }
  
  next();
};

module.exports = { validate };

