'use client';

import { useState } from 'react';
import useUsers from '@/features/users/hooks/useUsers';
import Badge from '@/components/ui/Badge';
import Swal from 'sweetalert2';
import { HiOutlineSearch, HiOutlineShieldCheck, HiOutlineUser, HiOutlineTrash } from 'react-icons/hi';

export default function UserManagement() {
  const {
    users,
    pagination,
    loading,
    error,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    page,
    setPage,
    changeRole,
    approveUser,
    rejectUser,
    blockUser,
    unblockUser,
    removeUser,
  } = useUsers();

  const [onboardingFilter, setOnboardingFilter] = useState('');

  const handleRoleChange = async (userId, userName, currentRole) => {
    const newRole = currentRole === 'admin' ? 'recruiter' : 'admin';

    const result = await Swal.fire({
      title: 'Change Role',
      html: `Change <strong>${userName}</strong>'s role to <strong>${newRole}</strong>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, change it',
      cancelButtonText: 'Cancel',
      background: '#0B1220',
      color: '#e2e8f0',
      confirmButtonColor: '#2563EB',
    });

    if (result.isConfirmed) {
      const res = await changeRole(userId, newRole);

      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'Role Updated',
          text: `${userName} is now a ${newRole}`,
          timer: 1500,
          showConfirmButton: false,
          background: '#0B1220',
          color: '#e2e8f0',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: res.error,
          background: '#0B1220',
          color: '#e2e8f0',
          confirmButtonColor: '#2563EB',
        });
      }
    }
  };

  const handleBlockUser = async (userId, userName) => {
    const result = await Swal.fire({
      title: 'Block Recruiter?',
      html: `Are you sure you want to block <strong>${userName}</strong>? This will immediately revoke their access to the system.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, block them',
      cancelButtonText: 'Cancel',
      background: '#0B1220',
      color: '#e2e8f0',
      confirmButtonColor: '#ef4444',
    });

    if (result.isConfirmed) {
      const res = await blockUser(userId);

      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'User Blocked',
          text: `${userName}'s access has been revoked.`,
          timer: 2000,
          showConfirmButton: false,
          background: '#0B1220',
          color: '#e2e8f0',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed to Block',
          text: res.error,
          background: '#0B1220',
          color: '#e2e8f0',
          confirmButtonColor: '#2563EB',
        });
      }
    }
  };

  const handleUnblockUser = async (userId, userName) => {
    const result = await Swal.fire({
      title: 'Unblock User?',
      html: `Restore <strong>${userName}</strong>'s recruiter access?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, unblock',
      cancelButtonText: 'Cancel',
      background: '#0B1220',
      color: '#e2e8f0',
      confirmButtonColor: '#22c55e',
    });

    if (result.isConfirmed) {
      const res = await unblockUser(userId);

      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'User Unblocked',
          text: `${userName} has been restored as a Recruiter.`,
          timer: 2000,
          showConfirmButton: false,
          background: '#0B1220',
          color: '#e2e8f0',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed to Unblock',
          text: res.error,
          background: '#0B1220',
          color: '#e2e8f0',
          confirmButtonColor: '#2563EB',
        });
      }
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const result = await Swal.fire({
      title: 'Permanently Delete User?',
      html: `This will <strong>permanently</strong> remove <strong>${userName}</strong> from the system. This action <strong>cannot be undone</strong>.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete permanently',
      cancelButtonText: 'Cancel',
      background: '#0B1220',
      color: '#e2e8f0',
      confirmButtonColor: '#ef4444',
    });

    if (result.isConfirmed) {
      const res = await removeUser(userId);

      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'User Deleted',
          text: `${userName} has been permanently removed.`,
          timer: 2000,
          showConfirmButton: false,
          background: '#0B1220',
          color: '#e2e8f0',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed to Delete',
          text: res.error,
          background: '#0B1220',
          color: '#e2e8f0',
          confirmButtonColor: '#2563EB',
        });
      }
    }
  };

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-danger">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">User Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage team members and their roles
          </p>
        </div>
        {pagination && (
          <Badge variant="outline" className="sm:inline-flex">
            {pagination.total} user{pagination.total !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search team members..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-40 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="recruiter">Recruiter</option>
          <option value="viewer">Viewer</option>
        </select>

        <select
          value={onboardingFilter}
          onChange={(e) => {
            setOnboardingFilter(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-40 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Mobile Card View (shown only on small screens) */}
      <div className="grid gap-4 sm:hidden">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-border bg-surface p-4 h-32" />
          ))
        ) : users.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
            No users found.
          </div>
        ) : (
          users.map((user) => (
            <div key={user._id} className="rounded-xl border border-border bg-surface p-4 shadow-sm transition-all hover:border-primary/50">
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
                    variant={
                      user.role === 'admin' ? 'info' : 
                      user.role === 'recruiter' ? 'default' : 'default'
                    }
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
                      onClick={() => approveUser(user._id)}
                      className="flex-1 rounded-lg bg-success/10 py-2 text-xs font-bold text-success transition-colors hover:bg-success hover:text-white"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectUser(user._id)}
                      className="flex-1 rounded-lg bg-danger/10 py-2 text-xs font-bold text-danger transition-colors hover:bg-danger hover:text-white"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRoleChange(user._id, user.name, user.role)}
                      className="flex-1 rounded-lg border border-primary/20 bg-primary/5 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white"
                    >
                      {user.role === 'admin' ? 'Demote to Recruiter' : 'Promote to Admin'}
                    </button>
                    {user.role === 'recruiter' && (
                      <button
                        onClick={() => handleBlockUser(user._id, user.name)}
                        className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-2 text-xs font-bold text-danger transition-colors hover:bg-danger hover:text-white"
                      >
                        Block
                      </button>
                    )}
                    {user.role === 'viewer' && user.onboardingStatus === 'rejected' && (
                      <button
                        onClick={() => handleUnblockUser(user._id, user.name)}
                        className="rounded-lg border border-success/20 bg-success/5 px-4 py-2 text-xs font-bold text-success transition-colors hover:bg-success hover:text-white"
                      >
                        Unblock
                      </button>
                    )}
                  </div>
                )}
                <button
                  onClick={() => handleDeleteUser(user._id, user.name)}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg border border-danger/10 bg-danger/5 py-2 text-xs font-bold text-danger transition-colors hover:bg-danger hover:text-white"
                >
                  <HiOutlineTrash className="h-3.5 w-3.5" />
                  Delete User
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (hidden on small screens) */}
      <div className="hidden sm:block overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Provider
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Joined
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3"><div className="h-4 w-32 rounded bg-muted" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-40 rounded bg-muted" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-muted" /></td>
                  <td className="px-4 py-3"><div className="h-5 w-20 rounded-full bg-muted" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-muted" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-muted" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-muted ml-auto" /></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user._id}
                  className="transition-colors hover:bg-surface-hover"
                >
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
                            onClick={() => approveUser(user._id)}
                            className="text-xs font-bold text-success hover:text-success/80 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectUser(user._id)}
                            className="text-xs font-bold text-danger hover:text-danger/80 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRoleChange(user._id, user.name, user.role)}
                            className="text-xs font-bold text-primary hover:text-primary-hover transition-colors"
                          >
                            {user.role === 'admin' ? 'Make Recruiter' : 'Make Admin'}
                          </button>
                          {user.role === 'recruiter' && (
                            <>
                              <span className="text-border">|</span>
                              <button
                                onClick={() => handleBlockUser(user._id, user.name)}
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
                                onClick={() => handleUnblockUser(user._id, user.name)}
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
                        onClick={() => handleDeleteUser(user._id, user.name)}
                        className="text-xs font-bold text-danger/60 hover:text-danger transition-colors"
                        title="Delete User Permanently"
                      >
                        <HiOutlineTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-md border border-border px-3 py-1 text-xs text-foreground transition-colors hover:bg-surface-hover disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="rounded-md border border-border px-3 py-1 text-xs text-foreground transition-colors hover:bg-surface-hover disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
