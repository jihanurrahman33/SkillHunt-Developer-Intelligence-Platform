import { NextResponse } from 'next/server';
import { verifyAuth, apiError, apiSuccess } from '@/lib/api-guard';
import { updateDeveloper } from '@/lib/repositories/developer.repository';

// PATCH /api/developers/[id]/status
// Update a developer's recruitment status
export async function PATCH(request, { params }) {
  const auth = await verifyAuth(request, ['admin', 'recruiter']);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { currentStatus, campaignId } = body;

    if (!currentStatus) {
      return apiError('currentStatus is required', 400);
    }

    const updatePayload = { currentStatus };
    if (campaignId !== undefined) {
      updatePayload.campaignId = campaignId;
    }

    const updated = await updateDeveloper(id, updatePayload);
    
    if (!updated) {
      return apiError('Developer not found', 404);
    }

    return apiSuccess({ data: updated });
  } catch (error) {
    console.error(`Status update error for developer ${params.id}:`, error);
    return apiError('Failed to update status', 500);
  }
}

