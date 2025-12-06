const { Op } = require('sequelize');
const { Contributor, Entity, EntityContributor } = require('../models');

// Get all contributors
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, role, isActive } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }
    
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const { count, rows } = await Contributor.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset,
      order: [['name', 'ASC']],
    });

    res.json({
      contributors: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get contributors error:', error);
    res.status(500).json({ error: 'Failed to fetch contributors.' });
  }
};

// Get single contributor by ID
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const contributor = await Contributor.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Entity,
          as: 'assignedEntities',
          through: { attributes: ['role'] },
          include: [{ model: require('../models').State, as: 'currentState' }],
        },
      ],
    });

    if (!contributor) {
      return res.status(404).json({ error: 'Contributor not found.' });
    }

    res.json({ contributor });
  } catch (error) {
    console.error('Get contributor error:', error);
    res.status(500).json({ error: 'Failed to fetch contributor.' });
  }
};

// Create new contributor (admin only)
const create = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email already exists
    const existing = await Contributor.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const contributor = await Contributor.create({
      name,
      email,
      password,
      role: role || 'contributor',
    });

    res.status(201).json({
      message: 'Contributor created successfully.',
      contributor: contributor.toJSON(),
    });
  } catch (error) {
    console.error('Create contributor error:', error);
    res.status(500).json({ error: 'Failed to create contributor.' });
  }
};

// Update contributor
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive, avatar } = req.body;

    const contributor = await Contributor.findByPk(id);
    if (!contributor) {
      return res.status(404).json({ error: 'Contributor not found.' });
    }

    // Check email uniqueness if changing
    if (email && email !== contributor.email) {
      const existing = await Contributor.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ error: 'Email already in use.' });
      }
    }

    await contributor.update({ name, email, role, isActive, avatar });

    res.json({
      message: 'Contributor updated successfully.',
      contributor: contributor.toJSON(),
    });
  } catch (error) {
    console.error('Update contributor error:', error);
    res.status(500).json({ error: 'Failed to update contributor.' });
  }
};

// Reset password (admin only)
const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const contributor = await Contributor.findByPk(id);
    if (!contributor) {
      return res.status(404).json({ error: 'Contributor not found.' });
    }

    await contributor.update({ password: newPassword });

    res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
};

// Deactivate contributor
const deactivate = async (req, res) => {
  try {
    const { id } = req.params;

    const contributor = await Contributor.findByPk(id);
    if (!contributor) {
      return res.status(404).json({ error: 'Contributor not found.' });
    }

    await contributor.update({ isActive: false });

    res.json({ message: 'Contributor deactivated successfully.' });
  } catch (error) {
    console.error('Deactivate contributor error:', error);
    res.status(500).json({ error: 'Failed to deactivate contributor.' });
  }
};

// Delete contributor (admin only)
const deleteContributor = async (req, res) => {
  const { sequelize } = require('../models');
  
  try {
    const { id } = req.params;
    const contributorId = parseInt(id);
    const adminId = req.user.id;

    // Cannot delete yourself
    if (contributorId === adminId) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' });
    }

    const contributor = await Contributor.findByPk(contributorId);
    if (!contributor) {
      return res.status(404).json({ error: 'Contributeur non trouvé.' });
    }

    // Use raw SQL queries to bypass Sequelize constraints
    // 1. Transfer entities (including soft-deleted)
    await sequelize.query(
      `UPDATE entities SET "createdBy" = :adminId WHERE "createdBy" = :contributorId`,
      { replacements: { adminId, contributorId } }
    );

    // 2. Transfer versions
    await sequelize.query(
      `UPDATE versions SET "createdById" = :adminId WHERE "createdById" = :contributorId`,
      { replacements: { adminId, contributorId } }
    );

    // 3. Transfer files
    await sequelize.query(
      `UPDATE files SET "uploadedById" = :adminId WHERE "uploadedById" = :contributorId`,
      { replacements: { adminId, contributorId } }
    );

    // 4. Transfer history entries
    await sequelize.query(
      `UPDATE entity_history SET "changedById" = :adminId WHERE "changedById" = :contributorId`,
      { replacements: { adminId, contributorId } }
    );

    // 5. Delete entity_contributors associations
    await sequelize.query(
      `DELETE FROM entity_contributors WHERE "contributorId" = :contributorId`,
      { replacements: { contributorId } }
    );
    
    // 6. Finally delete the contributor
    await sequelize.query(
      `DELETE FROM contributors WHERE id = :contributorId`,
      { replacements: { contributorId } }
    );

    res.json({ message: 'Contributeur supprimé avec succès.' });
  } catch (error) {
    console.error('Delete contributor error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression: ' + error.message });
  }
};

// Get contributor statistics
const getStats = async (req, res) => {
  try {
    const { id } = req.params;

    const contributor = await Contributor.findByPk(id);
    if (!contributor) {
      return res.status(404).json({ error: 'Contributor not found.' });
    }

    const entityCount = await EntityContributor.count({
      where: { contributorId: id },
    });

    const createdCount = await Entity.count({
      where: { createdBy: id },
    });

    const versionCount = await require('../models').Version.count({
      where: { createdById: id },
    });

    res.json({
      stats: {
        assignedEntities: entityCount,
        createdEntities: createdCount,
        createdVersions: versionCount,
      },
    });
  } catch (error) {
    console.error('Get contributor stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics.' });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  resetPassword,
  deactivate,
  deleteContributor,
  getStats,
};

