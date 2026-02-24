import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { HiOutlineLocationMarker, HiOutlineExternalLink, HiOutlineTrash } from 'react-icons/hi';
import { FaGithub } from 'react-icons/fa';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
];

export default function DeveloperTableRow({
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
    <tr className={`transition-colors hover:bg-surface-hover group ${selectedIds.includes(dev._id) ? 'bg-primary/5' : ''}`}>
      <td className="px-4 py-3">
        <input 
          type="checkbox"
          className="rounded border-border bg-background checked:bg-primary"
          checked={selectedIds.includes(dev._id)}
          onChange={() => handleSelectRow(dev._id)}
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {dev.avatarUrl ? (
            <img 
              src={dev.avatarUrl} 
              alt={dev.name} 
              className="h-10 w-10 shrink-0 rounded-full bg-muted object-cover border border-border"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary border border-primary/20">
              {dev.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <Link 
                href={`/developers/${dev._id}`}
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                {dev.name}
              </Link>
              <a 
                href={dev.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <FaGithub className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-muted-foreground">@{dev.username}</p>
              {dev.lastActivityAt && (
                <span className="text-[10px] bg-secondary border border-border text-secondary-foreground px-1.5 py-0.5 rounded-sm flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                  Active {new Date(dev.lastActivityAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>
      
      <td className="hidden px-4 py-3 sm:table-cell">
        {dev.location ? (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <HiOutlineLocationMarker className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate max-w-[150px]">{dev.location}</span>
          </span>
        ) : (
          <span className="text-muted-foreground/50">—</span>
        )}
      </td>
      
      <td className="hidden px-4 py-3 md:table-cell">
        <div className="flex flex-wrap gap-1.5">
          {dev.techStack?.slice(0, 3).map((tech) => (
            <Badge key={tech} size="sm" variant="default" className="bg-background">
              {tech}
            </Badge>
          ))}
          {dev.techStack?.length > 3 && (
            <Badge size="sm" variant="default" className="bg-background">
              +{dev.techStack.length - 3}
            </Badge>
          )}
        </div>
      </td>

      <td className="px-4 py-3 text-center">
        <div className="flex flex-col items-center gap-1">
          <div className={`
            inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold
            ${dev.activityScore >= 80 ? 'bg-success/15 text-success' : 
              dev.activityScore >= 50 ? 'bg-warning/15 text-warning' : 
              'bg-danger/15 text-danger'}
          `}>
            {dev.activityScore}
          </div>
          <Badge 
            variant="default" 
            size="sm" 
            className={`
              text-[9px] uppercase tracking-tighter px-1 py-0 h-auto
              ${dev.readinessLevel === 'High' ? 'bg-success text-white' : 
                dev.readinessLevel === 'Medium' ? 'bg-warning text-black' : 
                'bg-danger text-white'}
            `}
          >
            {dev.readinessLevel || 'Low'}
          </Badge>
        </div>
      </td>

      <td className="px-4 py-3">
        <select
          value={dev.currentStatus}
          onChange={(e) => handleStatusChange(dev._id, e.target.value)}
          disabled={isAnalyst || (dev.ownerId && dev.ownerId !== user?.id && !isAdmin)}
          className={`
            text-xs font-medium rounded-full px-2 py-1 outline-none border
            ${isAnalyst || (dev.ownerId && dev.ownerId !== user?.id && !isAdmin) ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
            ${dev.currentStatus === 'new' ? 'bg-status-new/10 text-status-new border-status-new/20' : 
              dev.currentStatus === 'hired' ? 'bg-status-hired/10 text-status-hired border-status-hired/20' : 
              'bg-surface-hover text-foreground border-border'}
          `}
          title={dev.ownerId && dev.ownerId !== user?.id && !isAdmin ? `Currently handled by ${dev.ownerName}` : ''}
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {dev.ownerId && dev.ownerId !== user?.id && !isAdmin && (
          <span className="block text-[10px] text-danger font-medium mt-1">Locked: {dev.ownerName}</span>
        )}
      </td>

      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <Link 
            href={`/developers/${dev._id}`}
            className="inline-flex items-center justify-center rounded p-1.5 text-muted-foreground hover:bg-surface hover:text-primary transition-colors border border-transparent hover:border-border"
            title="View Profile"
          >
            <HiOutlineExternalLink className="h-4 w-4" />
          </Link>
          {!isAnalyst && (
            <button
              onClick={() => handleDelete(dev._id, dev.name)}
              className="inline-flex items-center justify-center rounded p-1.5 text-muted-foreground hover:bg-surface hover:text-danger transition-colors border border-transparent hover:border-border"
              title="Delete Developer"
            >
              <HiOutlineTrash className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
