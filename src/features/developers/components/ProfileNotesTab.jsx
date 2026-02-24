'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { addDeveloperNote, updateDeveloperNote, deleteDeveloperNote } from '@/features/developers/services/developer.service';
import Swal from 'sweetalert2';
import { 
  HiOutlineChatAlt2, 
  HiOutlineClock, 
  HiOutlinePencil, 
  HiOutlineTrash 
} from 'react-icons/hi';

export default function ProfileNotesTab({ developer, id, notes, mutateNotes, isAnalyst, isAdmin, user, campaigns, isUpdating, onStatusChange }) {
  const [newNote, setNewNote] = useState('');
  const [isNoteSubmitting, setIsNoteSubmitting] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [isNoteUpdating, setIsNoteUpdating] = useState(false);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || isNoteSubmitting) return;
    setIsNoteSubmitting(true);
    try {
      await addDeveloperNote(id, newNote.trim());
      setNewNote('');
      mutateNotes();
      Swal.fire({
        icon: 'success', title: 'Note Added', toast: true, position: 'bottom-end',
        timer: 2000, showConfirmButton: false, background: '#0B1220', color: '#e2e8f0',
      });
    } catch (err) {
      Swal.fire({
        icon: 'error', title: 'Error', text: err.message,
        background: '#0B1220', color: '#e2e8f0', confirmButtonColor: '#2563EB',
      });
    } finally {
      setIsNoteSubmitting(false);
    }
  };

  const handleUpdateNote = async (noteId) => {
    if (!editingNoteText.trim() || isNoteUpdating) return;
    setIsNoteUpdating(true);
    try {
      await updateDeveloperNote(id, noteId, editingNoteText.trim());
      setEditingNoteId(null);
      setEditingNoteText('');
      mutateNotes();
      Swal.fire({
        icon: 'success', title: 'Note Updated', toast: true, position: 'bottom-end',
        timer: 2000, showConfirmButton: false, background: '#0B1220', color: '#e2e8f0',
      });
    } catch (err) {
      Swal.fire({
        icon: 'error', title: 'Error', text: err.message,
        background: '#0B1220', color: '#e2e8f0', confirmButtonColor: '#2563EB',
      });
    } finally {
      setIsNoteUpdating(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    const result = await Swal.fire({
      title: 'Delete Note?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#ef4444',
      background: '#0B1220',
      color: '#e2e8f0',
    });
    if (result.isConfirmed) {
      try {
        await deleteDeveloperNote(id, noteId);
        mutateNotes();
        Swal.fire({
          icon: 'success', title: 'Deleted', toast: true, position: 'bottom-end',
          timer: 2000, showConfirmButton: false, background: '#0B1220', color: '#e2e8f0',
        });
      } catch (err) {
        Swal.fire({
          icon: 'error', title: 'Error', text: err.message,
          background: '#0B1220', color: '#e2e8f0', confirmButtonColor: '#2563EB',
        });
      }
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <Card title="Recruiter Notes" subtitle="Internal notes and history for this developer">
          {/* Add Note Form */}
          {!isAnalyst && (
            <form onSubmit={handleAddNote} className="mb-8">
              <textarea
                placeholder="Add a note about this developer..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full min-h-[100px] resize-y rounded-md border border-border bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary mb-3"
                required
              />
              <div className="flex justify-end">
                <Button type="submit" loading={isNoteSubmitting} disabled={!newNote.trim()}>
                  Save Note
                </Button>
              </div>
            </form>
          )}

          {/* Notes List */}
          <div className="space-y-4">
            {notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border border-dashed border-border rounded-lg bg-background">
                <HiOutlineChatAlt2 className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No notes have been added yet.</p>
              </div>
            ) : (
              notes.map((note) => (
                <div key={note._id} className="group rounded-lg border border-border bg-background p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/20">
                        {note.author?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">{note.author?.name}</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{note.author?.role}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                        <HiOutlineClock className="h-3.5 w-3.5" />
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                      {!isAnalyst && note.author?.id === user?.id && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setEditingNoteId(note._id); setEditingNoteText(note.text); }}
                            className="p-1 hover:text-primary transition-colors"
                            title="Edit Note"
                          >
                            <HiOutlinePencil className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteNote(note._id)}
                            className="p-1 hover:text-danger transition-colors"
                            title="Delete Note"
                          >
                            <HiOutlineTrash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {editingNoteId === note._id ? (
                    <div className="mt-2">
                      <textarea
                        value={editingNoteText}
                        onChange={(e) => setEditingNoteText(e.target.value)}
                        className="w-full min-h-[80px] resize-y rounded-md border border-border bg-surface p-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary mb-2"
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingNoteId(null)}>Cancel</Button>
                        <Button size="sm" onClick={() => handleUpdateNote(note._id)} loading={isNoteUpdating}>Save</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-md bg-secondary/30 p-3 mt-1 border border-border/50">
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{note.text}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recruitment Sidebar */}
      <div className="md:col-span-1 space-y-6">
        <Card title="Recruitment Status">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Phase</span>
              <Badge variant={
                developer.currentStatus === 'new' ? 'default' :
                developer.currentStatus === 'hired' ? 'success' :
                developer.currentStatus === 'rejected' ? 'danger' : 'warning'
              }>
                {developer.currentStatus.toUpperCase()}
              </Badge>
            </div>

            {developer.ownerName && (
              <div className="flex items-center justify-between text-xs pt-2">
                <span className="text-muted-foreground">Recruitment Owner</span>
                <span className="font-bold text-foreground">{developer.ownerName}</span>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <label className="block text-xs font-medium text-muted-foreground mb-2">Assign to Campaign</label>
              <select
                value={developer.campaignId || ''}
                onChange={(e) => onStatusChange(developer.currentStatus, e.target.value || null)}
                disabled={isUpdating || (developer.ownerId && developer.ownerId !== user?.id && !isAdmin)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              >
                <option value="">-- No Campaign --</option>
                {campaigns?.map(campaign => (
                  <option key={campaign._id} value={campaign._id}>
                    {campaign.title} ({campaign.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-muted-foreground pt-4 border-t border-border">
              Notes are only visible to the internal team (Admins and Recruiters).
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
