import { NextResponse } from 'next/server';
import { verifyAuth, apiSuccess, apiError } from '@/lib/api-guard';
import { getCampaignById, updateCampaign, deleteCampaign } from '@/lib/repositories/campaign.repository';

export async function GET(request, { params }) {
  const auth = await verifyAuth(request, ['admin', 'recruiter']);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const campaign = await getCampaignById(id);
    
    if (!campaign) {
      return apiError('Campaign not found', 404);
    }

    return apiSuccess(campaign);
  } catch (error) {
    console.error(`Campaign GET ${params.id} error:`, error);
    return apiError('Failed to fetch campaign details');
  }
}

export async function PATCH(request, { params }) {
  const auth = await verifyAuth(request, ['admin', 'recruiter']);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const updateData = await request.json();

    const updatedCampaign = await updateCampaign(id, updateData);
    if (!updatedCampaign) {
      return apiError('Campaign not found or update failed', 404);
    }

    return apiSuccess(updatedCampaign);
  } catch (error) {
    console.error(`Campaign PATCH ${params.id} error:`, error);
    return apiError('Failed to update campaign');
  }
}

export async function DELETE(request, { params }) {
  const auth = await verifyAuth(request, ['admin', 'recruiter']);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const success = await deleteCampaign(id);
    
    if (!success) {
      return apiError('Campaign not found or delete failed', 404);
    }

    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error(`Campaign DELETE ${params.id} error:`, error);
    return apiError('Failed to delete campaign');
  }
}
