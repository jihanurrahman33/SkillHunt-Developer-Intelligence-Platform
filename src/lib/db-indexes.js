// Database indexes setup
// Run once on application startup or via a setup script

import connectToDatabase from '@/lib/db';

export async function setupIndexes() {
  const db = await connectToDatabase();

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
    { key: { name: 'text', bio: 'text', location: 'text' } },
    { key: { techStack: 1 } },
    { key: { currentStatus: 1 } },
    { key: { location: 1 } },
    { key: { activityScore: -1 } },
    { key: { lastActivityAt: -1 } },
    { key: { createdAt: -1 } },
  ]);

  // Recruitment records
  await db.collection('recruitmentRecords').createIndexes([
    { key: { developerId: 1, campaignId: 1 } },
    { key: { recruiterId: 1 } },
    { key: { status: 1 } },
    { key: { updatedAt: -1 } },
  ]);

  // Campaigns
  await db.collection('campaigns').createIndexes([
    { key: { createdBy: 1 } },
    { key: { status: 1 } },
    { key: { createdAt: -1 } },
  ]);

  // Activity logs
  await db.collection('activityLogs').createIndexes([
    { key: { developerId: 1, createdAt: -1 } },
    { key: { type: 1 } },
    { key: { createdAt: -1 } },
  ]);

  console.log('Database indexes created successfully');
}

export default setupIndexes;
