// Seed API — create initial admin user
// POST /api/auth/seed
// Protected: only works when no admin exists yet

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';

export async function POST(request) {
  try {
    const db = await connectToDatabase();

    // Check if an admin already exists
    const existingAdmin = await db.collection('users').findOne({ role: 'admin' });

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin user already exists' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Validation', message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Validation', message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if email is already taken
    const existingUser = await db.collection('users').findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Conflict', message: 'Email already in use' },
        { status: 409 }
      );
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

    return NextResponse.json(
      {
        message: 'Admin user created successfully',
        userId: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Internal', message: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}
