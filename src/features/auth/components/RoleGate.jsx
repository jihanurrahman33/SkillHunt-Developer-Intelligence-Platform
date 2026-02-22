'use client';

import { useAuth } from '@/features/auth/context/AuthContext';

// Role-based visibility wrapper
// Usage: <RoleGate role="admin">Admin-only content</RoleGate>
//        <RoleGate role={['admin', 'recruiter']}>Both roles</RoleGate>

export default function RoleGate({ role, children, fallback = null }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return fallback;

  const allowedRoles = Array.isArray(role) ? role : [role];

  if (!allowedRoles.includes(user.role)) {
    return fallback;
  }

  return children;
}
