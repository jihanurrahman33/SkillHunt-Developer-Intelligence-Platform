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
