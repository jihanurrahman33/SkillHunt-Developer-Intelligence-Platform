// Developer Activity Service Layer

const API_BASE = '/api/developers';

/**
 * Fetch activity logs for a specific developer
 * @param {string} developerId 
 * @param {number} limit 
 */
export async function getDeveloperActivity(developerId, limit = 20) {
  const response = await fetch(`${API_BASE}/${developerId}/activity?limit=${limit}&_t=${Date.now()}`, { cache: 'no-store' });
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch activity logs');
  }
  
  return data.data;
}

/**
 * Fetch global recent activity logs (e.g., for dashboard)
 * @param {number} limit 
 */
export async function getRecentGlobalActivity(limit = 10) {
  const response = await fetch(`/api/activity/recent?limit=${limit}&_t=${Date.now()}`, { cache: 'no-store' });
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch global activity logs');
  }
  
  return data.data;
}
