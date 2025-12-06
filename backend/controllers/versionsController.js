const { Version, Entity, File, Contributor, EntityHistory, sequelize } = require('../models');

// Get all versions for an entity
const getByEntity = async (req, res) => {
  try {
    const { entityId } = req.params;

    const versions = await Version.findAll({
      where: { entityId },
      include: [
        { model: Contributor, as: 'createdBy', attributes: ['id', 'name', 'avatar'] },
        { model: File, as: 'files' },
      ],
      order: [['versionNumber', 'DESC']],
    });

    res.json({ versions });
  } catch (error) {
    console.error('Get versions error:', error);
    res.status(500).json({ error: 'Failed to fetch versions.' });
  }
};

// Get single version
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const version = await Version.findByPk(id, {
      include: [
        { model: Contributor, as: 'createdBy', attributes: ['id', 'name', 'avatar'] },
        { model: File, as: 'files' },
        { model: Entity },
      ],
    });

    if (!version) {
      return res.status(404).json({ error: 'Version not found.' });
    }

    res.json({ version });
  } catch (error) {
    console.error('Get version error:', error);
    res.status(500).json({ error: 'Failed to fetch version.' });
  }
};

// Create new version
const create = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { entityId } = req.params;
    const { title, content, summary } = req.body;

    const entity = await Entity.findByPk(entityId, { transaction });
    if (!entity) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Entity not found.' });
    }

    // Get next version number
    const lastVersion = await Version.findOne({
      where: { entityId },
      order: [['versionNumber', 'DESC']],
      transaction,
    });

    const versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

    // Set all existing versions as not current
    await Version.update(
      { isCurrent: false },
      { where: { entityId }, transaction }
    );

    // Create new version
    const version = await Version.create({
      entityId,
      versionNumber,
      title: title || entity.name,
      content,
      summary,
      createdById: req.user.id,
      isCurrent: true,
    }, { transaction });

    // Log history
    await EntityHistory.create({
      entityId,
      changedById: req.user.id,
      action: 'version_created',
      comment: `Created version ${versionNumber}`,
    }, { transaction });

    await transaction.commit();

    const completeVersion = await Version.findByPk(version.id, {
      include: [
        { model: Contributor, as: 'createdBy', attributes: ['id', 'name', 'avatar'] },
        { model: File, as: 'files' },
      ],
    });

    res.status(201).json({
      message: 'Version created successfully.',
      version: completeVersion,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create version error:', error);
    res.status(500).json({ error: 'Failed to create version.' });
  }
};

// Compare two versions
const compare = async (req, res) => {
  try {
    const { version1Id, version2Id } = req.params;

    const version1 = await Version.findByPk(version1Id, {
      include: [{ model: Contributor, as: 'createdBy', attributes: ['id', 'name'] }],
    });

    const version2 = await Version.findByPk(version2Id, {
      include: [{ model: Contributor, as: 'createdBy', attributes: ['id', 'name'] }],
    });

    if (!version1 || !version2) {
      return res.status(404).json({ error: 'One or both versions not found.' });
    }

    if (version1.entityId !== version2.entityId) {
      return res.status(400).json({ error: 'Versions must belong to the same entity.' });
    }

    // Simple diff comparison
    const diff = {
      version1: {
        id: version1.id,
        versionNumber: version1.versionNumber,
        title: version1.title,
        content: version1.content,
        createdAt: version1.createdAt,
        createdBy: version1.createdBy,
      },
      version2: {
        id: version2.id,
        versionNumber: version2.versionNumber,
        title: version2.title,
        content: version2.content,
        createdAt: version2.createdAt,
        createdBy: version2.createdBy,
      },
      changes: {
        titleChanged: version1.title !== version2.title,
        contentChanged: version1.content !== version2.content,
      },
    };

    res.json({ comparison: diff });
  } catch (error) {
    console.error('Compare versions error:', error);
    res.status(500).json({ error: 'Failed to compare versions.' });
  }
};

// Set version as current
const setCurrent = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const version = await Version.findByPk(id, { transaction });
    if (!version) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Version not found.' });
    }

    // Unset current from all versions of this entity
    await Version.update(
      { isCurrent: false },
      { where: { entityId: version.entityId }, transaction }
    );

    // Set this version as current
    await version.update({ isCurrent: true }, { transaction });

    // Log history
    await EntityHistory.create({
      entityId: version.entityId,
      changedById: req.user.id,
      action: 'version_restored',
      comment: `Restored to version ${version.versionNumber}`,
    }, { transaction });

    await transaction.commit();

    res.json({
      message: 'Version set as current.',
      version,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Set current version error:', error);
    res.status(500).json({ error: 'Failed to set current version.' });
  }
};

module.exports = {
  getByEntity,
  getById,
  create,
  compare,
  setCurrent,
};

