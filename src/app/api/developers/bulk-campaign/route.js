import { NextResponse } from 'next/server';
import { verifyAuth, apiSuccess, apiError } from '@/lib/api-guard';
import { bulkUpdateCampaignAssignments } from '@/lib/repositories/developer.repository';

// POST /api/developers/bulk-campaign
// Assigns or removes multiple developers from a campaign simultaneously
export async function POST(request) {
  const auth = await verifyAuth(request, ['admin', 'recruiter']);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { developerIds, campaignId, newStatus } = body;

    // Validation
    if (!Array.isArray(developerIds) || developerIds.length === 0) {
      return apiError('developerIds must be a non-empty array', 400);
    }
    
    // campaignId can explicitly be null representing "remove them all from their current campaigns"
    if (campaignId !== null && typeof campaignId !== 'string') {
      return apiError('campaignId must be a valid string or null to clear', 400);
    }

    // Execute bulk update scoped to the recruiter
    const updatedCount = await bulkUpdateCampaignAssignments(
      developerIds, 
      campaignId, 
      auth.user.id,
      newStatus
    );

    return apiSuccess({
      message: `Successfully synchronized campaign status for ${updatedCount} developers`,
      updatedCount,
    });
    
  } catch (error) {
    console.error('Bulk Campaign Assignment error:', error);
    return apiError('Failed to process bulk campaign assignment', 500);
  }
}
