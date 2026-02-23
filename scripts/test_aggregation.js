const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('skillhunt');
    
    // 1. Check if any developer has campaignId
    const devWithCampaign = await db.collection('developers').findOne({ campaignId: { $ne: null } });
    console.log('Sample Dev with Campaign:', devWithCampaign ? { 
        id: devWithCampaign._id, 
        campaignId: devWithCampaign.campaignId,
        type: typeof devWithCampaign.campaignId,
        currentStatus: devWithCampaign.currentStatus
     } : 'None found');

    if (devWithCampaign) {
      // 2. Check campaign that corresponds to this dev
      const campaign = await db.collection('campaigns').findOne({ _id: new ObjectId(devWithCampaign.campaignId) });
      console.log('Campaign corresponding to dev:', campaign ? campaign.title : 'Not found');
      
      // 3. Test the exact lookup aggregation
      const results = await db.collection('campaigns').aggregate([
        { $match: { _id: (campaign ? campaign._id : devWithCampaign.campaignId) } },
        {
          $lookup: {
            from: 'developers',
            let: { campaign_id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ['$campaignId', '$$campaign_id'] },
                      { $eq: ['$campaignId', { $toString: '$$campaign_id' }] }
                    ]
                  }
                }
              }
            ],
            as: 'developers'
          }
        },
        {
          $project: {
            title: 1,
            developerCount: { $size: '$developers' },
          }
        }
      ]).toArray();
      
      console.log('Aggregation result:', JSON.stringify(results, null, 2));
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
