import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { HiOutlineLocationMarker, HiOutlineExternalLink, HiOutlineTrash } from 'react-icons/hi';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
];

export default function DeveloperCardMobile({
  dev,
  selectedIds,
  handleSelectRow,
  handleStatusChange,
  handleDelete,
  isAnalyst,
  isAdmin,
  user
}) {
  return (
    <div className={`rounded-xl border border-border bg-surface p-4 shadow-sm transition-all sm:hidden ${selectedIds.includes(dev._id) ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <input 
              type="checkbox"
              className="absolute -left-1 -top-1 z-10 rounded border-border bg-background checked:bg-primary"
              checked={selectedIds.includes(dev._id)}
              onChange={() => handleSelectRow(dev._id)}
            />
            {dev.avatarUrl ? (
              <img src={dev.avatarUrl} alt={dev.name} className="h-12 w-12 rounded-full border border-border" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
                {dev.name?.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <Link href={`/developers/${dev._id}`} className="block font-bold text-foreground truncate">{dev.name}</Link>
            <p className="text-xs text-muted-foreground">@{dev.username}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black
            ${dev.activityScore >= 80 ? 'bg-success/20 text-success' : dev.activityScore >= 50 ? 'bg-warning/20 text-warning' : 'bg-danger/15 text-danger'}`}>
            {dev.activityScore}
          </div>
          <Badge 
            size="sm" 
            className={`text-[9px] uppercase font-bold
              ${dev.readinessLevel === 'High' ? 'bg-success text-white' : 
                dev.readinessLevel === 'Medium' ? 'bg-warning text-black' : 
                'bg-danger text-white'}`}
          >
            {dev.readinessLevel || 'Low'}
          </Badge>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-3">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Status</p>
          <select
            value={dev.currentStatus}
            onChange={(e) => handleStatusChange(dev._id, e.target.value)}
            disabled={isAnalyst || (dev.ownerId && dev.ownerId !== user?.id && !isAdmin)}
            className={`w-full text-xs font-bold bg-surface-hover border border-border rounded-lg px-2 py-1.5 focus:outline-none 
              ${(dev.ownerId && dev.ownerId !== user?.id && !isAdmin) ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          {dev.ownerId && dev.ownerId !== user?.id && !isAdmin && (
            <p className="text-[9px] text-danger mt-1 italic">Locked by {dev.ownerName}</p>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Location</p>
          <p className="text-xs text-foreground truncate flex items-center gap-1">
            <HiOutlineLocationMarker className="h-3 w-3" />
            {dev.location || 'Unknown'}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
        <div className="flex flex-wrap gap-1">
          {dev.techStack?.slice(0, 3).map(tech => (
            <Badge key={tech} size="sm" variant="outline" className="text-[10px] border-border">{tech}</Badge>
          ))}
        </div>
        <div className="flex gap-2 shrink-0">
           <Link 
            href={`/developers/${dev._id}`}
            className="p-1.5 rounded-lg border border-border hover:bg-surface-hover text-muted-foreground hover:text-primary transition-colors"
          >
            <HiOutlineExternalLink className="h-4 w-4" />
          </Link>
          {!isAnalyst && (
            <button
              onClick={() => handleDelete(dev._id, dev.name)}
              className="p-1.5 rounded-lg border border-border hover:bg-surface-hover text-muted-foreground hover:text-danger transition-colors"
            >
              <HiOutlineTrash className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
