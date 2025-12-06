const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const statesController = require('../controllers/statesController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

// Get all states (public)
router.get('/', statesController.getAll);

// Get single state
router.get('/:id', [
  param('id').isInt().withMessage('Invalid state ID'),
  validate,
], statesController.getById);

// Create state (admin only)
router.post('/', authenticate, authorize('admin'), [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('label').notEmpty().withMessage('Label is required').trim(),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex color'),
  body('order').optional().isInt(),
  body('description').optional().trim(),
  body('isInitial').optional().isBoolean(),
  body('isFinal').optional().isBoolean(),
  validate,
], statesController.create);

// Update state (admin only)
router.put('/:id', authenticate, authorize('admin'), [
  param('id').isInt().withMessage('Invalid state ID'),
  body('name').optional().trim(),
  body('label').optional().trim(),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
  body('order').optional().isInt(),
  body('description').optional().trim(),
  body('isInitial').optional().isBoolean(),
  body('isFinal').optional().isBoolean(),
  validate,
], statesController.update);

// Delete state (admin only)
router.delete('/:id', authenticate, authorize('admin'), [
  param('id').isInt().withMessage('Invalid state ID'),
  validate,
], statesController.remove);

// Initialize default states (admin only)
router.post('/initialize', authenticate, authorize('admin'), statesController.initializeDefaults);

module.exports = router;

