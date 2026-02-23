import { NextResponse } from 'next/server';
import { verifyAuth, apiError, apiSuccess } from '@/lib/api-guard';
import { updateDeveloper, findDeveloperById } from '@/lib/repositories/developer.repository';
import { logActivity } from '@/lib/repositories/activity.repository';

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

    const oldDev = await findDeveloperById(id);
    const updated = await updateDeveloper(id, updatePayload);
    
    if (!updated) {
      return apiError('Developer not found', 404);
    }

    // Log status change activity for Requirement 5 (Status History)
    if (oldDev && oldDev.currentStatus !== currentStatus) {
      await logActivity({
        developerId: id,
        type: 'status_change',
        details: {
          oldStatus: oldDev.currentStatus,
          newStatus: currentStatus,
          changedBy: auth.user.name
        }
      });
    }

    return apiSuccess({ success: true });
  } catch (error) {
    console.error(`Status update error for developer ${params.id}:`, error);
    return apiError('Failed to update status', 500);
  }
}

