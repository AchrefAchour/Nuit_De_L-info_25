const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const File = sequelize.define('File', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    versionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'versions',
        key: 'id',
      },
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    originalName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    filepath: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    mimetype: {
      type: DataTypes.STRING(100),
    },
    size: {
      type: DataTypes.BIGINT,
    },
    uploadedById: {
      type: DataTypes.INTEGER,
      references: {
        model: 'contributors',
        key: 'id',
      },
    },
    checksum: {
      type: DataTypes.STRING(64),
    },
  }, {
    tableName: 'files',
    timestamps: true,
    updatedAt: false,
  });

  return File;
};

