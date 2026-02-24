import Badge from '@/components/ui/Badge';
import { HiOutlineShieldCheck, HiOutlineUser, HiOutlineTrash } from 'react-icons/hi';

export default function UserTableRow({ user, onApprove, onReject, onRoleChange, onBlock, onUnblock, onDelete }) {
  return (
    <tr className="transition-colors hover:bg-surface-hover">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
            {user.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <span className="text-sm font-medium text-foreground">
            {user.name}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {user.email}
      </td>
      <td className="px-4 py-3">
        <span className="text-xs capitalize text-muted-foreground">
          {user.provider || 'credentials'}
        </span>
      </td>
      <td className="px-4 py-3">
        <Badge
          variant={
            user.role === 'admin' ? 'info' : 
            user.role === 'recruiter' ? 'success' : 'default'
          }
          dot
        >
          {user.role === 'admin' ? (
            <span className="flex items-center gap-1">
              <HiOutlineShieldCheck className="h-3 w-3" />
              Admin
            </span>
          ) : user.role === 'recruiter' ? (
            <span className="flex items-center gap-1">
              <HiOutlineUser className="h-3 w-3" />
              Recruiter
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <HiOutlineUser className="h-3 w-3" />
              Viewer
            </span>
          )}
        </Badge>
        {user.onboardingStatus === 'pending' && (
          <Badge variant="warning" size="sm" className="ml-2 animate-pulse">Requesting Access</Badge>
        )}
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-muted-foreground">
          {user.onboardingStatus || '—'}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {user.createdAt
          ? new Date(user.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : '—'}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-3">
          {user.onboardingStatus === 'pending' ? (
            <>
              <button
                onClick={() => onApprove(user._id)}
                className="text-xs font-bold text-success hover:text-success/80 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => onReject(user._id)}
                className="text-xs font-bold text-danger hover:text-danger/80 transition-colors"
              >
                Reject
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRoleChange(user._id, user.name, user.role)}
                className="text-xs font-bold text-primary hover:text-primary-hover transition-colors"
              >
                {user.role === 'admin' ? 'Make Recruiter' : 'Make Admin'}
              </button>
              {user.role === 'recruiter' && (
                <>
                  <span className="text-border">|</span>
                  <button
                    onClick={() => onBlock(user._id, user.name)}
                    className="text-xs font-bold text-danger hover:text-danger/80 transition-colors"
                  >
                    Block
                  </button>
                </>
              )}
              {user.role === 'viewer' && user.onboardingStatus === 'rejected' && (
                <>
                  <span className="text-border">|</span>
                  <button
                    onClick={() => onUnblock(user._id, user.name)}
                    className="text-xs font-bold text-success hover:text-success/80 transition-colors"
                  >
                    Unblock
                  </button>
                </>
              )}
            </div>
          )}
          <span className="text-border">|</span>
          <button
            onClick={() => onDelete(user._id, user.name)}
            className="text-xs font-bold text-danger/60 hover:text-danger transition-colors"
            title="Delete User Permanently"
          >
            <HiOutlineTrash className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
