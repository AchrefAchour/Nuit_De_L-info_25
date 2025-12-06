/**
 * Database initialization script
 * Run with: npm run db:init
 */

require('dotenv').config();
const { sequelize, State, Contributor } = require('../models');

const defaultStates = [
  { name: 'draft', label: 'Brouillon', color: '#6B7280', order: 1, isInitial: true, description: 'Document en cours de rédaction' },
  { name: 'submitted', label: 'Soumis', color: '#3B82F6', order: 2, description: 'Document soumis pour révision' },
  { name: 'review', label: 'En révision', color: '#F59E0B', order: 3, description: 'Document en cours de révision' },
  { name: 'validated', label: 'Validé', color: '#10B981', order: 4, description: 'Document validé' },
  { name: 'published', label: 'Publié', color: '#8B5CF6', order: 5, isFinal: true, description: 'Document publié' },
  { name: 'rejected', label: 'Rejeté', color: '#EF4444', order: 6, description: 'Document rejeté' },
];

const initializeDatabase = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    console.log('🔄 Synchronizing models...');
    await sequelize.sync({ force: process.argv.includes('--force') });
    console.log('✅ Models synchronized.');

    console.log('🔄 Creating default states...');
    for (const stateData of defaultStates) {
      const [state, created] = await State.findOrCreate({
        where: { name: stateData.name },
        defaults: stateData,
      });
      console.log(`  ${created ? '✅ Created' : '⏭️  Exists'}: ${stateData.label}`);
    }

    // Create admin user if not exists
    console.log('🔄 Creating admin user...');
    const [admin, adminCreated] = await Contributor.findOrCreate({
      where: { email: 'admin@lifecycle.local' },
      defaults: {
        name: 'Administrator',
        email: 'admin@lifecycle.local',
        password: 'admin123',
        role: 'admin',
      },
    });
    console.log(`  ${adminCreated ? '✅ Created' : '⏭️  Exists'}: Admin user (admin@lifecycle.local / admin123)`);

    console.log('\n🎉 Database initialization complete!');
    console.log('\nDefault admin credentials:');
    console.log('  Email: admin@lifecycle.local');
    console.log('  Password: admin123');
    console.log('\n⚠️  Please change the admin password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

initializeDatabase();

