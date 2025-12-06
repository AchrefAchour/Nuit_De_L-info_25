// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const { sequelize } = require('./models');
const serverless = require('serverless-http');

// Ensure uploads directory exists
const uploadsDir = config.upload.path;
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`✅ Created uploads directory: ${uploadsDir}`);
}

const authRoutes = require('./routes/auth');
const entitiesRoutes = require('./routes/entities');
const statesRoutes = require('./routes/states');
const contributorsRoutes = require('./routes/contributors');
const versionsRoutes = require('./routes/versions');
const filesRoutes = require('./routes/files');
const statsRoutes = require('./routes/stats');
const aiRoutes = require('./routes/ai');

const app = express();

// Configure CORS to allow requests from Netlify frontend
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'https://nuitinfo25.netlify.app',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/entities', entitiesRoutes);
app.use('/api/states', statesRoutes);
app.use('/api/contributors', contributorsRoutes);
app.use('/api/versions', versionsRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: config.server.env === 'development' ? err.message : undefined,
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
module.exports.handler = serverless(app);

// Start server for Render (always start in production, or if running directly)
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Only sync with alter in development
    if (config.server.env === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized (alter mode).');
    } else {
      await sequelize.sync();
      console.log('✅ Database models synchronized.');
    }

    // Initialize default states if they don't exist
    const { State } = require('./models');
    const defaultStates = [
      { name: 'draft', label: 'Brouillon', color: '#6B7280', order: 1, isInitial: true, description: 'Document en cours de rédaction' },
      { name: 'submitted', label: 'Soumis', color: '#3B82F6', order: 2, description: 'Document soumis pour révision' },
      { name: 'review', label: 'En révision', color: '#F59E0B', order: 3, description: 'Document en cours de révision' },
      { name: 'validated', label: 'Validé', color: '#10B981', order: 4, description: 'Document validé' },
      { name: 'published', label: 'Publié', color: '#8B5CF6', order: 5, isFinal: true, description: 'Document publié' },
      { name: 'rejected', label: 'Rejeté', color: '#EF4444', order: 6, description: 'Document rejeté' },
    ];

    for (const stateData of defaultStates) {
      await State.findOrCreate({
        where: { name: stateData.name },
        defaults: stateData,
      });
    }
    console.log('✅ Default states initialized.');

    const port = config.server.port || 3001;
    app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

// Start server if this file is run directly (not imported)
if (require.main === module) {
  startServer();
}