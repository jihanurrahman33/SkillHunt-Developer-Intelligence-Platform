// Developer API service layer
const API_BASE = '/api/developers';

export async function fetchDevelopers(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE}?${query}`);

  if (!response.ok) {
    throw new Error('Failed to fetch developers');
  }

  return response.json();
}

export async function fetchDeveloperById(id) {
  const response = await fetch(`${API_BASE}/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Developer not found');
    }
    throw new Error('Failed to fetch developer');
  }

  return response.json();
}

export async function ingestFromGitHub(username) {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });

  if (!response.ok) {
    throw new Error('Failed to ingest developer from GitHub');
  }

  return response.json();
}
