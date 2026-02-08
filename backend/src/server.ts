import dotenv from 'dotenv';

// Load environment variables FIRST (before any other imports that use env)
dotenv.config();

import app from './app';

// Validate required environment variables
const requiredEnvVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error('\nCopy backend/env.example to backend/.env and fill in your values.');
  process.exit(1);
}

const PORT = process.env.BACKEND_PORT || process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';
const PLACEHOLDER_URL = 'postgresql://localhost:5432/dummy';
const useDatabase =
  !!process.env.DATABASE_URL && process.env.DATABASE_URL !== PLACEHOLDER_URL;

async function startServer() {
  if (useDatabase) {
    try {
      const { prisma } = await import('./lib/prisma');
      await prisma.$connect();
      console.log('✅ Database connected (PostgreSQL)');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      console.error('   Tip: Run "docker-compose up -d" for local PostgreSQL');
      process.exit(1);
    }
  } else {
    console.log('📦 Using in-memory storage (set DATABASE_URL for PostgreSQL)');
  }

  app.listen(PORT, () => {
    console.log('🚀 Server started successfully!');
    console.log(`📍 Backend: http://localhost:${PORT}`);
    console.log(`📍 Frontend: ${FRONTEND_URL}`);
    console.log(`📍 Health: http://localhost:${PORT}/health`);
  });
}

startServer();


