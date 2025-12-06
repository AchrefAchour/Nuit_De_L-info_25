const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { File, Version, Entity, Contributor, EntityHistory } = require('../models');
const config = require('../config');

// Get files for a version
const getByVersion = async (req, res) => {
  try {
    const { versionId } = req.params;

    const files = await File.findAll({
      where: { versionId },
      include: [
        { model: Contributor, as: 'uploadedBy', attributes: ['id', 'name', 'avatar'] },
      ],
    });

    res.json({ files });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Failed to fetch files.' });
  }
};

// Upload file
const upload = async (req, res) => {
  try {
    const { versionId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const version = await Version.findByPk(versionId, {
      include: [{ model: Entity }],
    });

    if (!version) {
      // Delete uploaded file
      await fs.unlink(req.file.path);
      return res.status(404).json({ error: 'Version not found.' });
    }

    // Calculate checksum
    const fileBuffer = await fs.readFile(req.file.path);
    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Create file record
    const file = await File.create({
      versionId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filepath: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedById: req.user.id,
      checksum,
    });

    // Log history
    await EntityHistory.create({
      entityId: version.entityId,
      changedById: req.user.id,
      action: 'file_uploaded',
      comment: `Uploaded file: ${req.file.originalname}`,
    });

    const completeFile = await File.findByPk(file.id, {
      include: [
        { model: Contributor, as: 'uploadedBy', attributes: ['id', 'name', 'avatar'] },
      ],
    });

    res.status(201).json({
      message: 'File uploaded successfully.',
      file: completeFile,
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    console.error('Upload file error:', error);
    res.status(500).json({ error: 'Failed to upload file.' });
  }
};

// Download file
const download = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findByPk(id);
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    // Check if file exists on disk
    try {
      await fs.access(file.filepath);
    } catch {
      return res.status(404).json({ error: 'File not found on disk.' });
    }

    res.download(file.filepath, file.originalName);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ error: 'Failed to download file.' });
  }
};

// Delete file
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findByPk(id, {
      include: [{ model: Version }],
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    // Delete file from disk
    try {
      await fs.unlink(file.filepath);
    } catch (error) {
      console.warn('Could not delete file from disk:', error.message);
    }

    // Log history
    await EntityHistory.create({
      entityId: file.Version.entityId,
      changedById: req.user.id,
      action: 'file_deleted',
      comment: `Deleted file: ${file.originalName}`,
    });

    // Delete record
    await file.destroy();

    res.json({ message: 'File deleted successfully.' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file.' });
  }
};

// Get file info
const getInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findByPk(id, {
      include: [
        { model: Contributor, as: 'uploadedBy', attributes: ['id', 'name', 'avatar'] },
        { 
          model: Version,
          include: [{ model: Entity }],
        },
      ],
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    res.json({ file });
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({ error: 'Failed to fetch file info.' });
  }
};

module.exports = {
  getByVersion,
  upload,
  download,
  remove,
  getInfo,
};

