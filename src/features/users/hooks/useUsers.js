'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchUsers, updateUserRole, updateUser } from '@/features/users/services/users.service';

export default function useUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;

      const data = await fetchUsers(params);
      setUsers(data.users || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const approveUser = async (userId, role = 'recruiter') => {
    try {
      await updateUser(userId, { role, onboardingStatus: 'approved' });
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, role, onboardingStatus: 'approved' } : u
        )
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const rejectUser = async (userId) => {
    try {
      await updateUser(userId, { onboardingStatus: 'rejected' });
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, onboardingStatus: 'rejected' } : u
        )
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const changeRole = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      // Optimistic update
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, role: newRole } : u
        )
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
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
    reload: loadUsers,
  };
}
