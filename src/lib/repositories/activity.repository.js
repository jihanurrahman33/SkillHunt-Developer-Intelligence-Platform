import { ObjectId } from 'mongodb';
import connectToDatabase from '@/lib/db';

const COLLECTION = 'activityLogs';

/**
 * Log a new activity for a developer.
 * @param {Object} param0 
 * @param {string} param0.developerId - ID of the developer
 * @param {string} param0.type - Type of activity (e.g., 'new_repo', 'skills_updated', 'activity_spike', 'status_change')
 * @param {Object} param0.details - Contextual data about the activity
 */
export async function logActivity({ developerId, type, details = {} }) {
  const db = await connectToDatabase();
  
  const logEntry = {
    developerId: new ObjectId(developerId),
    type,
    details,
    createdAt: new Date()
  };

  const result = await db.collection(COLLECTION).insertOne(logEntry);
  return { ...logEntry, _id: result.insertedId.toString() };
}

/**
 * Fetch activity logs for a specific developer.
 * @param {string} developerId 
 * @param {number} limit 
 */
export async function getDeveloperActivity(developerId, limit = 20) {
  const db = await connectToDatabase();
  
  if (!ObjectId.isValid(developerId)) return [];

  const logs = await db.collection(COLLECTION)
    .find({ developerId: new ObjectId(developerId) })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return logs.map(log => ({
    ...log,
    _id: log._id.toString(),
    developerId: log.developerId.toString()
  }));
}

/**
 * Fetch recent activity logs across all developers (for global dashboard).
 * @param {number} limit 
 */
export async function getRecentGlobalActivity(userId, limit = 10) {
  const db = await connectToDatabase();
  
  const pipeline = [
    { $sort: { createdAt: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'developers',
        localField: 'developerId',
        foreignField: '_id',
        as: 'developer'
      }
    },
    { $unwind: '$developer' }, // Assuming the developer must exist
    { $match: { 'developer.addedBy': userId } }
  ];

  const logs = await db.collection(COLLECTION).aggregate(pipeline).toArray();

  return logs.map(log => ({
    ...log,
    _id: log._id.toString(),
    developerId: log.developerId.toString(),
    developer: {
      _id: log.developer._id.toString(),
      name: log.developer.name,
      username: log.developer.username,
      avatarUrl: log.developer.avatarUrl
    }
  }));
}
