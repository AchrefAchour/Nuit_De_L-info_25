const { Op } = require('sequelize');
const { 
  Entity, 
  State, 
  Contributor, 
  EntityHistory, 
  Version, 
  File,
  EntityContributor,
  sequelize 
} = require('../models');

// Get all entities with filters
const getAll = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      stateId, 
      priority,
      search,
      contributorId,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (type) where.type = type;
    if (stateId) where.currentStateId = stateId;
    if (priority) where.priority = priority;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const include = [
      { model: State, as: 'currentState' },
      { model: Contributor, as: 'creator', attributes: ['id', 'name', 'email', 'avatar'] },
      { 
        model: Contributor, 
        as: 'contributors',
        attributes: ['id', 'name', 'email', 'avatar'],
        through: { attributes: ['role'] }
      },
    ];

    // Filter by contributor if specified
    if (contributorId) {
      include[2].where = { id: contributorId };
    }

    const { count, rows } = await Entity.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder]],
      distinct: true,
    });

    res.json({
      entities: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get entities error:', error);
    res.status(500).json({ error: 'Failed to fetch entities.' });
  }
};

// Get single entity by ID
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const entity = await Entity.findByPk(id, {
      include: [
        { model: State, as: 'currentState' },
        { model: Contributor, as: 'creator', attributes: ['id', 'name', 'email', 'avatar'] },
        { 
          model: Contributor, 
          as: 'contributors',
          attributes: ['id', 'name', 'email', 'avatar'],
          through: { attributes: ['role'] }
        },
        {
          model: EntityHistory,
          as: 'history',
          include: [
            { model: State, as: 'oldState' },
            { model: State, as: 'newState' },
            { model: Contributor, as: 'changedBy', attributes: ['id', 'name', 'avatar'] },
          ],
          order: [['createdAt', 'DESC']],
          limit: 50,
        },
        {
          model: Version,
          as: 'versions',
          include: [
            { model: Contributor, as: 'createdBy', attributes: ['id', 'name', 'avatar'] },
            { model: File, as: 'files' },
          ],
          order: [['versionNumber', 'DESC']],
        },
      ],
    });

    if (!entity) {
      return res.status(404).json({ error: 'Entity not found.' });
    }

    res.json({ entity });
  } catch (error) {
    console.error('Get entity error:', error);
    res.status(500).json({ error: 'Failed to fetch entity.' });
  }
};

// Create new entity
const create = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { name, type, description, priority, dueDate, tags, contributors } = req.body;

    console.log('[EntityCreate] Received data:', {
      name,
      type,
      description: description?.substring(0, 50),
      priority,
      dueDate,
      tagsCount: tags?.length || 0,
      contributorsCount: contributors?.length || 0,
    });

    // Get initial state
    const initialState = await State.findOne({ where: { isInitial: true } });
    if (!initialState) {
      await transaction.rollback();
      return res.status(400).json({ error: 'No initial state configured.' });
    }

    // Clean up data - convert empty strings to null
    const cleanDueDate = dueDate && dueDate.trim() !== '' ? dueDate : null;
    const cleanDescription = description && description.trim() !== '' ? description.trim() : null;
    const cleanTags = Array.isArray(tags) ? tags : [];

    // Create entity
    const entity = await Entity.create({
      name: name.trim(),
      type: type || 'article',
      description: cleanDescription,
      priority: priority || 'medium',
      dueDate: cleanDueDate,
      tags: cleanTags,
      currentStateId: initialState.id,
      createdBy: req.user.id,
    }, { transaction });

    // Add creator as owner
    await EntityContributor.create({
      entityId: entity.id,
      contributorId: req.user.id,
      role: 'owner',
    }, { transaction });

    // Add other contributors if specified
    if (contributors && contributors.length > 0) {
      for (const contrib of contributors) {
        if (contrib.id !== req.user.id) {
          await EntityContributor.create({
            entityId: entity.id,
            contributorId: contrib.id,
            role: contrib.role || 'editor',
          }, { transaction });
        }
      }
    }

    // Create initial history entry
    await EntityHistory.create({
      entityId: entity.id,
      newStateId: initialState.id,
      changedById: req.user.id,
      action: 'created',
      comment: 'Entity created',
    }, { transaction });

    // Create initial version
    await Version.create({
      entityId: entity.id,
      versionNumber: 1,
      title: name,
      content: description,
      createdById: req.user.id,
      isCurrent: true,
    }, { transaction });

    await transaction.commit();

    // Fetch complete entity with relations
    const completeEntity = await Entity.findByPk(entity.id, {
      include: [
        { model: State, as: 'currentState' },
        { model: Contributor, as: 'creator', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: Contributor, as: 'contributors', attributes: ['id', 'name', 'email', 'avatar'] },
      ],
    });

    res.status(201).json({
      message: 'Entity created successfully.',
      entity: completeEntity,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create entity error:', error);
    res.status(500).json({ error: 'Failed to create entity.' });
  }
};

