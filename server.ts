import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './backend/src/config/db.js';
import { createApp } from './backend/src/server.js';
import Product from './backend/src/models/Product.js';
import { generateProductsBatch } from './backend/scripts/seedGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function start() {
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Connect to database
  await connectDB();

  // If database is completely empty on fresh run, seed an initial set of 5,000 products
  // so the dashboard and tables immediately show rich data upon first visit
  try {
    const existingCount = await Product.countDocuments();
    if (existingCount === 0) {
      console.log('[Bootstrap] Initializing database with starter catalog (5,000 records)...');
      const initialBatch = generateProductsBatch(5000, 0);
      await Product.insertMany(initialBatch, { ordered: false });
      console.log('[Bootstrap] Starter catalog successfully initialized.');
    } else {
      console.log(`[Bootstrap] Database contains ${existingCount.toLocaleString()} products.`);
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[Bootstrap] Notice during starter check:', errorMsg);
  }

  const app = createApp();

  if (!isProduction) {
    // Vite middleware for development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(` StockMaster Inventory System running on port ${PORT}`);
    console.log(` Environment: ${isProduction ? 'Production' : 'Development'}`);
    console.log(` API Endpoints: http://localhost:${PORT}/api/inventory`);
    console.log(`====================================================`);
  });
}

start().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
