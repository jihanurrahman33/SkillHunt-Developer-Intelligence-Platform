import { ObjectId } from 'mongodb';
import connectToDatabase from '@/lib/db';

/**
 * Fetches aggregated analytics data for the dashboard.
 * Uses a single $facet pipeline to compute all metrics concurrently.
 */
export async function getDashboardAnalytics(userId) {
  const db = await connectToDatabase();
  
  // We'll aggregate across multiple collections, but developers is the main one
  const developersCollection = db.collection('developers');
  const campaignsCollection = db.collection('campaigns');
  
  // 1. Get Campaign Stats (Separate query since it's a different collection)
  const campaignsCount = await campaignsCollection.countDocuments({ status: 'active', 'createdBy.id': userId });

  // 2. Main Aggregation Pipeline on Developers
  const pipeline = [
    { $match: { addedBy: userId } },
    {
      $facet: {
        // KPI: Total Developers
        totalDevelopers: [
          { $count: 'count' }
        ],
        // KPI: Total Hired
        totalHired: [
          { $match: { currentStatus: 'hired' } },
          { $count: 'count' }
        ],
        // KPI: Active this week (last 7 days)
        activeThisWeek: [
          { 
            $match: { 
              lastActivityAt: { 
                $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
              } 
            } 
          },
          { $count: 'count' }
        ],
        // Funnel Distribution
        statusDistribution: [
          {
            $group: {
              _id: { $ifNull: ['$currentStatus', 'new'] }, // Default to 'new' if not set
              count: { $sum: 1 }
            }
          },
          {
            $project: {
              status: '$_id',
              count: 1,
              _id: 0
            }
          }
        ],
        // Top Tech Stack (Global)
        topTechStack: [
          { $unwind: '$techStack' },
          {
            $group: {
              _id: '$techStack',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 5 },
          {
            $project: {
              technology: '$_id',
              count: 1,
              _id: 0
            }
          }
        ],
        // Geo-Distribution
        geoDistribution: [
          { $match: { location: { $ne: null, $ne: '' } } },
          {
            $group: {
              _id: '$location',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 8 },
          {
            $project: {
              location: '$_id',
              count: 1,
              _id: 0
            }
          }
        ],
        // Top Talent Spotlight
        topTalent: [
          { $sort: { activityScore: -1 } },
          { $limit: 5 },
          {
            $project: {
              name: 1,
              username: 1,
              avatarUrl: 1,
              activityScore: 1,
              readinessLevel: 1,
              location: 1,
              techStack: { $slice: ['$techStack', 3] }
            }
          }
        ]
      }
    }
  ];

  const [results] = await developersCollection.aggregate(pipeline).toArray();

  // 3. Activity Timeline (from activityLogs collection)
  const activityLogsCollection = db.collection('activityLogs');
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const activityTimeline = await activityLogsCollection.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    {
      $lookup: {
        from: 'developers',
        localField: 'developerId',
        foreignField: '_id',
        as: 'developer'
      }
    },
    { $unwind: '$developer' },
    { $match: { 'developer.addedBy': userId } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        date: '$_id',
        count: 1,
        _id: 0
      }
    }
  ]).toArray();

  // 4. Campaign Performance Stats (Full Pipeline Breakdown)
  const campaignPerformance = await campaignsCollection.aggregate([
    { $match: { status: 'active', 'createdBy.id': userId } },
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
        // Breakthrough: Count each status type for the mini-funnel
        statusBreakdown: {
          $arrayToObject: {
            $map: {
              input: ['new', 'screening', 'interviewing', 'offered', 'hired', 'rejected'],
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

  // 5. Format the final output
  return {
    kpis: {
      totalDevelopers: results.totalDevelopers[0]?.count || 0,
      totalHired: results.totalHired[0]?.count || 0,
      activeThisWeek: results.activeThisWeek[0]?.count || 0,
      activeCampaigns: campaignsCount
    },
    statusDistribution: results.statusDistribution,
    topTechStack: results.topTechStack,
    geoDistribution: results.geoDistribution,
    topTalent: results.topTalent,
    campaignPerformance,
    activityTimeline
  };
}
