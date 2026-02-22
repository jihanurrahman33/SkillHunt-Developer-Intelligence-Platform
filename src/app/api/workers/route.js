// Workers API Route Handler
// POST /api/workers — trigger background jobs (GitHub ingestion)

import { NextResponse } from 'next/server';

export async function POST(request) {
  // TODO: Implement background worker triggers
  return NextResponse.json({ message: 'Workers API - not yet implemented' }, { status: 501 });
}
