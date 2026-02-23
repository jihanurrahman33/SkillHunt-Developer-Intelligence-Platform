// Campaign API service layer
const API_BASE = '/api/campaigns';

export async function fetchCampaigns() {
  const response = await fetch(`${API_BASE}?_t=${Date.now()}`, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Failed to fetch campaigns');
  }

  return response.json();
}

export async function fetchCampaignById(id) {
  const response = await fetch(`${API_BASE}/${id}?_t=${Date.now()}`, { cache: 'no-store' });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Campaign not found');
    }
    throw new Error('Failed to fetch campaign');
  }

  return response.json();
}

export async function createCampaign(data) {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create campaign');
  }

  return response.json();
}
