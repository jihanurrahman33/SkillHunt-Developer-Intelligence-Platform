'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { fetchDeveloperById, updateDeveloperStatus } from '@/features/developers/services/developer.service';
import { getDeveloperActivity } from '@/features/developers/services/activity.service';
import { useCampaignContext } from '@/features/campaigns/context/CampaignContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import Card from '@/components/ui/Card';
import ProfileSkeleton from '@/components/ui/ProfileSkeleton';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import Swal from 'sweetalert2';
import dynamic from 'next/dynamic';

const ActivityFeed = dynamic(() => import('@/features/developers/components/ActivityFeed'), {
  ssr: false,
  loading: () => <div className="h-48 flex items-center justify-center border border-border rounded-xl bg-surface animate-pulse text-muted-foreground mt-4">Loading activity logs...</div>
});

import ProfileHeader from './ProfileHeader';
import ProfileOverviewTab from './ProfileOverviewTab';
import ProfileNotesTab from './ProfileNotesTab';
import ProfileActivityChart from './ProfileActivityChart';

export default function DeveloperProfile({ id }) {
  const { campaigns } = useCampaignContext();
  const { user, isAdmin, isAnalyst } = useAuth();
  const [developer, setDeveloper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Notes data via SWR
  const { data: notesResponse, mutate: mutateNotes } = useSWR(
    id ? `/api/developers/${id}/notes` : null,
    url => fetch(url).then(r => r.json()),
    { refreshInterval: 5000 }
  );
  const notes = Array.isArray(notesResponse) ? notesResponse : (notesResponse?.data || []);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [devData, activitiesData] = await Promise.all([
          fetchDeveloperById(id),
          getDeveloperActivity(id, 50)
        ]);
        setDeveloper(devData);
        setActivities(activitiesData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleStatusChange = async (newStatus, newCampaignId = undefined) => {
    setIsUpdating(true);
    try {
      const campaignToSave = newCampaignId !== undefined ? newCampaignId : developer.campaignId;
      await updateDeveloperStatus(id, newStatus, campaignToSave);
      setDeveloper((prev) => ({ 
        ...prev, 
        currentStatus: newStatus,
        ...(newCampaignId !== undefined ? { campaignId: newCampaignId } : {})
      }));
      Swal.fire({
        icon: 'success', title: 'Developer Updated', text: 'Successfully updated developer',
        toast: true, position: 'bottom-end', showConfirmButton: false, timer: 3000,
        background: '#0B1220', color: '#e2e8f0',
      });
    } catch (err) {
      Swal.fire({
        icon: 'error', title: 'Update Failed', text: err.message,
        background: '#0B1220', color: '#e2e8f0', confirmButtonColor: '#2563EB',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <ProfileSkeleton />;
  if (error) return <ErrorDisplay error={new Error(error)} reset={() => window.location.reload()} />;
  if (!developer) return <ErrorDisplay error={new Error('Developer not found')} />;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <ProfileHeader
        developer={developer}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notes={notes}
        isUpdating={isUpdating}
        isAnalyst={isAnalyst}
        isAdmin={isAdmin}
        user={user}
        onStatusChange={handleStatusChange}
      />

      {activeTab === 'overview' ? (
        <ProfileOverviewTab developer={developer} />
      ) : activeTab === 'activity' ? (
        <div className="space-y-6">
          <ProfileActivityChart 
            data={Object.entries(
              activities.reduce((acc, curr) => {
                const date = new Date(curr.createdAt).toISOString().split('T')[0];
                acc[date] = (acc[date] || 0) + 1;
                return acc;
              }, {})
            ).map(([date, count]) => ({ date, count }))}
          />
          <Card title="Activity Feed" subtitle="Background events detected by SkilHunt worker">
            <ActivityFeed developerId={id} />
          </Card>
        </div>
      ) : (
        <ProfileNotesTab
          developer={developer}
          id={id}
          notes={notes}
          mutateNotes={mutateNotes}
          isAnalyst={isAnalyst}
          isAdmin={isAdmin}
          user={user}
          campaigns={campaigns}
          isUpdating={isUpdating}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
