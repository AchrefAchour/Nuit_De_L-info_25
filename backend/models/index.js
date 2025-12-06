const { Sequelize } = require('sequelize');
const config = require('../config');

// Use DATABASE_URL directly if available (for Render), otherwise use individual config
let sequelize;
if (config.database.url) {
  sequelize = new Sequelize(config.database.url, {
    dialect: 'postgres',
    logging: config.server.env === 'development' ? console.log : false,
    dialectOptions: {
      ssl: config.server.env === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  sequelize = new Sequelize(
    config.database.name,
    config.database.user,
    config.database.password,
    {
      host: config.database.host,
      port: config.database.port,
      dialect: 'postgres',
      logging: config.server.env === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

const State = require('./State')(sequelize);
const Contributor = require('./Contributor')(sequelize);
const Entity = require('./Entity')(sequelize);
const EntityHistory = require('./EntityHistory')(sequelize);
const Version = require('./Version')(sequelize);
const File = require('./File')(sequelize);


Entity.belongsTo(State, { as: 'currentState', foreignKey: 'currentStateId' });
State.hasMany(Entity, { foreignKey: 'currentStateId' });

Entity.belongsTo(Contributor, { as: 'creator', foreignKey: 'createdBy' });
Contributor.hasMany(Entity, { as: 'createdEntities', foreignKey: 'createdBy' });

EntityHistory.belongsTo(Entity, { foreignKey: 'entityId' });
Entity.hasMany(EntityHistory, { as: 'history', foreignKey: 'entityId' });

EntityHistory.belongsTo(State, { as: 'oldState', foreignKey: 'oldStateId' });
EntityHistory.belongsTo(State, { as: 'newState', foreignKey: 'newStateId' });
EntityHistory.belongsTo(Contributor, { as: 'changedBy', foreignKey: 'changedById' });

Version.belongsTo(Entity, { foreignKey: 'entityId' });
Entity.hasMany(Version, { as: 'versions', foreignKey: 'entityId' });

Version.belongsTo(Contributor, { as: 'createdBy', foreignKey: 'createdById' });
Contributor.hasMany(Version, { as: 'createdVersions', foreignKey: 'createdById' });

File.belongsTo(Version, { foreignKey: 'versionId' });
Version.hasMany(File, { as: 'files', foreignKey: 'versionId' });

File.belongsTo(Contributor, { as: 'uploadedBy', foreignKey: 'uploadedById' });
Contributor.hasMany(File, { as: 'uploadedFiles', foreignKey: 'uploadedById' });

const EntityContributor = sequelize.define('EntityContributor', {
  role: {
    type: Sequelize.ENUM('owner', 'editor', 'viewer'),
    defaultValue: 'editor',
  },
  assignedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
}, {
  tableName: 'entity_contributors',
  timestamps: false,
});

Entity.belongsToMany(Contributor, { 
  through: EntityContributor, 
  as: 'contributors',
  foreignKey: 'entityId',
});
Contributor.belongsToMany(Entity, { 
  through: EntityContributor, 
  as: 'assignedEntities',
  foreignKey: 'contributorId',
});

module.exports = {
  sequelize,
  Sequelize,
  State,
  Contributor,
  Entity,
  EntityHistory,
  Version,
  File,
  EntityContributor,
};

