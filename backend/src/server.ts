import app from './app';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'JWT_SECRET',
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease check your .env file.');
  process.exit(1);
}

// Optional environment variables with defaults
const PORT = process.env.BACKEND_PORT || process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start server
app.listen(PORT, () => {
  console.log('🚀 Server started successfully!');
  console.log(`📍 Environment: ${NODE_ENV}`);
  console.log(`📍 Backend URL: http://localhost:${PORT}`);
  console.log(`📍 Frontend URL: ${FRONTEND_URL}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log('\n✅ All environment variables validated');
});


