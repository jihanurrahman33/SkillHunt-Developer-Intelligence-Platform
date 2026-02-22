// Developer Service
const API_BASE = '/api/developers';

export async function fetchDevelopers(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE}?${query}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch developers');
  }

  return response.json();
}

export async function fetchDeveloperById(id) {
  const response = await fetch(`${API_BASE}/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch developer details');
  }

  return response.json();
}

export async function ingestDeveloper(username) {
  const response = await fetch(`${API_BASE}/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to ingest developer');
  }

  return response.json();
}

export async function updateDeveloperStatus(id, status, campaignId = null) {
  const updateData = { currentStatus: status };
  if (campaignId !== null) { // Use null check as default is null
    updateData.campaignId = campaignId;
  }

  const response = await fetch(`${API_BASE}/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update developer status');
  }

  return response.json();
}

export async function getDeveloperNotes(id) {
  const response = await fetch(`${API_BASE}/${id}/notes`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch notes');
  }

  return response.json();
}

export async function addDeveloperNote(id, text) {
  const response = await fetch(`${API_BASE}/${id}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add note');
  }

  return response.json();
}

export async function updateDeveloperNote(id, noteId, text) {
  const response = await fetch(`${API_BASE}/${id}/notes/${noteId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update note');
  }

  return response.json();
}

export async function deleteDeveloperNote(id, noteId) {
  const response = await fetch(`${API_BASE}/${id}/notes/${noteId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete note');
  }

  return response.json();
}

export async function deleteDeveloper(id) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete developer');
  }

  return response.json();
}
