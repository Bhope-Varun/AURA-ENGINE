import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import inventoryRoutes from './routes/inventoryRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { connectDB } from './config/db.js';

export const createApp = () => {
  const app = express();

  // Security middleware with relaxed CSP for local/preview scripts
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(cors());
  app.use(express.json({ limit: '2mb' }));

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Mount API modules
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/analytics', analyticsRoutes);

  // Global error handler
  app.use(errorHandler);

  return app;
};

export const startServer = async (port = process.env.PORT || 3000) => {
  await connectDB();
  const app = createApp();

  const server = app.listen(port, () => {
    console.log(`[Server] Inventory API running on port ${port}`);
  });

  return { app, server };
};

export default createApp;
