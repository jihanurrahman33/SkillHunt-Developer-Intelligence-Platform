// Seed API — create initial admin user
// POST /api/auth/seed
// Protected: only works when no admin exists yet

import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import { apiError, apiSuccess } from '@/lib/api-guard';

export async function POST(request) {
  try {
    const db = await connectToDatabase();

    // Check if an admin already exists
    const existingAdmin = await db.collection('users').findOne({ role: 'admin' });

    if (existingAdmin) {
      return apiError('Admin user already exists', 403);
    }

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return apiError('Name, email, and password are required', 400);
    }

    if (password.length < 6) {
      return apiError('Password must be at least 6 characters', 400);
    }

    // Check if email is already taken
    const existingUser = await db.collection('users').findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return apiError('Email already in use', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await db.collection('users').insertOne({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'admin',
      provider: 'credentials',
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return apiSuccess({
      message: 'Admin user created successfully',
      userId: result.insertedId.toString(),
    }, 201);
  } catch (error) {
    console.error('Seed error:', error);
    return apiError('Failed to create admin user', 500);
  }
}
