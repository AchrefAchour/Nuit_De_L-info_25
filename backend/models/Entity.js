const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Entity = sequelize.define('Entity', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(50),
      defaultValue: 'article',
    },
    description: {
      type: DataTypes.TEXT,
    },
    currentStateId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'states',
        key: 'id',
      },
    },
    createdBy: {
      type: DataTypes.INTEGER,
      references: {
        model: 'contributors',
        key: 'id',
      },
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium',
    },
    dueDate: {
      type: DataTypes.DATE,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  }, {
    tableName: 'entities',
    timestamps: true,
    paranoid: true, 
  });

  return Entity;
};

