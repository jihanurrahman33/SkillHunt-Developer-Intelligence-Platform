import { NextResponse } from 'next/server';
import { verifyAuth, apiError, apiSuccess } from '@/lib/api-guard';
import { getRecentGlobalActivity } from '@/lib/repositories/activity.repository';

// GET /api/activity/recent
export async function GET(request) {
  const auth = await verifyAuth(request, ['admin', 'recruiter']);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const limitParams = parseInt(searchParams.get('limit'), 10);
    const limit = !isNaN(limitParams) && limitParams > 0 ? limitParams : 10;

    const recentActivity = await getRecentGlobalActivity(limit);

    return apiSuccess({ data: recentActivity });
  } catch (error) {
    console.error('Error fetching global recent activity:', error);
    return apiError('Failed to fetch recent activity', 500);
  }
}
