import { NextResponse } from 'next/server';
import { verifyAuth, apiError, apiSuccess } from '@/lib/api-guard';
import { getDeveloperActivity } from '@/lib/repositories/activity.repository';

// GET /api/developers/[id]/activity
export async function GET(request, { params }) {
  const auth = await verifyAuth(request, ['admin', 'recruiter']);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    
    // Optional: parse limit from query params
    const { searchParams } = new URL(request.url);
    const limitParams = parseInt(searchParams.get('limit'), 10);
    const limit = !isNaN(limitParams) && limitParams > 0 ? limitParams : 20;

    const activityLogs = await getDeveloperActivity(id, limit);

    return apiSuccess({ data: activityLogs });
  } catch (error) {
    console.error(`Error fetching activity for developer ${params.id}:`, error);
    return apiError('Failed to fetch developer activity', 500);
  }
}
