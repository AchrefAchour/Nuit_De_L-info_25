const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const entitiesController = require('../controllers/entitiesController');
const { authenticate, authorize, optionalAuth } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

// Get all entities (with optional auth for better filtering)
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
], entitiesController.getAll);

// Get single entity
router.get('/:id', optionalAuth, [
  param('id').isInt().withMessage('Invalid entity ID'),
  validate,
], entitiesController.getById);

// Get entity timeline
router.get('/:id/timeline', authenticate, [
  param('id').isInt().withMessage('Invalid entity ID'),
  validate,
], entitiesController.getTimeline);

// Create entity
router.post('/', authenticate, [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('type').optional().trim(),
  body('description').optional().trim(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('dueDate').optional().isISO8601(),
  body('tags').optional().isArray(),
  body('contributors').optional().isArray(),
  validate,
], entitiesController.create);

// Update entity
router.put('/:id', authenticate, [
  param('id').isInt().withMessage('Invalid entity ID'),
  body('name').optional().trim(),
  body('description').optional().trim(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('dueDate').optional().isISO8601(),
  body('tags').optional().isArray(),
  validate,
], entitiesController.update);

// Change entity state
router.put('/:id/state', authenticate, [
  param('id').isInt().withMessage('Invalid entity ID'),
  body('stateId').isInt().withMessage('State ID is required'),
  body('comment').optional().trim(),
  validate,
], entitiesController.changeState);

// Delete entity
router.delete('/:id', authenticate, [
  param('id').isInt().withMessage('Invalid entity ID'),
  validate,
], entitiesController.remove);

// Add contributor to entity
router.post('/:id/contributors', authenticate, [
  param('id').isInt().withMessage('Invalid entity ID'),
  body('contributorId').isInt().withMessage('Contributor ID is required'),
  body('role').optional().isIn(['owner', 'editor', 'viewer']),
  validate,
], entitiesController.addContributor);

// Remove contributor from entity
router.delete('/:id/contributors/:contributorId', authenticate, [
  param('id').isInt().withMessage('Invalid entity ID'),
  param('contributorId').isInt().withMessage('Invalid contributor ID'),
  validate,
], entitiesController.removeContributor);

module.exports = router;

