const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Version = sequelize.define('Version', {
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
    versionNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
    },
    content: {
      type: DataTypes.TEXT,
    },
    summary: {
      type: DataTypes.TEXT,
    },
    createdById: {
      type: DataTypes.INTEGER,
      references: {
        model: 'contributors',
        key: 'id',
      },
    },
    isCurrent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  }, {
    tableName: 'versions',
    timestamps: true,
    updatedAt: false,
  });

  return Version;
};

