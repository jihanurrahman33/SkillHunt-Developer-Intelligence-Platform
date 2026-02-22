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

export async function updateUserRole(userId, role) {
  const response = await fetch(API_BASE, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, role }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to update role');
  }

  return response.json();
}
