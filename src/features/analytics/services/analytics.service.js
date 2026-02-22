// Analytics API service layer
const API_BASE = '/api/analytics';

export async function fetchAnalytics() {
  const response = await fetch(API_BASE);

  if (!response.ok) {
    throw new Error('Failed to fetch analytics');
  }

  return response.json();
}
