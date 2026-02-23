import { ObjectId } from 'mongodb';
import connectToDatabase from '@/lib/db';

const COLLECTION = 'campaigns';

export async function createCampaign(data, author) {
  const db = await connectToDatabase();
  const campaign = {
    ...data,
    createdBy: {
      id: author.id,
      name: author.name,
    },
    status: data.status || 'draft', // draft, active, closed
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection(COLLECTION).insertOne(campaign);
  return { ...campaign, _id: result.insertedId.toString() };
}

export async function getCampaigns(filters = {}) {
  const db = await connectToDatabase();
  const query = {};

  if (filters.userId) {
    query['createdBy.id'] = filters.userId;
  }

  if (filters.status) query.status = filters.status;
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { role: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const campaigns = await db.collection(COLLECTION)
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return campaigns.map(c => ({
    ...c,
    _id: c._id.toString(),
  }));
}

export async function getCampaignById(id) {
  const db = await connectToDatabase();
  const campaign = await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
  
  if (!campaign) return null;
  
  return { ...campaign, _id: campaign._id.toString() };
}

export async function updateCampaign(id, data) {
  const db = await connectToDatabase();
  
  const updateData = { ...data, updatedAt: new Date() };
  delete updateData._id;

  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    { returnDocument: 'after' }
  );

  if (!result) return null;
  return { ...result, _id: result._id.toString() };
}

export async function deleteCampaign(id) {
  const db = await connectToDatabase();
  
  // Actually delete the campaign for simplicity in MVP
  // In production, might want soft delete ({ status: 'deleted' })
  const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}
