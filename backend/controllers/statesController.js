const { State, Entity } = require('../models');

// Get all states
const getAll = async (req, res) => {
  try {
    const states = await State.findAll({
      order: [['order', 'ASC']],
    });

    res.json({ states });
  } catch (error) {
    console.error('Get states error:', error);
    res.status(500).json({ error: 'Failed to fetch states.' });
  }
};

// Get single state by ID
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const state = await State.findByPk(id);

    if (!state) {
      return res.status(404).json({ error: 'State not found.' });
    }

    res.json({ state });
  } catch (error) {
    console.error('Get state error:', error);
    res.status(500).json({ error: 'Failed to fetch state.' });
  }
};

// Create new state
const create = async (req, res) => {
  try {
    const { name, label, color, order, description, isInitial, isFinal } = req.body;

    // If this is set as initial, unset any existing initial state
    if (isInitial) {
      await State.update({ isInitial: false }, { where: { isInitial: true } });
    }

    const state = await State.create({
      name,
      label,
      color,
      order,
      description,
      isInitial,
      isFinal,
    });

    res.status(201).json({
      message: 'State created successfully.',
      state,
    });
  } catch (error) {
    console.error('Create state error:', error);
    res.status(500).json({ error: 'Failed to create state.' });
  }
};

// Update state
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, label, color, order, description, isInitial, isFinal } = req.body;

    const state = await State.findByPk(id);
    if (!state) {
      return res.status(404).json({ error: 'State not found.' });
    }

    // If setting as initial, unset others
    if (isInitial && !state.isInitial) {
      await State.update({ isInitial: false }, { where: { isInitial: true } });
    }

    await state.update({
      name,
      label,
      color,
      order,
      description,
      isInitial,
      isFinal,
    });

    res.json({
      message: 'State updated successfully.',
      state,
    });
  } catch (error) {
    console.error('Update state error:', error);
    res.status(500).json({ error: 'Failed to update state.' });
  }
};

// Delete state
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if any entities are using this state
    const entityCount = await Entity.count({ where: { currentStateId: id } });
    if (entityCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete state that is in use.',
        entitiesCount: entityCount,
      });
    }

    const state = await State.findByPk(id);
    if (!state) {
      return res.status(404).json({ error: 'State not found.' });
    }

    await state.destroy();

    res.json({ message: 'State deleted successfully.' });
  } catch (error) {
    console.error('Delete state error:', error);
    res.status(500).json({ error: 'Failed to delete state.' });
  }
};

// Initialize default states
const initializeDefaults = async (req, res) => {
  try {
    const defaultStates = [
      { name: 'draft', label: 'Brouillon', color: '#6B7280', order: 1, isInitial: true, description: 'Document en cours de rédaction' },
      { name: 'submitted', label: 'Soumis', color: '#3B82F6', order: 2, description: 'Document soumis pour révision' },
      { name: 'review', label: 'En révision', color: '#F59E0B', order: 3, description: 'Document en cours de révision' },
      { name: 'validated', label: 'Validé', color: '#10B981', order: 4, description: 'Document validé' },
      { name: 'published', label: 'Publié', color: '#8B5CF6', order: 5, isFinal: true, description: 'Document publié' },
      { name: 'rejected', label: 'Rejeté', color: '#EF4444', order: 6, description: 'Document rejeté' },
    ];

    for (const stateData of defaultStates) {
      const [state, created] = await State.findOrCreate({
        where: { name: stateData.name },
        defaults: stateData,
      });
      
      if (!created) {
        await state.update(stateData);
      }
    }

    const states = await State.findAll({ order: [['order', 'ASC']] });

    res.json({
      message: 'Default states initialized.',
      states,
    });
  } catch (error) {
    console.error('Initialize states error:', error);
    res.status(500).json({ error: 'Failed to initialize states.' });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  initializeDefaults,
};

