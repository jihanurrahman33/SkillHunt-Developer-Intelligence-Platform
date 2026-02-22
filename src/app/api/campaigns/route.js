import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-guard';
import { getCampaigns, createCampaign } from '@/lib/repositories/campaign.repository';

// Helper for standardized responses
const apiSuccess = (data, status = 200) => NextResponse.json({ success: true, data }, { status });
const apiError = (message, status = 500) => NextResponse.json({ success: false, error: message }, { status });

export async function GET(request) {
  const auth = await verifyAuth(request, ['admin', 'recruiter']);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const campaigns = await getCampaigns(filters);
    return apiSuccess(campaigns);
  } catch (error) {
    console.error('Campaigns GET error:', error);
    return apiError('Failed to fetch campaigns');
  }
}

export async function POST(request) {
  const auth = await verifyAuth(request, ['admin', 'recruiter']);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.title || !body.role) {
      return apiError('Campaign title and role are required', 400);
    }

    const newCampaign = await createCampaign(body, auth.user);
    return apiSuccess(newCampaign, 201);
  } catch (error) {
    console.error('Campaign POST error:', error);
    return apiError('Failed to create campaign');
  }
}