// Update entity
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, priority, dueDate, tags, metadata } = req.body;

    const entity = await Entity.findByPk(id);
    if (!entity) {
      return res.status(404).json({ error: 'Entity not found.' });
    }

    // Record changes for history
    const changes = {};
    if (name && name !== entity.name) changes.name = { old: entity.name, new: name };
    if (description !== undefined && description !== entity.description) {
      changes.description = { old: entity.description, new: description };
    }
    if (priority && priority !== entity.priority) changes.priority = { old: entity.priority, new: priority };

    await entity.update({ name, description, priority, dueDate, tags, metadata });

    // Log history if there were changes
    if (Object.keys(changes).length > 0) {
      await EntityHistory.create({
        entityId: entity.id,
        changedById: req.user.id,
        action: 'updated',
        changes,
        comment: `Updated: ${Object.keys(changes).join(', ')}`,
      });
    }

    const updatedEntity = await Entity.findByPk(id, {
      include: [
        { model: State, as: 'currentState' },
        { model: Contributor, as: 'creator', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: Contributor, as: 'contributors', attributes: ['id', 'name', 'email', 'avatar'] },
      ],
    });

    res.json({
      message: 'Entity updated successfully.',
      entity: updatedEntity,
    });
  } catch (error) {
    console.error('Update entity error:', error);
    res.status(500).json({ error: 'Failed to update entity.' });
  }
};

// Change entity state
const changeState = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { stateId, comment } = req.body;

    const entity = await Entity.findByPk(id, { transaction });
    if (!entity) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Entity not found.' });
    }

    const newState = await State.findByPk(stateId);
    if (!newState) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Invalid state.' });
    }

    const oldStateId = entity.currentStateId;

    // Update entity state
    await entity.update({ currentStateId: stateId }, { transaction });

    // Create history entry
    await EntityHistory.create({
      entityId: entity.id,
      oldStateId,
      newStateId: stateId,
      changedById: req.user.id,
      action: 'state_change',
      comment,
    }, { transaction });

    await transaction.commit();

    const updatedEntity = await Entity.findByPk(id, {
      include: [
        { model: State, as: 'currentState' },
        { model: Contributor, as: 'creator', attributes: ['id', 'name', 'email', 'avatar'] },
      ],
    });

    res.json({
      message: 'State changed successfully.',
      entity: updatedEntity,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Change state error:', error);
    res.status(500).json({ error: 'Failed to change state.' });
  }
};

// Delete entity (soft delete)
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const entity = await Entity.findByPk(id);
    if (!entity) {
      return res.status(404).json({ error: 'Entity not found.' });
    }

    await entity.destroy();

    res.json({ message: 'Entity deleted successfully.' });
  } catch (error) {
    console.error('Delete entity error:', error);
    res.status(500).json({ error: 'Failed to delete entity.' });
  }
};

// Add contributor to entity
const addContributor = async (req, res) => {
  try {
    const { id } = req.params;
    const { contributorId, role } = req.body;

    const entity = await Entity.findByPk(id);
    if (!entity) {
      return res.status(404).json({ error: 'Entity not found.' });
    }

    const contributor = await Contributor.findByPk(contributorId);
    if (!contributor) {
      return res.status(404).json({ error: 'Contributor not found.' });
    }

    // Check if already assigned
    const existing = await EntityContributor.findOne({
      where: { entityId: id, contributorId },
    });

    if (existing) {
      await existing.update({ role: role || existing.role });
    } else {
      await EntityContributor.create({
        entityId: id,
        contributorId,
        role: role || 'editor',
      });
    }

    // Log history
    await EntityHistory.create({
      entityId: id,
      changedById: req.user.id,
      action: 'contributor_added',
      comment: `Added ${contributor.name} as ${role || 'editor'}`,
    });

    res.json({ message: 'Contributor added successfully.' });
  } catch (error) {
    console.error('Add contributor error:', error);
    res.status(500).json({ error: 'Failed to add contributor.' });
  }
};

// Remove contributor from entity
const removeContributor = async (req, res) => {
  try {
    const { id, contributorId } = req.params;

    const result = await EntityContributor.destroy({
      where: { entityId: id, contributorId },
    });

    if (result === 0) {
      return res.status(404).json({ error: 'Contributor not assigned to this entity.' });
    }

    res.json({ message: 'Contributor removed successfully.' });
  } catch (error) {
    console.error('Remove contributor error:', error);
    res.status(500).json({ error: 'Failed to remove contributor.' });
  }
};

// Get entity timeline
const getTimeline = async (req, res) => {
  try {
    const { id } = req.params;

    const history = await EntityHistory.findAll({
      where: { entityId: id },
      include: [
        { model: State, as: 'oldState' },
        { model: State, as: 'newState' },
        { model: Contributor, as: 'changedBy', attributes: ['id', 'name', 'avatar'] },
      ],
      order: [['createdAt', 'ASC']],
    });

    res.json({ timeline: history });
  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({ error: 'Failed to fetch timeline.' });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  changeState,
  remove,
  addContributor,
  removeContributor,
  getTimeline,
};

