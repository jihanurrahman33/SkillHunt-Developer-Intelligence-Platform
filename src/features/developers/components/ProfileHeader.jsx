import Link from 'next/link';
import Button from '@/components/ui/Button';
import { FaGithub } from 'react-icons/fa';
import { 
  HiOutlineLocationMarker, 
  HiOutlineOfficeBuilding, 
  HiOutlineLink,
  HiOutlineCalendar,
  HiOutlineArrowLeft
} from 'react-icons/hi';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
];

export default function ProfileHeader({ developer, activeTab, setActiveTab, notes, isUpdating, isAnalyst, user, isAdmin, onStatusChange }) {
  return (
    <>
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
            onChange={(e) => onStatusChange(e.target.value)}
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
          <div className="absolute top-4 right-4 sm:right-6 flex flex-col items-end gap-2 z-10">
            <div className="flex flex-col items-center justify-center rounded-lg border border-white/20 bg-black/40 backdrop-blur-md px-4 sm:px-6 py-2 min-w-[100px] sm:min-w-[120px] shadow-sm">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/90">Activity Score</span>
              <span className="text-2xl sm:text-3xl font-bold text-white leading-tight">{developer.activityScore}</span>
            </div>
            <div className={`
              px-2.5 sm:px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-md border drop-shadow-md
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
              {developer.addedByName && (
                <span className="flex items-center gap-1.5 text-primary bg-primary/20 border border-primary/30 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide">
                  Added by {developer.addedByName}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Tabs */}
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
    </>
  );
}
