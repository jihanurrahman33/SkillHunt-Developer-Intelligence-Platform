'use client';

import { useState } from 'react';
import useUsers from '@/features/users/hooks/useUsers';
import Badge from '@/components/ui/Badge';
import Swal from 'sweetalert2';
import { HiOutlineSearch, HiOutlineShieldCheck, HiOutlineUser } from 'react-icons/hi';

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
  } = useUsers();

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">User Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage team members and their roles
          </p>
        </div>
        {pagination && (
          <span className="text-sm text-muted-foreground">
            {pagination.total} user{pagination.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <HiOutlineSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-border bg-surface py-1.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="recruiter">Recruiter</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Provider
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Joined
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
                      variant={user.role === 'admin' ? 'info' : 'default'}
                      dot
                    >
                      {user.role === 'admin' ? (
                        <span className="flex items-center gap-1">
                          <HiOutlineShieldCheck className="h-3 w-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <HiOutlineUser className="h-3 w-3" />
                          Recruiter
                        </span>
                      )}
                    </Badge>
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
                    <button
                      onClick={() => handleRoleChange(user._id, user.name, user.role)}
                      className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                    >
                      {user.role === 'admin' ? 'Make Recruiter' : 'Make Admin'}
                    </button>
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
