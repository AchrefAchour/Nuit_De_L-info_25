const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EntityHistory = sequelize.define('EntityHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'entities',
        key: 'id',
      },
    },
    oldStateId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'states',
        key: 'id',
      },
    },
    newStateId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'states',
        key: 'id',
      },
    },
    changedById: {
      type: DataTypes.INTEGER,
      references: {
        model: 'contributors',
        key: 'id',
      },
    },
    action: {
      type: DataTypes.STRING(50),
      defaultValue: 'state_change',
    },
    comment: {
      type: DataTypes.TEXT,
    },
    changes: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  }, {
    tableName: 'entity_history',
    timestamps: true,
    updatedAt: false,
  });

  return EntityHistory;
};

