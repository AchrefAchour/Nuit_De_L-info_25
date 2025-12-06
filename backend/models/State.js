const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const State = sequelize.define('State', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    label: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(7),
      defaultValue: '#6B7280',
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    description: {
      type: DataTypes.TEXT,
    },
    isInitial: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isFinal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'states',
    timestamps: true,
  });

  return State;
};

