/**
 * Service for fetching Dashboard Analytics data
 */

export async function fetchAnalyticsData() {
  const t = Date.now();
  const response = await fetch(`/api/analytics?t=${t}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Failed to fetch analytics data');
  }

  const data = await response.json();
  return data;
}
