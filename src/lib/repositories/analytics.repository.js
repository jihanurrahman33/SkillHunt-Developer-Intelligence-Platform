import { ObjectId } from 'mongodb';
import connectToDatabase from '@/lib/db';

/**
 * Fetches aggregated analytics data for the dashboard.
 * Uses a single $facet pipeline to compute all metrics concurrently.
 */
export async function getDashboardAnalytics(userId) {
  const db = await connectToDatabase();
  const developersCollection = db.collection('developers');
  const campaignsCollection = db.collection('campaigns');
  const activityLogsCollection = db.collection('activityLogs');
  
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // 1. Get Global Developer Stats & KPIs (Global Registry Alignment)
  const pipeline = [
    {
      $facet: {
        totalDevelopers: [{ $count: 'count' }],
        totalHired: [
          { $match: { currentStatus: 'hired' } },
          { $count: 'count' }
        ],
        activeThisWeek: [
          { $match: { lastActivityAt: { $gte: sevenDaysAgo } } },
          { $count: 'count' }
        ],
        statusDistribution: [
          { $group: { _id: { $ifNull: ['$currentStatus', 'new'] }, count: { $sum: 1 } } },
          { $project: { status: '$_id', count: 1, _id: 0 } }
        ],
        topTechStack: [
          { $unwind: '$techStack' },
          { $group: { _id: '$techStack', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
          { $project: { technology: '$_id', count: 1, _id: 0 } }
        ],
        geoDistribution: [
          { $match: { location: { $ne: null, $ne: '' } } },
          { $group: { _id: '$location', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 8 },
          { $project: { location: '$_id', count: 1, _id: 0 } }
        ],
        topTalent: [
          { $sort: { activityScore: -1 } },
          { $limit: 5 },
          { $project: { name: 1, username: 1, avatarUrl: 1, activityScore: 1, readinessLevel: 1, techStack: { $slice: ['$techStack', 3] } } }
        ]
      }
    }
  ];

  const [results] = await developersCollection.aggregate(pipeline).toArray();

  // 2. Throughput & Activity (History-Based Metrics)
  const activityTimeline = await activityLogsCollection.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    { $project: { date: '$_id', count: 1, _id: 0 } }
  ]).toArray();

  // 3. Historical Throughput by Status (Requirement 13)
  const historicalThroughput = await activityLogsCollection.aggregate([
    { 
      $match: { 
        type: 'status_change',
        createdAt: { $gte: thirtyDaysAgo }
      } 
    },
    { $group: { _id: '$details.newStatus', count: { $sum: 1 } } },
    { $project: { status: '$_id', count: 1, _id: 0 } }
  ]).toArray();

  // 4. Campaign Performance (Global view for Intelligence)
  const campaignPerformance = await campaignsCollection.aggregate([
    { $match: { status: 'active' } },
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
        statusBreakdown: {
          $arrayToObject: {
            $map: {
              input: ['new', 'contacted', 'interviewing', 'hired', 'rejected'],
              as: 's',
              in: {
                k: '$$s',
                v: {
                  $size: {
                    $filter: {
                      input: '$developers',
                      as: 'd',
                      cond: { $eq: ['$$d.currentStatus', '$$s'] }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    { $limit: 10 }
  ]).toArray();

  const totalCampaigns = await campaignsCollection.countDocuments({ status: 'active' });

  return {
    kpis: {
      totalDevelopers: results.totalDevelopers[0]?.count || 0,
      totalHired: results.totalHired[0]?.count || 0,
      activeThisWeek: results.activeThisWeek[0]?.count || 0,
      activeCampaigns: totalCampaigns
    },
    statusDistribution: results.statusDistribution,
    topTechStack: results.topTechStack,
    geoDistribution: results.geoDistribution,
    topTalent: results.topTalent,
    campaignPerformance,
    activityTimeline,
    throughput: historicalThroughput
  };
}
