'use client';

import { useState, useEffect } from 'react';
import { 
  fetchDeveloperById, 
  updateDeveloperStatus,
  getDeveloperNotes,
  addDeveloperNote,
  updateDeveloperNote,
  deleteDeveloperNote
} from '@/features/developers/services/developer.service';
import { getDeveloperActivity } from '@/features/developers/services/activity.service';
import { useCampaignContext } from '@/features/campaigns/context/CampaignContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ProfileSkeleton from '@/components/ui/ProfileSkeleton';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import dynamic from 'next/dynamic';

const ActivityFeed = dynamic(() => import('@/features/developers/components/ActivityFeed'), {
  ssr: false,
  loading: () => <div className="h-48 flex items-center justify-center border border-border rounded-xl bg-surface animate-pulse text-muted-foreground mt-4">Loading activity logs...</div>
});
import Link from 'next/link';
import Swal from 'sweetalert2';
import ProfileActivityChart from './ProfileActivityChart';
import { 
  HiOutlineLocationMarker, 
  HiOutlineOfficeBuilding, 
  HiOutlineLink,
  HiOutlineCalendar,
  HiOutlineStar,
  HiOutlineChartBar,
  HiOutlineArrowLeft,
  HiOutlineChatAlt2,
  HiOutlineClock,
  HiOutlinePencil,
  HiOutlineTrash
} from 'react-icons/hi';
import { FaGithub } from 'react-icons/fa';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
];

