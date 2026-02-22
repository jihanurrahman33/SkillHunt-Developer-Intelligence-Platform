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
    const { currentStatus, campaignId } = body;

    if (!currentStatus) {
      return NextResponse.json(
        { success: false, error: 'currentStatus is required' },
        { status: 400 }
      );
    }

    const updatePayload = { currentStatus };
    if (campaignId !== undefined) {
      updatePayload.campaignId = campaignId;
    }

    const updated = await updateDeveloperStatus(id, updatePayload);
    
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Developer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error(`Status update error for developer ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
