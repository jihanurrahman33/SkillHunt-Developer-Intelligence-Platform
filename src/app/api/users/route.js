// Users API — Admin only
// GET /api/users — list all users
// PATCH /api/users — update user role

import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import connectToDatabase from '@/lib/db';
import { verifyAuth, apiError, apiSuccess } from '@/lib/api-guard';

export async function GET(request) {
  const auth = await verifyAuth(request, 'admin');
  if (auth.error) return auth.error;

  try {
    const db = await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && ['admin', 'recruiter'].includes(role)) {
      query.role = role;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      db
        .collection('users')
        .find(query, { projection: { password: 0 } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('users').countDocuments(query),
    ]);

    return apiSuccess({
      users: users.map((u) => ({ ...u, _id: u._id.toString() })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Users GET error:', error);
    return apiError('Failed to fetch users');
  }
}

export async function PATCH(request) {
  const auth = await verifyAuth(request, 'admin');
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return apiError('userId and role are required', 400);
    }

    if (!['admin', 'recruiter', 'viewer'].includes(role)) {
      return apiError('Role must be admin, recruiter, or viewer', 400);
    }

    // Prevent admin from demoting themselves
    if (userId === auth.user.id && role !== 'admin') {
      return apiError('Cannot change your own role', 400);
    }

    const db = await connectToDatabase();

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          role, 
          // If moving to recruiter/admin, ensure onboarding is marked as approved
          ...(body.onboardingStatus ? { onboardingStatus: body.onboardingStatus } : {}),
          updatedAt: new Date() 
        } 
      }
    );

    if (result.matchedCount === 0) {
      return apiError('User not found', 404);
    }

    return apiSuccess({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Users PATCH error:', error);
    return apiError('Failed to update user role');
  }
}

export async function DELETE(request) {
  const auth = await verifyAuth(request, 'admin');
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return apiError('userId is required', 400);
    }

    if (userId === auth.user.id) {
      return apiError('Cannot delete your own account', 400);
    }

    const db = await connectToDatabase();

    const result = await db.collection('users').deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 0) {
      return apiError('User not found', 404);
    }

    return apiSuccess({ message: 'User deleted permanently' });
  } catch (error) {
    console.error('Users DELETE error:', error);
    return apiError('Failed to delete user');
  }
}
