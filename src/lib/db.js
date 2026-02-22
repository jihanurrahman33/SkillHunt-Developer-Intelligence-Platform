import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'skillhunt';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global._mongoClientPromise;

if (!cached) {
  cached = global._mongoClientPromise = { client: null, promise: null };
}

async function connectToDatabase() {
  if (cached.client) {
    return cached.client.db(DB_NAME);
  }

  if (!cached.promise) {
    const options = {
      maxPoolSize: 10,
      minPoolSize: 2,
    };

    cached.promise = MongoClient.connect(MONGODB_URI, options);
  }

  cached.client = await cached.promise;
  return cached.client.db(DB_NAME);
}

export default connectToDatabase;
