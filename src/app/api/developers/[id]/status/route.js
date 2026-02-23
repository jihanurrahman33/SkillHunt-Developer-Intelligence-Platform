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

    const oldDev = await findDeveloperById(id);
    if (!oldDev) return apiError('Developer not found', 404);

    // Enforce Ownership Lock (Rule 9 & 10)
    const isLocked = oldDev.ownerId &&
                     oldDev.ownerId !== auth.user.id &&
                     auth.user.role !== 'admin';

    if (isLocked) {
      return apiError(`This developer is currently being handled by ${oldDev.ownerName || 'another recruiter'}. Only they or an Admin can change the status.`, 403);
    }

    const contactStatuses = ['contacted', 'interviewing', 'placed', 'hired'];
    const activeOwnerStatuses = ['contacted', 'interviewing', 'hired'];
    const updatePayload = { currentStatus };
    if (campaignId !== undefined) updatePayload.campaignId = campaignId;

    // Update Ownership Metadata
    if (activeOwnerStatuses.includes(currentStatus)) {
      updatePayload.ownerId = auth.user.id;
      updatePayload.ownerName = auth.user.name;
    } else if (['new', 'rejected'].includes(currentStatus)) {
      updatePayload.ownerId = null;
      updatePayload.ownerName = null;
    }

    const updated = await updateDeveloper(id, updatePayload);

    if (!updated) {
      return apiError('Failed to update developer status');
    }

    // Update lastContact metadata if moving to an active contact status (Requirement 22)
    if (oldDev.currentStatus !== currentStatus && contactStatuses.includes(currentStatus)) {
      await updateDeveloper(id, {
        lastContact: {
          contactedAt: new Date(),
          recruiterName: auth.user.name,
          status: currentStatus
        }
      });
    }

    // Log status change activity for Requirement 5 (Status History)
    if (oldDev.currentStatus !== currentStatus) {
      await logActivity({
        developerId: id,
        type: 'status_change',
        details: {
          oldStatus: oldDev.currentStatus,
          newStatus: currentStatus,
          changedBy: auth.user.name,
          ownerId: updatePayload.ownerId || oldDev.ownerId
        }
      });
    }

    return apiSuccess({ success: true });
  } catch (error) {
    console.error(`Status update error for developer ${params.id}:`, error);
    return apiError('Failed to update status', 500);
  }
}

