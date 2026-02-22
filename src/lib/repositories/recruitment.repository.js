// Recruitment Repository — Handles developer notes and history

import { ObjectId } from 'mongodb';
import connectToDatabase from '@/lib/db';

const COLLECTION = 'recruitmentRecords';

export async function addDevNote(developerId, author, text) {
  const db = await connectToDatabase();

  const note = {
    _id: new ObjectId(),
    developerId: new ObjectId(developerId),
    author: {
      id: author.id,
      name: author.name,
      role: author.role,
    },
    text,
    createdAt: new Date(),
  };

  await db.collection(COLLECTION).insertOne(note);

  return { ...note, _id: note._id.toString(), developerId: note.developerId.toString() };
}

export async function getDevNotes(developerId) {
  const db = await connectToDatabase();

  const notes = await db
    .collection(COLLECTION)
    .find({ developerId: new ObjectId(developerId) })
    .sort({ createdAt: -1 })
    .toArray();

  return notes.map(n => ({ 
    ...n, 
    _id: n._id.toString(), 
    developerId: n.developerId.toString() 
  }));
}

export async function updateDevNote(noteId, text) {
  const db = await connectToDatabase();
  
  if (!ObjectId.isValid(noteId)) return null;

  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(noteId) },
    { $set: { text, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );

  if (!result) return null;

  return { 
    ...result, 
    _id: result._id.toString(), 
    developerId: result.developerId.toString() 
  };
}

export async function deleteDevNote(noteId) {
  const db = await connectToDatabase();
  
  if (!ObjectId.isValid(noteId)) return false;

  const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(noteId) });
  
  return result.deletedCount > 0;
}
