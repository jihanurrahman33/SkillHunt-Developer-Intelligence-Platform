// Register API — create new user accounts
// POST /api/auth/register

import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import { apiError, apiSuccess } from '@/lib/api-guard';
import { rateLimit } from '@/lib/rate-limiter';

export async function POST(request) {
  // 1. Rate Limiting: Max 5 registration requests per minute per IP
  const rateLimitResponse = rateLimit(request, 5, 60000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validation
    if (!name || !email || !password) {
      return apiError('Name, email, and password are required', 400);
    }

    if (password.length < 6) {
      return apiError('Password must be at least 6 characters', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return apiError('Invalid email format', 400);
    }

    const db = await connectToDatabase();

    // Check duplicate email
    const existingUser = await db.collection('users').findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return apiError('An account with this email already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await db.collection('users').insertOne({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'viewer', // new users start as viewers
      onboardingStatus: 'none', // not yet requested recruiter access
      provider: 'credentials',
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return apiSuccess({
      message: 'Account created successfully',
      userId: result.insertedId.toString(),
    }, 201);
  } catch (error) {
    console.error('Register error:', error);
    return apiError('Failed to create account', 500);
  }
}

