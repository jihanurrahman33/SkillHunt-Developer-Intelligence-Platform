// Setup API — run database initialization
// POST /api/auth/setup
// Creates indexes and verifies DB connection

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import setupIndexes from '@/lib/db-indexes';

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

    return NextResponse.json({
      message: 'Database setup complete',
      database: db.databaseName,
      collections: collectionNames,
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      {
        error: 'Setup Failed',
        message: error.message || 'Could not connect to database',
      },
      { status: 500 }
    );
  }
}
