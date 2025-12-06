const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const contributorsController = require('../controllers/contributorsController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

// Get all contributors
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim(),
  query('role').optional().isIn(['admin', 'contributor', 'viewer']),
  validate,
], contributorsController.getAll);

// Get single contributor
router.get('/:id', authenticate, [
  param('id').isInt().withMessage('Invalid contributor ID'),
  validate,
], contributorsController.getById);

// Get contributor statistics
router.get('/:id/stats', authenticate, [
  param('id').isInt().withMessage('Invalid contributor ID'),
  validate,
], contributorsController.getStats);

// Create contributor (admin only)
router.post('/', authenticate, authorize('admin'), [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'contributor', 'viewer']),
  validate,
], contributorsController.create);

// Update contributor (admin only)
router.put('/:id', authenticate, authorize('admin'), [
  param('id').isInt().withMessage('Invalid contributor ID'),
  body('name').optional().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['admin', 'contributor', 'viewer']),
  body('isActive').optional().isBoolean(),
  validate,
], contributorsController.update);

// Reset password (admin only)
router.put('/:id/password', authenticate, authorize('admin'), [
  param('id').isInt().withMessage('Invalid contributor ID'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
], contributorsController.resetPassword);

// Deactivate contributor (admin only)
router.put('/:id/deactivate', authenticate, authorize('admin'), [
  param('id').isInt().withMessage('Invalid contributor ID'),
  validate,
], contributorsController.deactivate);

// Delete contributor (admin only)
router.delete('/:id', authenticate, authorize('admin'), [
  param('id').isInt().withMessage('Invalid contributor ID'),
  validate,
], contributorsController.deleteContributor);

module.exports = router;

