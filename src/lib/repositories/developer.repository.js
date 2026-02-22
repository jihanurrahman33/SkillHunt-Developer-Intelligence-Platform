// Developer Repository — DB query layer
// All developer database operations go here

import { ObjectId } from 'mongodb';
import connectToDatabase from '@/lib/db';

const COLLECTION = 'developers';

export async function findDevelopers({
  search = '',
  techStack = '',
  location = '',
  status = '',
  sortBy = 'createdAt',
  sortOrder = -1,
  page = 1,
  limit = 20,
} = {}) {
  const db = await connectToDatabase();
  const query = {};

  // Text search across name, bio, location
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } },
      { bio: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ];
  }

  // Filter by tech stack (case-insensitive, partial matching allowed)
  if (techStack) {
    const stacks = techStack.split(',').map((s) => new RegExp(s.trim(), 'i'));
    query.techStack = { $in: stacks };
  }

  // Filter by location
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  // Filter by recruitment status
  if (status) {
    query.currentStatus = status;
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder };

  const [developers, total] = await Promise.all([
    db.collection(COLLECTION).find(query).sort(sort).skip(skip).limit(limit).toArray(),
    db.collection(COLLECTION).countDocuments(query),
  ]);

  return {
    developers: developers.map((d) => ({ ...d, _id: d._id.toString() })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function findDeveloperById(id) {
  const db = await connectToDatabase();

  if (!ObjectId.isValid(id)) return null;

  const developer = await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });

  if (!developer) return null;

  return { ...developer, _id: developer._id.toString() };
}

export async function findDeveloperByHash(profileHash) {
  const db = await connectToDatabase();
  return db.collection(COLLECTION).findOne({ profileHash });
}

export async function insertDeveloper(doc) {
  const db = await connectToDatabase();

  // Extract createdAt and currentStatus so they only apply on insert, not update
  const { createdAt, currentStatus, ...updateDoc } = doc;

  // Upsert based on profileHash for idempotent ingestion
  const result = await db.collection(COLLECTION).updateOne(
    { profileHash: doc.profileHash },
    {
      $set: {
        ...updateDoc,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: createdAt || new Date(),
        currentStatus: currentStatus || 'new',
      },
    },
    { upsert: true }
  );

  return {
    upserted: !!result.upsertedId,
    updated: result.modifiedCount > 0,
    id: result.upsertedId?.toString() || null,
  };
}

export async function updateDeveloper(id, updates) {
  const db = await connectToDatabase();

  if (!ObjectId.isValid(id)) return null;

  const result = await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    }
  );

  return result.matchedCount > 0;
}

export async function updateDeveloperStatus(id, status) {
  return updateDeveloper(id, { currentStatus: status });
}

export async function getDeveloperStats() {
  const db = await connectToDatabase();

  const [total, statusCounts, topLanguages] = await Promise.all([
    db.collection(COLLECTION).countDocuments(),

    db.collection(COLLECTION).aggregate([
      { $group: { _id: '$currentStatus', count: { $sum: 1 } } },
    ]).toArray(),

    db.collection(COLLECTION).aggregate([
      { $unwind: '$techStack' },
      { $group: { _id: '$techStack', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]).toArray(),
  ]);

  return {
    total,
    byStatus: Object.fromEntries(statusCounts.map((s) => [s._id, s.count])),
    topLanguages: topLanguages.map((l) => ({ name: l._id, count: l.count })),
  };
}

export async function deleteDeveloperById(id) {
  const db = await connectToDatabase();

  if (!ObjectId.isValid(id)) return false;

  // Cleanup related data
  await db.collection('activityLogs').deleteMany({ developerId: id });
  await db.collection('recruitmentRecords').deleteMany({ developerId: id });

  const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  
  return result.deletedCount > 0;
}
