import { useState, useCallback } from 'react';
import { useCampaignContext } from '@/features/campaigns/context/CampaignContext';
import { fetchCampaigns } from '@/features/campaigns/services/campaign.service';

export default function useCampaigns() {
  const { campaigns, setCampaigns, loading, setLoading } = useCampaignContext();
  const [error, setError] = useState(null);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchCampaigns();
      setCampaigns(data.campaigns || []);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setCampaigns, setLoading]);

  return {
    campaigns,
    loading,
    error,
    loadCampaigns,
  };
}
