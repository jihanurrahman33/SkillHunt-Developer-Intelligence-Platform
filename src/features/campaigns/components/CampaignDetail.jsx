'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCampaignContext } from '@/features/campaigns/context/CampaignContext';
import { useDeveloperContext } from '@/features/developers/context/DeveloperContext';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import { HiOutlineArrowLeft, HiOutlineBriefcase, HiOutlineUserGroup, HiOutlineCalendar } from 'react-icons/hi';

export default function CampaignDetail({ campaignId }) {
  const router = useRouter();
  const { campaigns, loading: campaignLoading } = useCampaignContext();
  const { developers, loading: devLoading } = useDeveloperContext();
  
  const [campaign, setCampaign] = useState(null);
  const [assignedDevs, setAssignedDevs] = useState([]);

  useEffect(() => {
    if (!campaignLoading && campaigns.length > 0) {
      const found = campaigns.find(c => c._id === campaignId);
      setCampaign(found || null);
    }
  }, [campaignId, campaigns, campaignLoading]);

  // Derive assigned devs base on developer.campaigns mapping
  // We assume developers have a `campaigns` array of IDs or a single `campaignId` field we will add next
  useEffect(() => {
    if (!devLoading && developers.length > 0 && campaignId) {
      // Find devs mapped to this campaign context
      const filtered = developers.filter(dev => 
        dev.campaigns?.includes(campaignId) || dev.campaignId === campaignId
      );
      setAssignedDevs(filtered);
    }
  }, [campaignId, developers, devLoading]);

  const loading = campaignLoading || devLoading;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <h2 className="text-xl font-semibold text-foreground">Campaign Not Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The campaign you are looking for does not exist or has been deleted.</p>
        <Button className="mt-6" variant="primary" onClick={() => router.push('/campaigns')}>
          Back to Campaigns
        </Button>
      </div>
    );
  }

  // Calculate funnel metrics
  const statuses = {
    new: assignedDevs.filter(d => d.currentStatus === 'new').length,
    contacted: assignedDevs.filter(d => d.currentStatus === 'contacted').length,
    interviewing: assignedDevs.filter(d => d.currentStatus === 'interviewing').length,
    hired: assignedDevs.filter(d => d.currentStatus === 'hired').length,
    rejected: assignedDevs.filter(d => d.currentStatus === 'rejected').length,
  };
  const totalAssigned = assignedDevs.length;

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/campaigns')}
          icon={<HiOutlineArrowLeft className="h-4 w-4" />}
        >
          Back
        </Button>
        <div className="flex items-center gap-2">
          {campaign.status === 'active' && <Badge variant="success">Active</Badge>}
          {campaign.status === 'closed' && <Badge variant="secondary">Closed</Badge>}
          {campaign.status === 'draft' && <Badge variant="default" className="bg-muted text-foreground">Draft</Badge>}
        </div>
      </div>

      {/* Header Card */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">{campaign.title}</h1>
        {campaign.description && (
          <p className="mt-2 text-muted-foreground">{campaign.description}</p>
        )}
        
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4 border-t border-border pt-6 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <HiOutlineBriefcase className="h-5 w-5 text-primary" />
            <span>Target Role: <strong className="text-foreground font-medium">{campaign.role}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <HiOutlineUserGroup className="h-5 w-5 text-primary" />
            <span>Created By: <strong className="text-foreground font-medium">{campaign.createdBy?.name || 'Unknown'}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <HiOutlineCalendar className="h-5 w-5 text-primary" />
            <span>Created: <strong className="text-foreground font-medium">{campaign.createdAt ? format(new Date(campaign.createdAt), 'MMM d, yyyy') : 'N/A'}</strong></span>
          </div>
        </div>
      </div>

      {/* Metrics / Funnel */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Devs</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{totalAssigned}</p>
        </div>
        <div className="rounded-xl border border-status-new/20 bg-status-new/5 p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-status-new">New</p>
          <p className="mt-2 text-3xl font-bold text-status-new">{statuses.new}</p>
        </div>
        <div className="rounded-xl border border-status-contacted/20 bg-status-contacted/5 p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-status-contacted">Contacted</p>
          <p className="mt-2 text-3xl font-bold text-status-contacted">{statuses.contacted}</p>
        </div>
        <div className="rounded-xl border border-status-interviewing/20 bg-status-interviewing/5 p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-status-interviewing">Interviewing</p>
          <p className="mt-2 text-3xl font-bold text-status-interviewing">{statuses.interviewing}</p>
        </div>
        <div className="rounded-xl border border-status-hired/20 bg-status-hired/5 p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-status-hired">Hired</p>
          <p className="mt-2 text-3xl font-bold text-status-hired">{statuses.hired}</p>
        </div>
        <div className="rounded-xl border border-status-rejected/20 bg-status-rejected/5 p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-status-rejected">Rejected</p>
          <p className="mt-2 text-3xl font-bold text-status-rejected">{statuses.rejected}</p>
        </div>
      </div>

      {/* Developer List */}
      <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Assigned Candidates</h2>
        </div>
        
        {assignedDevs.length > 0 ? (
          <table className="w-full text-left text-sm text-foreground">
            <thead className="border-b border-border bg-secondary/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Candidate</th>
                <th className="px-6 py-3 font-medium">Location</th>
                <th className="px-6 py-3 font-medium text-center">Score</th>
                <th className="px-6 py-3 font-medium">Pipeline Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assignedDevs.map(dev => (
                <tr key={dev._id} className="transition-colors hover:bg-surface-hover">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {dev.avatarUrl ? (
                         <img src={dev.avatarUrl} alt={dev.name} className="h-8 w-8 rounded-full border border-border object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                          {dev.name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <Link href={`/developers/${dev._id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                          {dev.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">@{dev.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{dev.location || '—'}</td>
                  <td className="px-6 py-4 text-center font-medium">{dev.activityScore || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`
                      inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border
                      ${dev.currentStatus === 'new' ? 'bg-status-new/10 text-status-new border-status-new/20' : 
                        dev.currentStatus === 'contacted' ? 'bg-status-contacted/10 text-status-contacted border-status-contacted/20' : 
                        dev.currentStatus === 'interviewing' ? 'bg-status-interviewing/10 text-status-interviewing border-status-interviewing/20' : 
                        dev.currentStatus === 'hired' ? 'bg-status-hired/10 text-status-hired border-status-hired/20' : 
                        'bg-status-rejected/10 text-status-rejected border-status-rejected/20'}
                    `}>
                      {dev.currentStatus.charAt(0).toUpperCase() + dev.currentStatus.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No developers have been assigned to this campaign yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Navigate to a Developer Profile to assign them.</p>
            <Button className="mt-4" variant="outline" onClick={() => router.push('/developers')}>
              Browse Developers
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
