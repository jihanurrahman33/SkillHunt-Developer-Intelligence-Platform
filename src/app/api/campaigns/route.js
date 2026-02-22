// Campaigns API Route Handler
// GET /api/campaigns — list campaigns
// POST /api/campaigns — create campaign

import { NextResponse } from 'next/server';

export async function GET(request) {
  // TODO: Implement campaign listing
  return NextResponse.json({ message: 'Campaigns API - not yet implemented' }, { status: 501 });
}

export async function POST(request) {
  // TODO: Implement campaign creation
  return NextResponse.json({ message: 'Campaigns API - not yet implemented' }, { status: 501 });
}
