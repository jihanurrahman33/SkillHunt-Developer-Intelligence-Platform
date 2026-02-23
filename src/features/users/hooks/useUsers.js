'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/features/auth/context/AuthContext';
import { fetchUsers, updateUserRole, updateUser } from '@/features/users/services/users.service';

export default function useUsers() {
  const { isAuthenticated, user } = useAuth();
  
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const params = { page, limit: 20 };
  if (search) params.search = search;
  if (roleFilter) params.role = roleFilter;
  const queryString = new URLSearchParams(params).toString();

  const { data, error, mutate, isLoading } = useSWR(
    isAuthenticated && user?.id ? `/api/users?${queryString}` : null,
    () => fetchUsers(params),
    { keepPreviousData: true }
  );

  const users = data?.users || [];
  const pagination = data?.pagination || null;

  const approveUser = async (userId, role = 'recruiter') => {
    try {
      mutate({ users: users.map((u) => u._id === userId ? { ...u, role, onboardingStatus: 'approved' } : u), pagination }, false);
      await updateUser(userId, { role, onboardingStatus: 'approved' });
      mutate();
      return { success: true };
    } catch (err) {
      mutate();
      return { success: false, error: err.message };
    }
  };

  const rejectUser = async (userId) => {
    try {
      mutate({ users: users.map((u) => u._id === userId ? { ...u, onboardingStatus: 'rejected' } : u), pagination }, false);
      await updateUser(userId, { onboardingStatus: 'rejected' });
      mutate();
      return { success: true };
    } catch (err) {
      mutate();
      return { success: false, error: err.message };
    }
  };

  const changeRole = async (userId, newRole) => {
    try {
      mutate({ users: users.map((u) => u._id === userId ? { ...u, role: newRole } : u), pagination }, false);
      await updateUserRole(userId, newRole);
      mutate();
      return { success: true };
    } catch (err) {
      mutate();
      return { success: false, error: err.message };
    }
  };

  return {
    users,
    pagination,
    loading: isLoading,
    error: error?.message,
    search, setSearch,
    roleFilter, setRoleFilter,
    page, setPage,
    changeRole,
    approveUser,
    rejectUser,
    reload: () => mutate(),
  };
}
