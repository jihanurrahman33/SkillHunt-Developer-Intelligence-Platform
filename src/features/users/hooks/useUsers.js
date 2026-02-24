'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/features/auth/context/AuthContext';
import { fetchUsers, updateUserRole, updateUser, deleteUser } from '@/features/users/services/users.service';

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
    { keepPreviousData: true, refreshInterval: 5000 }
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

  const blockUser = async (userId) => {
    try {
      mutate({ users: users.map((u) => u._id === userId ? { ...u, role: 'viewer', onboardingStatus: 'rejected' } : u), pagination }, false);
      await updateUser(userId, { role: 'viewer', onboardingStatus: 'rejected' });
      mutate();
      return { success: true };
    } catch (err) {
      mutate();
      return { success: false, error: err.message };
    }
  };

  const unblockUser = async (userId) => {
    try {
      mutate({ users: users.map((u) => u._id === userId ? { ...u, role: 'recruiter', onboardingStatus: 'approved' } : u), pagination }, false);
      await updateUser(userId, { role: 'recruiter', onboardingStatus: 'approved' });
      mutate();
      return { success: true };
    } catch (err) {
      mutate();
      return { success: false, error: err.message };
    }
  };

  const removeUser = async (userId) => {
    try {
      mutate({ users: users.filter((u) => u._id !== userId), pagination: { ...pagination, total: pagination.total - 1 } }, false);
      await deleteUser(userId);
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
    blockUser,
    unblockUser,
    removeUser,
    reload: () => mutate(),
  };
}
