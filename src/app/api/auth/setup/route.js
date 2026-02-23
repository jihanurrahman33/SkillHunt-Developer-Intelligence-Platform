// Setup API — run database initialization
// POST /api/auth/setup
// Creates indexes and verifies DB connection

import connectToDatabase from '@/lib/db';
import { apiError, apiSuccess } from '@/lib/api-guard';

async function setupIndexes(db) {
  // Users collection
  await db.collection('users').createIndexes([
    { key: { email: 1 }, unique: true },
    { key: { role: 1 } },
    { key: { provider: 1 } },
    { key: { createdAt: -1 } },
  ]);

  // Developers collection
  await db.collection('developers').createIndexes([
    { key: { profileHash: 1 }, unique: true },
    { key: { username: 1 }, unique: true },
    { key: { name: "text", bio: "text", location: "text" } },
    { key: { techStack: 1 } },
    { key: { currentStatus: 1 } },
    { key: { activityScore: -1 } },
    { key: { createdAt: -1 } },
  ]);

  // Campaigns
  await db.collection('campaigns').createIndexes([
    { key: { status: 1 } },
    { key: { createdAt: -1 } },
  ]);

  // Activity logs
  await db.collection('activityLogs').createIndexes([
    { key: { developerId: 1, createdAt: -1 } },
    { key: { createdAt: -1 } },
  ]);
}

export async function POST() {
  try {
    // Test DB connection
    const db = await connectToDatabase();
    await db.command({ ping: 1 });

    // Create indexes
    await setupIndexes(db);

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

