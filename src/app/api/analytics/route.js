import { NextResponse } from 'next/server';
import fs from 'fs';
import { verifyAuth, apiError, apiSuccess } from '@/lib/api-guard';
import { getDashboardAnalytics } from '@/lib/repositories/analytics.repository';

// GET /api/analytics
export async function GET(request) {
  // Ensure only admins and recruiters have access to aggregate data
  const auth = await verifyAuth(request, ['admin', 'recruiter']);
  if (auth.error) return auth.error;

  try {
    console.log('Analytics API called by auth.user.id:', auth.user.id);
    const analyticsData = await getDashboardAnalytics(auth.user.id);
    return apiSuccess(analyticsData);
  } catch (error) {
    console.error('Analytics API Error:', error);
    return apiError('Failed to fetch analytics data', 500);
  }
}
