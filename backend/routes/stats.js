const express = require('express');
const { param, query } = require('express-validator');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

// Get global statistics
router.get('/', authenticate, statsController.getGlobalStats);

// Get activity timeline
router.get('/timeline', authenticate, [
  query('days').optional().isInt({ min: 1, max: 365 }),
  validate,
], statsController.getActivityTimeline);

// Get top contributors
router.get('/top-contributors', authenticate, [
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validate,
], statsController.getTopContributors);

// Get entity statistics
router.get('/entity/:id', authenticate, [
  param('id').isInt().withMessage('Invalid entity ID'),
  validate,
], statsController.getEntityStats);

module.exports = router;

