'use client';

import { useState } from 'react';
import useUsers from '@/features/users/hooks/useUsers';
import Badge from '@/components/ui/Badge';
import Swal from 'sweetalert2';
import { HiOutlineSearch } from 'react-icons/hi';
import UserCardMobile from './UserCardMobile';
import UserTableRow from './UserTableRow';

// Helper component to render a section of users
const UserListSection = ({ title, description, userList, loading, actionProps }) => {
  if (!loading && userList.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 sm:hidden">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-border bg-surface p-4 h-32" />
          ))
        ) : (
          userList.map((user) => (
            <UserCardMobile key={user._id} user={user} {...actionProps} />
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Provider</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Joined</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Action</th>
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
            ) : (
              userList.map((user) => (
                <UserTableRow key={user._id} user={user} {...actionProps} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

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

  const actionProps = {
    onRoleChange: handleRoleChange,
    onBlock: handleBlockUser,
    onUnblock: handleUnblockUser,
    onDelete: handleDeleteUser,
    onApprove: approveUser,
    onReject: rejectUser,
  };

  // Group users
  const admins = users.filter((u) => u.role === 'admin');
  const teamMembers = users.filter((u) => u.role !== 'admin');

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

      {/* Filters */}
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

      {!loading && users.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          No users found.
        </div>
      ) : (
        <>
          <UserListSection 
            title="Administrators" 
            description="Users with full system access and team management privileges."
            userList={admins} 
            loading={loading} 
            actionProps={actionProps} 
          />
          <UserListSection 
            title="Recruitment Team" 
            description="Recruiters, analysts, and pending view requests."
            userList={teamMembers} 
            loading={loading} 
            actionProps={actionProps} 
          />
        </>
      )}

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
