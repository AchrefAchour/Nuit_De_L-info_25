const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const Contributor = sequelize.define('Contributor', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'contributor', 'viewer'),
      defaultValue: 'contributor',
    },
    avatar: {
      type: DataTypes.STRING(255),
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'contributors',
    timestamps: true,
    hooks: {
      beforeCreate: async (contributor) => {
        if (contributor.password) {
          contributor.password = await bcrypt.hash(contributor.password, 10);
        }
      },
      beforeUpdate: async (contributor) => {
        if (contributor.changed('password')) {
          contributor.password = await bcrypt.hash(contributor.password, 10);
        }
      },
    },
  });

  // Instance method to check password
  Contributor.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  // Remove password from JSON output
  Contributor.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  return Contributor;
};

