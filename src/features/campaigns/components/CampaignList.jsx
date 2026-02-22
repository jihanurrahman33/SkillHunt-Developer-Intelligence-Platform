'use client';

import { useState } from 'react';
import { useCampaignContext } from '@/features/campaigns/context/CampaignContext';
import CampaignFormModal from './CampaignFormModal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { formatDistanceToNow } from 'date-fns';
import { HiOutlineSearch, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineUsers } from 'react-icons/hi';
import Link from 'next/link';

export default function CampaignList() {
  const { campaigns, loading, error, search, setSearch, removeCampaign } = useCampaignContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);

  const openCreateModal = () => {
    setEditingCampaign(null);
    setIsModalOpen(true);
  };

  const openEditModal = (campaign) => {
    setEditingCampaign(campaign);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" size="sm">Active</Badge>;
      case 'closed':
        return <Badge variant="secondary" size="sm">Closed</Badge>;
      case 'draft':
      default:
        return <Badge variant="default" size="sm" className="bg-muted text-foreground border-border">Draft</Badge>;
    }
  };

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-danger">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Campaigns</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your recruitment efforts and hiring pipelines.
          </p>
        </div>
        <Button 
          onClick={openCreateModal}
          icon={<HiOutlinePlus className="h-4 w-4" />}
        >
          New Campaign
        </Button>
      </div>

      {/* Filters (Basic) */}
      <div className="mb-6 max-w-sm">
        <Input
          placeholder="Search campaigns..."
          icon={<HiOutlineSearch className="h-4 w-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table grid */}
      <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-sm">
        <table className="w-full text-left text-sm text-foreground">
          <thead className="border-b border-border bg-secondary/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Campaign Name</th>
              <th className="px-4 py-3 font-medium">Target Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created By</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="animate-pulse bg-surface">
                  <td className="px-4 py-4"><div className="h-5 w-48 rounded bg-muted" /></td>
                  <td className="px-4 py-4"><div className="h-5 w-32 rounded bg-muted" /></td>
                  <td className="px-4 py-4"><div className="h-6 w-16 rounded-full bg-muted" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-muted" /></td>
                  <td className="px-4 py-4"><div className="ml-auto h-8 w-16 rounded bg-muted" /></td>
                </tr>
              ))
            ) : campaigns.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  No campaigns found. Ready to start hiring?
                </td>
              </tr>
            ) : (
              campaigns.map((camp) => (
                <tr key={camp._id} className="transition-colors hover:bg-surface-hover group">
                  <td className="px-4 py-3">
                    <Link 
                      href={`/campaigns/${camp._id}`} 
                      className="font-medium text-foreground hover:text-primary transition-colors block"
                    >
                      {camp.title}
                    </Link>
                    {camp.description && (
                      <p className="mt-1 text-xs text-muted-foreground truncate max-w-xs">
                        {camp.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {camp.role}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(camp.status)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm">{camp.createdBy?.name || 'System'}</p>
                    <p className="text-xs text-muted-foreground">
                      {camp.createdAt ? formatDistanceToNow(new Date(camp.createdAt), { addSuffix: true }) : ''}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        href={`/campaigns/${camp._id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-surface hover:text-primary transition-colors"
                        title="View Funnel"
                      >
                        <HiOutlineUsers className="h-4 w-4" />
                      </Link>
                      <button 
                        onClick={() => openEditModal(camp)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-surface hover:text-primary transition-colors"
                        title="Edit Campaign"
                      >
                        <HiOutlinePencil className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => removeCampaign(camp._id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors"
                        title="Delete Campaign"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CampaignFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editingCampaign={editingCampaign} 
      />
    </div>
  );
}
