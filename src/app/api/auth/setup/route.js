// Setup API — run database initialization
// POST /api/auth/setup
// Creates indexes and verifies DB connection

import connectToDatabase from '@/lib/db';
import setupIndexes from '@/lib/db-indexes';
import { apiError, apiSuccess } from '@/lib/api-guard';

export async function POST() {
  try {
    // Test DB connection
    const db = await connectToDatabase();
    await db.command({ ping: 1 });

    // Create indexes
    await setupIndexes();

    // Get collection stats
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    return apiSuccess({
      message: 'Database setup complete',
      database: db.databaseName,
      collections: collectionNames,
    });
  } catch (error) {
    console.error('Setup error:', error);
    return apiError(error.message || 'Could not connect to database', 500);
  }
}

