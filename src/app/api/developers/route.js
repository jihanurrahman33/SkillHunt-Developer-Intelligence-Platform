import { NextResponse } from 'next/server';
import { verifyAuth, apiError, apiSuccess } from '@/lib/api-guard';
import { findDevelopers } from '@/lib/repositories/developer.repository';

// GET /api/developers
// List developers with search, filtering, and pagination
export async function GET(request) {
  const auth = await verifyAuth(request, ['admin', 'recruiter']);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const techStack = searchParams.get('techStack') || '';
    const location = searchParams.get('location') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = parseInt(searchParams.get('sortOrder') || '-1', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await findDevelopers({
      userId: auth.user.id,
      search,
      techStack,
      location,
      status,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    return apiSuccess(result);
  } catch (error) {
    console.error('Developers GET error:', error);
    return apiError('Failed to fetch developers');
  }
}
