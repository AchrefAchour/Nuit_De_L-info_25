const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

// Send message to AI agent
router.post('/agent', authenticate, [
  body('message').notEmpty().withMessage('Message is required').trim(),
  body('sessionId').optional().trim(),
  validate,
], webhookController.sendToAgent);

// Get chat history
router.get('/agent/history', authenticate, webhookController.getChatHistory);

// Clear chat history
router.delete('/agent/history', authenticate, webhookController.clearChatHistory);

// n8n callback endpoint (can be called by n8n)
router.post('/n8n/callback', [
  body('sessionId').notEmpty(),
  body('response').notEmpty(),
  validate,
], webhookController.n8nCallback);

module.exports = router;

