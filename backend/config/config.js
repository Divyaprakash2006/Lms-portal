module.exports = {
  // Development Configuration
  development: {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/lms',
    jwtSecret: process.env.JWT_SECRET || 'dev_secret_key',
    jwtExpire: process.env.JWT_EXPIRE || '30d',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    maxFileSize: process.env.MAX_FILE_SIZE || 10485760, // 10MB
    uploadDir: process.env.UPLOAD_DIR || './uploads'
  },

  // Production Configuration
  production: {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    frontendUrl: process.env.FRONTEND_URL,
    maxFileSize: process.env.MAX_FILE_SIZE || 10485760,
    uploadDir: process.env.UPLOAD_DIR || './uploads'
  },

  // Test Configuration
  test: {
    port: 5001,
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/lms_test',
    jwtSecret: 'test_secret_key',
    jwtExpire: '1d',
    frontendUrl: 'http://localhost:3000',
    maxFileSize: 5242880, // 5MB
    uploadDir: './uploads_test'
  }
};
