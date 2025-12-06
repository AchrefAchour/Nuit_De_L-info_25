const express = require('express');
const { param } = require('express-validator');
const router = express.Router();
const filesController = require('../controllers/filesController');
const { authenticate } = require('../middlewares/auth');
const { upload, handleUploadError } = require('../middlewares/upload');
const { validate } = require('../middlewares/validate');

// Get files for a version
router.get('/version/:versionId', authenticate, [
  param('versionId').isInt().withMessage('Invalid version ID'),
  validate,
], filesController.getByVersion);

// Get file info
router.get('/:id', authenticate, [
  param('id').isInt().withMessage('Invalid file ID'),
  validate,
], filesController.getInfo);

// Download file
router.get('/:id/download', authenticate, [
  param('id').isInt().withMessage('Invalid file ID'),
  validate,
], filesController.download);

// Upload file
router.post('/version/:versionId', 
  authenticate,
  upload.single('file'),
  handleUploadError,
  [
    param('versionId').isInt().withMessage('Invalid version ID'),
    validate,
  ],
  filesController.upload
);

// Delete file
router.delete('/:id', authenticate, [
  param('id').isInt().withMessage('Invalid file ID'),
  validate,
], filesController.remove);

module.exports = router;

