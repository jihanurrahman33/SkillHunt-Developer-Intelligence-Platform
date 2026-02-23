import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'skillhunt';

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in environment variables.');
  process.exit(1);
}

async function setupDatabase() {
  console.log('Connecting to MongoDB...');
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);
  console.log(`Connected to database: ${DB_NAME}`);

  try {
    // Users collection
    console.log('Creating indexes for: users');
    await db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { role: 1 } },
      { key: { provider: 1 } },
      { key: { createdAt: -1 } },
    ]);

    // Developers collection
    console.log('Creating indexes for: developers');
    await db.collection('developers').createIndexes([
      { key: { profileHash: 1 }, unique: true },
      { key: { username: 1 }, unique: true },
      { key: { name: 'text', bio: 'text', location: 'text' } },
      { key: { techStack: 1 } },
      { key: { currentStatus: 1 } },
      { key: { location: 1 } },
      { key: { activityScore: -1 } },
      { key: { lastActivityAt: -1 } },
      { key: { createdAt: -1 } },
    ]);

    // Recruitment records
    console.log('Creating indexes for: recruitmentRecords');
    await db.collection('recruitmentRecords').createIndexes([
      { key: { developerId: 1, campaignId: 1 } },
      { key: { recruiterId: 1 } },
      { key: { status: 1 } },
      { key: { updatedAt: -1 } },
    ]);

    // Campaigns
    console.log('Creating indexes for: campaigns');
    await db.collection('campaigns').createIndexes([
      { key: { createdBy: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
      { key: { title: 'text', role: 'text' } },
    ]);

    // Activity logs
    console.log('Creating indexes for: activityLogs');
    await db.collection('activityLogs').createIndexes([
      { key: { developerId: 1, createdAt: -1 } },
      { key: { type: 1 } },
      { key: { createdAt: -1 } },
    ]);

    console.log('✅ Database setup and indexing complete!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await client.close();
  }
}

setupDatabase();
