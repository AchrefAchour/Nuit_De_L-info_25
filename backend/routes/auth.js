const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

// Register
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email')
    .notEmpty().withMessage('Email is required')
    .custom((value) => {
      // More permissive email validation that accepts .local domains
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new Error('Valid email is required');
      }
      return true;
    })
    .customSanitizer((value) => value.toLowerCase().trim()),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['contributor', 'admin']).withMessage('Role must be contributor or admin'),
  validate,
], authController.register);

// Login
router.post('/login', [
  body('email')
    .notEmpty().withMessage('Email is required')
    .custom((value) => {
      // More permissive email validation that accepts .local domains
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new Error('Valid email is required');
      }
      return true;
    })
    .customSanitizer((value) => value.toLowerCase().trim()),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
], authController.login);

// Get current user
router.get('/me', authenticate, authController.getMe);

// Update profile
router.put('/me', authenticate, [
  body('name').optional().trim(),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
  validate,
], authController.updateMe);

// Change password
router.put('/password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  validate,
], authController.changePassword);

module.exports = router;

