// Users service layer
const API_BASE = '/api/users';

export async function fetchUsers(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE}?${query}`);

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to fetch users');
  }

  return response.json();
}

export async function updateUser(userId, updates) {
  const response = await fetch(API_BASE, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...updates }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to update user');
  }

  return response.json();
}

export async function requestRecruiterAccess() {
  const response = await fetch(`${API_BASE}/request-recruiter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to request recruiter access');
  }

  return response.json();
}

// Keep for backward compatibility if needed, but prefer updateUser
export async function updateUserRole(userId, role) {
  return updateUser(userId, { role });
}
