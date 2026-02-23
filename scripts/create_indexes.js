const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function createIndexes() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('skillhunt');
    
    console.log('Connected to database. Creating indices...');

    // 1. Developers Collection
    const developers = db.collection('developers');
    
    // Create Compound text index for powerful & scalable keyword searching
    await developers.createIndex({
      name: 'text',
      username: 'text',
      techStack: 'text',
      location: 'text',
      bio: 'text'
    }, {
      name: 'developer_keyword_search_idx',
      weights: {
        name: 10,
        username: 8,
        techStack: 5,
        location: 3,
        bio: 1
      }
    });
    console.log('✅ Created text search index on developers.');

    // Common query indexes for developers
    await developers.createIndex({ currentStatus: 1 });
    await developers.createIndex({ readinessLevel: 1 });
    await developers.createIndex({ campaignId: 1 });
    await developers.createIndex({ createdAt: -1 }); // Used for default sorting
    console.log('✅ Created compound/sort indexes on developers.');

    // 2. Campaigns Collection
    const campaigns = db.collection('campaigns');
    
    await campaigns.createIndex({
      title: 'text',
      role: 'text',
      description: 'text'
    }, {
      name: 'campaign_search_idx',
      weights: { title: 10, role: 8, description: 2 }
    });
    
    await campaigns.createIndex({ status: 1 });
    await campaigns.createIndex({ 'createdBy.id': 1 }); // For filtering by owner
    console.log('✅ Created search and filter indexes on campaigns.');

    // 3. Activity Logs Collection
    const activityLogs = db.collection('activityLogs');
    // Needed for global activity feed sorting and developer log aggregation
    await activityLogs.createIndex({ developerId: 1, createdAt: -1 }); 
    await activityLogs.createIndex({ createdAt: -1 });
    await activityLogs.createIndex({ type: 1 });
    console.log('✅ Created aggregate / sort indexes on activityLogs.');

    // 4. Users Collection
    const users = db.collection('users');
    await users.createIndex({ email: 1 }, { unique: true });
    await users.createIndex({ name: 'text', email: 'text' }, { name: 'user_search_idx' });
    console.log('✅ Created indexes on users.');

    console.log('\n🎉 Indexing Complete! The database is now scaled for high-throughput queries.');
  } catch (error) {
    console.error('Failed to create indices:', error);
  } finally {
    await client.close();
  }
}

createIndexes();
