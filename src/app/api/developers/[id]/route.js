import { NextResponse } from 'next/server';
import { verifyAuth, apiError, apiSuccess } from '@/lib/api-guard';
import { findDeveloperById } from '@/lib/repositories/developer.repository';

// GET /api/developers/[id]
// Get a single developer by ID
export async function GET(request, { params }) {
  const auth = await verifyAuth(request, ['admin', 'recruiter']);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;

    const developer = await findDeveloperById(id);

    if (!developer) {
      return apiError('Developer not found', 404);
    }

    return apiSuccess(developer);
  } catch (error) {
    console.error(`Developer GET ${params.id} error:`, error);
    return apiError('Failed to fetch developer details');
  }
}
