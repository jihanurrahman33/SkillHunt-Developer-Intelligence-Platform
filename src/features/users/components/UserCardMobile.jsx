import Badge from '@/components/ui/Badge';
import { HiOutlineTrash } from 'react-icons/hi';

export default function UserCardMobile({ user, onApprove, onReject, onRoleChange, onBlock, onUnblock, onDelete }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm transition-all hover:border-primary/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary border border-primary/20">
            {user.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-foreground text-sm truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <div className="shrink-0">
          <Badge
            variant={user.role === 'admin' ? 'info' : 'default'}
            dot
            size="sm"
          >
            {user.role === 'admin' ? 'Admin' : 
             user.role === 'recruiter' ? 'Recruiter' : 'Viewer'}
          </Badge>
          {user.onboardingStatus === 'pending' && (
            <div className="mt-1">
              <Badge variant="warning" size="sm" className="animate-pulse">Pending</Badge>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Method</span>
          <span className="text-xs text-foreground capitalize">{user.provider || 'credentials'}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Joined</span>
          <span className="text-xs text-muted-foreground">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
          </span>
        </div>
      </div>

      <div className="mt-3 border-t border-border pt-3">
        {user.onboardingStatus === 'pending' ? (
          <div className="flex gap-2">
            <button
              onClick={() => onApprove(user._id)}
              className="flex-1 rounded-lg bg-success/10 py-2 text-xs font-bold text-success transition-colors hover:bg-success hover:text-white"
            >
              Approve
            </button>
            <button
              onClick={() => onReject(user._id)}
              className="flex-1 rounded-lg bg-danger/10 py-2 text-xs font-bold text-danger transition-colors hover:bg-danger hover:text-white"
            >
              Reject
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => onRoleChange(user._id, user.name, user.role)}
              className="flex-1 rounded-lg border border-primary/20 bg-primary/5 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white"
            >
              {user.role === 'admin' ? 'Demote to Recruiter' : 'Promote to Admin'}
            </button>
            {user.role === 'recruiter' && (
              <button
                onClick={() => onBlock(user._id, user.name)}
                className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-2 text-xs font-bold text-danger transition-colors hover:bg-danger hover:text-white"
              >
                Block
              </button>
            )}
            {user.role === 'viewer' && user.onboardingStatus === 'rejected' && (
              <button
                onClick={() => onUnblock(user._id, user.name)}
                className="rounded-lg border border-success/20 bg-success/5 px-4 py-2 text-xs font-bold text-success transition-colors hover:bg-success hover:text-white"
              >
                Unblock
              </button>
            )}
          </div>
        )}
        <button
          onClick={() => onDelete(user._id, user.name)}
          className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg border border-danger/10 bg-danger/5 py-2 text-xs font-bold text-danger transition-colors hover:bg-danger hover:text-white"
        >
          <HiOutlineTrash className="h-3.5 w-3.5" />
          Delete User
        </button>
      </div>
    </div>
  );
}
