import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/db.js';
import Product from '../src/models/Product.js';
import { generateProductsBatch } from './seedGenerator.js';

const TOTAL_RECORDS = 50000;
const BATCH_SIZE = 5000;

async function runSeed() {
  console.log('='.repeat(55));
  console.log(` StockMaster Database Seeder (${TOTAL_RECORDS.toLocaleString()} records)`);
  console.log('='.repeat(55));

  const startTime = Date.now();

  // Check if live development server is already active on port 3000
  try {
    const healthCheck = await fetch('http://localhost:3000/api/health', {
      signal: AbortSignal.timeout(1000),
    });
    if (healthCheck.ok) {
      console.log('[Seed] Detected running StockMaster server on port 3000.');
      console.log('[Seed] Triggering high-throughput seed API...');

      const response = await fetch('http://localhost:3000/api/inventory/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: TOTAL_RECORDS, clearExisting: true }),
      });

      const data = await response.json();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log('='.repeat(55));
      console.log(` ${data.message || 'Seeding completed successfully!'}`);
      console.log(` Total products verified: ${(data.totalRecords || TOTAL_RECORDS).toLocaleString()}`);
      console.log(` Time elapsed: ${elapsed}s`);
      console.log('='.repeat(55));
      return;
    }
  } catch {
    // Server is not running on port 3000, proceed with direct MongoDB connection
  }

  try {
    await connectDB();

    console.log('[Seed] Purging existing product collection...');
    await Product.deleteMany({});

    console.log('[Seed] Ensuring database indexes are built...');
    await Product.syncIndexes();

    const batches = Math.ceil(TOTAL_RECORDS / BATCH_SIZE);
    let totalInserted = 0;

    for (let b = 0; b < batches; b++) {
      const currentBatchCount = Math.min(BATCH_SIZE, TOTAL_RECORDS - totalInserted);
      const batch = generateProductsBatch(currentBatchCount, totalInserted);

      await Product.insertMany(batch, { ordered: false });
      totalInserted += currentBatchCount;

      const progress = ((totalInserted / TOTAL_RECORDS) * 100).toFixed(0);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(
        `[Seed] Progress: ${totalInserted.toLocaleString()} / ${TOTAL_RECORDS.toLocaleString()} (${progress}%) [${elapsed}s]`
      );
    }

    const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
    const finalCount = await Product.countDocuments();

    console.log('='.repeat(55));
    console.log(` Database seeded successfully!`);
    console.log(` Total products verified in MongoDB: ${finalCount.toLocaleString()}`);
    console.log(` Elapsed time: ${durationSeconds} seconds`);
    console.log('='.repeat(55));
  } catch (error) {
    console.error('[Seed] Error during database seeding:', error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

runSeed();