export default function DeveloperProfile({ id }) {
  const { campaigns } = useCampaignContext();
  const { user, isAdmin, isAnalyst } = useAuth();
  const [developer, setDeveloper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Notes State
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [isNoteSubmitting, setIsNoteSubmitting] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [isNoteUpdating, setIsNoteUpdating] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, notes

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [devData, notesData, activitiesData] = await Promise.all([
          fetchDeveloperById(id),
          getDeveloperNotes(id),
          getDeveloperActivity(id, 50) // Fetch enough for the trend chart
        ]);
        setDeveloper(devData);
        setNotes(notesData || []);
        setActivities(activitiesData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleStatusChange = async (newStatus, newCampaignId = undefined) => {
    setIsUpdating(true);
    try {
      // If we aren't changing the campaign, pass the existing one to persist it
      const campaignToSave = newCampaignId !== undefined ? newCampaignId : developer.campaignId;
      
      await updateDeveloperStatus(id, newStatus, campaignToSave);
      
      setDeveloper((prev) => ({ 
        ...prev, 
        currentStatus: newStatus,
        ...(newCampaignId !== undefined ? { campaignId: newCampaignId } : {})
      }));

      Swal.fire({
        icon: 'success',
        title: 'Developer Updated',
        text: `Successfully updated developer`,
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        background: '#0B1220',
        color: '#e2e8f0',
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.message,
        background: '#0B1220',
        color: '#e2e8f0',
        confirmButtonColor: '#2563EB',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsNoteSubmitting(true);
    try {
      const addedNote = await addDeveloperNote(id, newNote);
      setNotes((prev) => [addedNote, ...prev]);
      setNewNote('');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Note Failed',
        text: err.message,
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        background: '#0B1220',
        color: '#e2e8f0',
      });
    } finally {
      setIsNoteSubmitting(false);
    }
  };

  const handleUpdateNote = async (noteId) => {
    if (!editingNoteText.trim()) return;

    setIsNoteUpdating(true);
    try {
      const updated = await updateDeveloperNote(id, noteId, editingNoteText);
      setNotes((prev) => prev.map((n) => (n._id === noteId ? updated : n)));
      setEditingNoteId(null);
      setEditingNoteText('');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.message,
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        background: '#0B1220',
        color: '#e2e8f0',
      });
    } finally {
      setIsNoteUpdating(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This note will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Yes, delete it!',
      background: '#0B1220',
      color: '#e2e8f0',
    });

    if (confirm.isConfirmed) {
      try {
        await deleteDeveloperNote(id, noteId);
        setNotes((prev) => prev.filter((n) => n._id !== noteId));
      } catch (err) {
        Swal.fire({
          title: 'Error!',
          text: err.message,
          icon: 'error',
          background: '#0B1220',
          color: '#e2e8f0',
        });
      }
    }
  };

  if (loading) return <ProfileSkeleton />;
  if (error) return <ErrorDisplay error={new Error(error)} reset={() => window.location.reload()} />;
  if (!developer) return <ErrorDisplay error={new Error('Developer not found')} />;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Back Button & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link 
          href="/developers"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <HiOutlineArrowLeft className="h-4 w-4" />
          Back to Directory
        </Link>
        <div className="flex items-center gap-3">
          <select
            value={developer.currentStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isUpdating || isAnalyst}
            className={`
              h-9 rounded-md border px-3 text-sm font-medium outline-none transition-colors
              ${isAnalyst ? 'cursor-default opacity-80' : 'cursor-pointer'}
              disabled:opacity-50 disabled:cursor-not-allowed
              ${developer.currentStatus === 'new' ? 'bg-status-new/10 border-status-new/20 text-status-new' :
                developer.currentStatus === 'contacted' ? 'bg-status-contacted/10 border-status-contacted/20 text-status-contacted' :
                developer.currentStatus === 'interviewing' ? 'bg-status-interviewing/10 border-status-interviewing/20 text-status-interviewing' :
                developer.currentStatus === 'hired' ? 'bg-status-hired/10 border-status-hired/20 text-status-hired' :
                'bg-status-rejected/10 border-status-rejected/20 text-status-rejected'}
            `}
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-surface text-foreground">{opt.label}</option>
            ))}
          </select>
          {developer.ownerId && developer.ownerId !== user?.id && !isAdmin && (
            <div className="text-[10px] font-bold text-danger uppercase px-2 py-1 bg-danger/5 border border-danger/10 rounded">
              Locked to {developer.ownerName}
            </div>
          )}
          <Button 
            variant="outline" 
            onClick={() => window.open(developer.sourceUrl, '_blank')}
            icon={<FaGithub className="h-4 w-4" />}
          >
            GitHub
          </Button>
        </div>
      </div>

      {/* Header Profile Card */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm relative">
        <div className="h-32 bg-gradient-to-r from-primary/80 to-primary relative">
          {/* Activity Score Card overlapping the cover banner */}
          <div className="absolute top-4 right-4 sm:right-6 flex flex-col items-end gap-2 z-10">
            <div className="flex flex-col items-center justify-center rounded-lg border border-white/20 bg-black/40 backdrop-blur-md px-4 sm:px-6 py-2 min-w-[100px] sm:min-w-[120px] shadow-sm">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/90">Activity Score</span>
              <span className="text-2xl sm:text-3xl font-bold text-white leading-tight">{developer.activityScore}</span>
            </div>
            <div className={`
              px-2 sm:px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm border
              ${developer.readinessLevel === 'High' ? 'bg-success border-success text-white' :
                developer.readinessLevel === 'Medium' ? 'bg-warning border-warning text-black' :
                'bg-danger border-danger text-white'}
            `}>
              {developer.readinessLevel || 'Low'} Readiness
            </div>
          </div>
        </div>
        
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-5 relative -top-10 sm:-top-8 mb-[-1.5rem] sm:mb-[-2rem]">
            <div className="rounded-xl border-4 border-surface bg-surface overflow-hidden h-20 w-20 sm:h-24 sm:w-24 shrink-0 shadow-md">
              {developer.avatarUrl ? (
                <img src={developer.avatarUrl} alt={developer.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/20 text-2xl sm:text-3xl font-bold text-primary">
                  {developer.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="pb-1 max-w-full">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{developer.name}</h1>
              <p className="text-sm sm:text-base text-muted-foreground truncate">@{developer.username}</p>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            {developer.bio && (
              <p className="text-sm text-foreground max-w-3xl leading-relaxed">
                {developer.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {developer.location && (
                <span className="flex items-center gap-1.5">
                  <HiOutlineLocationMarker className="h-4 w-4" />
                  {developer.location}
                </span>
              )}
              {developer.company && (
                <span className="flex items-center gap-1.5">
                  <HiOutlineOfficeBuilding className="h-4 w-4" />
                  {developer.company}
                </span>
              )}
              {developer.blog && (
                <a href={developer.blog.startsWith('http') ? developer.blog : `https://${developer.blog}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <HiOutlineLink className="h-4 w-4" />
                  {developer.blog.replace(/^https?:\/\//, '')}
                </a>
              )}
              <span className="flex items-center gap-1.5">
                <HiOutlineCalendar className="h-4 w-4" />
                Ingested {new Date(developer.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Tabs inside the card footer */}
        <div className="border-t border-border px-6 flex gap-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 text-sm font-medium transition-colors border-b-2 shrink-0 ${
              activeTab === 'overview' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'activity' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Activity Feed
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'notes' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Recruiter Notes
            {notes.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] text-foreground">
                {notes.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column - Tech & Stats */}
          <div className="space-y-6 md:col-span-1">
            <Card title="Top Skills" subtitle="Languages & Tools from GitHub">
              <div className="flex flex-wrap gap-2">
                {developer.techStack?.length > 0 ? (
                  developer.techStack.map(tech => (
                    <Badge key={tech} variant="default" className="text-xs bg-muted/50">{tech}</Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No languages detected</p>
                )}
              </div>
            </Card>

            <Card title="GitHub Metrics" subtitle="Aggregated open source stats">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <HiOutlineChartBar className="h-4 w-4" />
                    Public Repositories
                  </span>
                  <span className="font-medium text-foreground">{developer.totalRepos}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <HiOutlineStar className="h-4 w-4" />
                    Total Stars Earned
                  </span>
                  <span className="font-medium text-foreground">{developer.totalStars}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FaGithub className="h-4 w-4" />
                    Contribution Proxy
                  </span>
                  <span className="font-medium text-foreground">{developer.contributionCount}</span>
                </div>
                <div className="pt-4 border-t border-border flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">Last Activity</span>
                  <span className="font-medium text-foreground">
                    {developer.lastActivityAt ? new Date(developer.lastActivityAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Top Repositories */}
          <div className="md:col-span-2">
            <Card title="Top Repositories" subtitle="Highest starred public projects">
              {developer.topRepos?.length > 0 ? (
                <div className="space-y-4">
                  {developer.topRepos.map(repo => (
                    <div key={repo.id} className="group rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary/50">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <a 
                            href={repo.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-primary hover:underline"
                          >
                            {repo.name}
                          </a>
                          {repo.description && (
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2 pr-4">
                              {repo.description}
                            </p>
                          )}
                          <div className="mt-3 flex items-center gap-4 text-xs font-medium text-muted-foreground">
                            {repo.language && (
                              <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-primary" />
                                {repo.language}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5" title="Stars">
                              <HiOutlineStar className="h-3.5 w-3.5" />
                              {repo.stars}
                            </span>
                            <span className="flex items-center gap-1.5" title="Forks">
                              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878M9 5.5V3.75a.75.75 0 1 0-1.5 0V5.5m0 0v1.75a.75.75 0 1 0 1.5 0V5.5" />
                              </svg>
                              {repo.forks}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground bg-background">
                  No public repositories found
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : activeTab === 'activity' ? (
        /* Right Sidebar */
        <div className="space-y-6">
          {/* Activity Pulse Chart (Requirement 3: Trends) */}
          <ProfileActivityChart 
            data={Object.entries(
              activities.reduce((acc, curr) => {
                const date = new Date(curr.createdAt).toISOString().split('T')[0];
                acc[date] = (acc[date] || 0) + 1;
                return acc;
              }, {})
            ).map(([date, count]) => ({ date, count }))}
          />

          <Card title="Activity Feed" subtitle="Background events detected by SkilHunt worker">
            <ActivityFeed developerId={id} />
          </Card>
        </div>
      ) : (
        /* Notes Tab Content */
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card title="Recruiter Notes" subtitle="Internal notes and history for this developer">
              {/* Add Note Form - Only for Recruiters/Admins */}
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
                          {!isAnalyst && (
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

              {/* Campaign Assignment */}
              <div className="pt-4 border-t border-border">
                <label className="block text-xs font-medium text-muted-foreground mb-2">Assign to Campaign</label>
                <select
                  value={developer.campaignId || ''}
                  onChange={(e) => handleStatusChange(developer.currentStatus, e.target.value || null)}
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
      )}
    </div>
  );
}
