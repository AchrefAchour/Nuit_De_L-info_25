const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const versionsController = require('../controllers/versionsController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

// Get all versions for an entity
router.get('/entity/:entityId', authenticate, [
  param('entityId').isInt().withMessage('Invalid entity ID'),
  validate,
], versionsController.getByEntity);

// Get single version
router.get('/:id', authenticate, [
  param('id').isInt().withMessage('Invalid version ID'),
  validate,
], versionsController.getById);

// Create new version
router.post('/entity/:entityId', authenticate, [
  param('entityId').isInt().withMessage('Invalid entity ID'),
  body('title').optional().trim(),
  body('content').optional(),
  body('summary').optional().trim(),
  validate,
], versionsController.create);

// Compare two versions
router.get('/compare/:version1Id/:version2Id', authenticate, [
  param('version1Id').isInt().withMessage('Invalid version 1 ID'),
  param('version2Id').isInt().withMessage('Invalid version 2 ID'),
  validate,
], versionsController.compare);

// Set version as current
router.put('/:id/current', authenticate, [
  param('id').isInt().withMessage('Invalid version ID'),
  validate,
], versionsController.setCurrent);

module.exports = router;

