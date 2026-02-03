import 'dotenv/config';
import { app } from './app';
import { prisma } from './config/database';

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Check Database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

start();
