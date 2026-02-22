import { verifyAuth, apiError, apiSuccess } from '@/lib/api-guard';
import { updateDevNote, deleteDevNote } from '@/lib/repositories/recruitment.repository';

export async function PATCH(request, { params }) {
  const auth = await verifyAuth(request, ['admin', 'recruiter']);
  if (auth.error) return auth.error;

  try {
    const { noteId } = await params;
    const body = await request.json();
    const { text } = body;

    if (!text || text.trim().length === 0) {
      return apiError('Note text is required', 400);
    }

    const updatedNote = await updateDevNote(noteId, text.trim());
    
    if (!updatedNote) {
      return apiError('Note not found', 404);
    }

    return apiSuccess(updatedNote);
  } catch (error) {
    console.error(`Note PATCH error:`, error);
    return apiError('Failed to update note', 500);
  }
}

export async function DELETE(request, { params }) {
  const auth = await verifyAuth(request, ['admin', 'recruiter']);
  if (auth.error) return auth.error;

  try {
    const { noteId } = await params;
    
    const deleted = await deleteDevNote(noteId);

    if (!deleted) {
      return apiError('Note not found', 404);
    }

    return apiSuccess({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error(`Note DELETE error:`, error);
    return apiError('Failed to delete note', 500);
  }
}
