'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useAnalytics } from '@/features/dashboard/hooks/useAnalytics';
import StatCard from './StatCard';
import RecentActivityWidget from '@/features/dashboard/components/RecentActivityWidget';
import Button from '@/components/ui/Button';

// Lazy load heavy chart components
const FunnelChart = dynamic(() => import('./FunnelChart'), { 
  ssr: false, 
  loading: () => <div className="h-[400px] flex items-center justify-center border border-border rounded-xl bg-surface animate-pulse text-muted-foreground">Loading chart...</div> 
});
const ActivityTimelineChart = dynamic(() => import('./ActivityTimelineChart'), { 
  ssr: false, 
  loading: () => <div className="h-[400px] flex items-center justify-center border border-border rounded-xl bg-surface animate-pulse text-muted-foreground">Loading chart...</div> 
});
const TopTechChart = dynamic(() => import('./TopTechChart'), { 
  ssr: false, 
  loading: () => <div className="h-[400px] flex items-center justify-center border border-border rounded-xl bg-surface animate-pulse text-muted-foreground">Loading chart...</div> 
});

import { 
  HiOutlineUserGroup, 
  HiOutlineBadgeCheck, 
  HiOutlineBriefcase, 
  HiOutlineLightningBolt,
  HiOutlineRefresh
} from 'react-icons/hi';

export default function DashboardOverview() {
  const { data, loading, error, refresh } = useAnalytics();

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center pb-2">
          <div className="h-8 w-48 bg-muted rounded"></div>
          <div className="h-10 w-32 bg-muted rounded"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-surface border border-border rounded-xl"></div>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 h-[400px] bg-surface border border-border rounded-xl"></div>
          <div className="md:col-span-1 h-[400px] bg-surface border border-border rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-danger/50 rounded-xl bg-danger/5">
        <p className="text-danger font-medium mb-4">Failed to load dashboard analytics</p>
        <p className="text-sm text-foreground/70 mb-6 max-w-md">{error}</p>
        <Button onClick={refresh} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  const { kpis, statusDistribution, activityTimeline, topTechStack } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Analytics Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">Monitor recruitment pipeline health and developer network trends.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={refresh} 
          disabled={loading}
          className="shrink-0"
        >
          <HiOutlineRefresh className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Developers" 
          value={kpis?.totalDevelopers?.toLocaleString() || '0'} 
          icon={HiOutlineUserGroup}
          description="In your database"
        />
        <StatCard 
          title="Total Hired" 
          value={kpis?.totalHired?.toLocaleString() || '0'} 
          icon={HiOutlineBadgeCheck}
          description="Successfully recruited"
        />
        <StatCard 
          title="Active Campaigns" 
          value={kpis?.activeCampaigns?.toLocaleString() || '0'} 
          icon={HiOutlineBriefcase}
          description="Running right now"
        />
        <StatCard 
          title="Active This Week" 
          value={kpis?.activeThisWeek?.toLocaleString() || '0'} 
          icon={HiOutlineLightningBolt}
          trend={kpis?.totalDevelopers ? Math.round((kpis?.activeThisWeek / kpis?.totalDevelopers) * 100) : 0}
          description="of total network"
        />
      </div>

      {/* Charts Level 1 */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <ActivityTimelineChart data={activityTimeline} />
        </div>
        <div className="md:col-span-1">
          <FunnelChart data={statusDistribution} />
        </div>
      </div>

      {/* Charts Level 2 */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <TopTechChart data={topTechStack} />
        </div>
        <div className="md:col-span-1">
          <div className="h-[400px]">
            <RecentActivityWidget limit={7} />
          </div>
        </div>
      </div>
    </div>
  );
}
