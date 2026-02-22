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

  // 4. Format the final output
  return {
    kpis: {
      totalDevelopers: results.totalDevelopers[0]?.count || 0,
      totalHired: results.totalHired[0]?.count || 0,
      activeThisWeek: results.activeThisWeek[0]?.count || 0,
      activeCampaigns: campaignsCount
    },
    statusDistribution: results.statusDistribution,
    topTechStack: results.topTechStack,
    activityTimeline
  };
}
