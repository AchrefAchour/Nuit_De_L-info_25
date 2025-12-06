const { Op, fn, col, literal } = require('sequelize');
const { 
  Entity, 
  State, 
  Contributor, 
  EntityHistory, 
  Version, 
  File,
  sequelize 
} = require('../models');

// Get global statistics
const getGlobalStats = async (req, res) => {
  try {
    const totalEntities = await Entity.count();
    const totalContributors = await Contributor.count({ where: { isActive: true } });
    const totalVersions = await Version.count();
    const totalFiles = await File.count();

    // Entities by state
    const entitiesByState = await Entity.findAll({
      attributes: [
        'currentStateId',
        [fn('COUNT', col('Entity.id')), 'count'],
      ],
      include: [{ model: State, as: 'currentState', attributes: ['name', 'label', 'color'] }],
      group: ['currentStateId', 'currentState.id'],
      raw: true,
      nest: true,
    });

    // Entities by type
    const entitiesByType = await Entity.findAll({
      attributes: [
        'type',
        [fn('COUNT', col('id')), 'count'],
      ],
      group: ['type'],
      raw: true,
    });

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await EntityHistory.count({
      where: {
        createdAt: { [Op.gte]: thirtyDaysAgo },
      },
    });

    const newEntities = await Entity.count({
      where: {
        createdAt: { [Op.gte]: thirtyDaysAgo },
      },
    });

    res.json({
      stats: {
        totalEntities,
        totalContributors,
        totalVersions,
        totalFiles,
        entitiesByState,
        entitiesByType,
        recentActivity,
        newEntitiesLast30Days: newEntities,
      },
    });
  } catch (error) {
    console.error('Get global stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics.' });
  }
};

// Get entity statistics
const getEntityStats = async (req, res) => {
  try {
    const { id } = req.params;

    const entity = await Entity.findByPk(id);
    if (!entity) {
      return res.status(404).json({ error: 'Entity not found.' });
    }

    // Count versions
    const versionCount = await Version.count({ where: { entityId: id } });

    // Count files across all versions
    const fileCount = await File.count({
      include: [{
        model: Version,
        where: { entityId: id },
        attributes: [],
      }],
    });

    // Count state changes
    const stateChangeCount = await EntityHistory.count({
      where: { 
        entityId: id,
        action: 'state_change',
      },
    });

    // Get time spent in each state
    const history = await EntityHistory.findAll({
      where: { 
        entityId: id,
        action: 'state_change',
      },
      include: [
        { model: State, as: 'oldState', attributes: ['id', 'name', 'label'] },
        { model: State, as: 'newState', attributes: ['id', 'name', 'label'] },
      ],
      order: [['createdAt', 'ASC']],
    });

    // Calculate time in each state
    const timeInStates = {};
    let previousTime = entity.createdAt;

    for (let i = 0; i < history.length; i++) {
      const record = history[i];
      const currentTime = record.createdAt;
      const stateName = record.oldState ? record.oldState.name : 'initial';
      
      if (!timeInStates[stateName]) {
        timeInStates[stateName] = 0;
      }
      
      timeInStates[stateName] += (new Date(currentTime) - new Date(previousTime));
      previousTime = currentTime;
    }

    // Add time in current state
    const currentStateName = entity.currentState ? entity.currentState.name : 'unknown';
    if (!timeInStates[currentStateName]) {
      timeInStates[currentStateName] = 0;
    }
    timeInStates[currentStateName] += (new Date() - new Date(previousTime));

    // Convert to readable format
    const timeInStatesReadable = {};
    for (const [state, ms] of Object.entries(timeInStates)) {
      const hours = Math.floor(ms / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      timeInStatesReadable[state] = {
        milliseconds: ms,
        hours,
        days,
        readable: days > 0 ? `${days}j ${hours % 24}h` : `${hours}h`,
      };
    }

    // Contributors count
    const contributorCount = await sequelize.query(
      `SELECT COUNT(DISTINCT "contributorId") as count 
       FROM "entity_contributors" 
       WHERE "entityId" = :entityId`,
      {
        replacements: { entityId: id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json({
      stats: {
        versionCount,
        fileCount,
        stateChangeCount,
        contributorCount: parseInt(contributorCount[0]?.count || 0),
        timeInStates: timeInStatesReadable,
        createdAt: entity.createdAt,
        lastUpdated: entity.updatedAt,
        ageInDays: Math.floor((new Date() - new Date(entity.createdAt)) / (1000 * 60 * 60 * 24)),
      },
    });
  } catch (error) {
    console.error('Get entity stats error:', error);
    res.status(500).json({ error: 'Failed to fetch entity statistics.' });
  }
};

// Get activity timeline for charts
const getActivityTimeline = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Daily activity count
    const dailyActivity = await EntityHistory.findAll({
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: {
        createdAt: { [Op.gte]: startDate },
      },
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']],
      raw: true,
    });

    // Daily new entities
    const dailyNewEntities = await Entity.findAll({
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: {
        createdAt: { [Op.gte]: startDate },
      },
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']],
      raw: true,
    });

    res.json({
      timeline: {
        activity: dailyActivity,
        newEntities: dailyNewEntities,
        period: {
          start: startDate,
          end: new Date(),
          days: parseInt(days),
        },
      },
    });
  } catch (error) {
    console.error('Get activity timeline error:', error);
    res.status(500).json({ error: 'Failed to fetch activity timeline.' });
  }
};

// Get top contributors
const getTopContributors = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topContributors = await EntityHistory.findAll({
      attributes: [
        'changedById',
        [fn('COUNT', col('EntityHistory.id')), 'activityCount'],
      ],
      include: [{
        model: Contributor,
        as: 'changedBy',
        attributes: ['id', 'name', 'email', 'avatar'],
      }],
      group: ['changedById', 'changedBy.id'],
      order: [[fn('COUNT', col('EntityHistory.id')), 'DESC']],
      limit: parseInt(limit),
    });

    res.json({ topContributors });
  } catch (error) {
    console.error('Get top contributors error:', error);
    res.status(500).json({ error: 'Failed to fetch top contributors.' });
  }
};

module.exports = {
  getGlobalStats,
  getEntityStats,
  getActivityTimeline,
  getTopContributors,
};

