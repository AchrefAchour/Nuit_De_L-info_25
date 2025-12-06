const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

// Chat with AI
router.post('/chat', authenticate, [
  body('message').notEmpty().withMessage('Message is required').trim(),
  validate,
], aiController.chat);

// Get conversation history
router.get('/history', authenticate, aiController.getHistory);

// Clear conversation history
router.delete('/history', authenticate, aiController.clearHistory);

module.exports = router;

