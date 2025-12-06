const path = require('path');

// Parse DATABASE_URL if provided (Render format: postgres://user:password@host:port/database)
const parseDatabaseUrl = (url) => {
  if (!url) {
    return {
      name: process.env.DB_NAME || 'lifecycle_tracker',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
    };
  }

  try {
    const parsedUrl = new URL(url);
    return {
      name: parsedUrl.pathname.slice(1), // Remove leading '/'
      user: parsedUrl.username,
      password: parsedUrl.password,
      host: parsedUrl.hostname,
      port: parseInt(parsedUrl.port) || 5432,
    };
  } catch (error) {
    console.error('Error parsing DATABASE_URL:', error);
    return {
      name: process.env.DB_NAME || 'lifecycle_tracker',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
    };
  }
};

const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);

module.exports = {
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'production'
  },
  database: {
    url: process.env.DATABASE_URL,
    name: dbConfig.name,
    user: dbConfig.user,
    password: dbConfig.password,
    host: dbConfig.host,
    port: dbConfig.port,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  upload: {
    path: process.env.UPLOAD_PATH || path.join(__dirname, 'uploads'),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB par défaut
  }
};