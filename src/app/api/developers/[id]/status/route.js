import { NextResponse } from 'next/server';
import { verifyAuth, apiError, apiSuccess } from '@/lib/api-guard';
import { updateDeveloperStatus } from '@/lib/repositories/developer.repository';

// PATCH /api/developers/[id]/status
// Update a developer's recruitment status
export async function PATCH(request, { params }) {
  const auth = await verifyAuth(request, ['admin', 'recruiter']);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['new', 'contacted', 'interviewing', 'hired', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return apiError('Invalid status', 400);
    }

    const success = await updateDeveloperStatus(id, status);

    if (!success) {
      return apiError('Developer not found or update failed', 404);
    }

    return apiSuccess({ message: 'Status updated successfully', status });
  } catch (error) {
    console.error(`Developer PATCH status ${params.id} error:`, error);
    return apiError('Failed to update developer status');
  }
}
