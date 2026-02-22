import { NextResponse } from 'next/server';
import { verifyAuth, apiError, apiSuccess } from '@/lib/api-guard';
import { addDevNote, getDevNotes } from '@/lib/repositories/recruitment.repository';

export async function GET(request, { params }) {
  const auth = await verifyAuth(request, ['admin', 'recruiter']);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const notes = await getDevNotes(id);
    return apiSuccess(notes);
  } catch (error) {
    console.error(`Notes GET for developer ${params.id} error:`, error);
    return apiError('Failed to fetch notes');
  }
}

export async function POST(request, { params }) {
  const auth = await verifyAuth(request, ['admin', 'recruiter']);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { text } = body;

    if (!text || text.trim().length === 0) {
      return apiError('Note text is required', 400);
    }

    const note = await addDevNote(id, auth.user, text.trim());
    return apiSuccess(note, 201);
  } catch (error) {
    console.error(`Note POST for developer ${params.id} error:`, error);
    return apiError('Failed to add note');
  }
}
