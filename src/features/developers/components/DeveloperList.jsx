'use client';

import { useState, useEffect } from 'react';
import { useDeveloperContext } from '@/features/developers/context/DeveloperContext';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useCampaignContext } from '@/features/campaigns/context/CampaignContext';
import Modal from '@/components/modals/Modal';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { useAuth } from '@/features/auth/context/AuthContext';
import { fetchDevelopers } from '@/features/developers/services/developer.service';
import { 
  HiOutlineSearch, 
  HiOutlinePlus, 
  HiOutlineLocationMarker,
  HiOutlineCode,
  HiOutlineExternalLink,
  HiOutlineTrash,
  HiOutlineDownload
} from 'react-icons/hi';
import { FaGithub } from 'react-icons/fa';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
];

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Recently Added' },
  { value: 'activityScore_desc', label: 'Score: High to Low' },
  { value: 'activityScore_asc', label: 'Score: Low to High' },
];

export default function DeveloperList() {
  const {
    developers,
    pagination,
    loading,
    error,
    search, setSearch,
    techStack, setTechStack,
    location, setLocation,
    status, setStatus,
    sortBy, setSortBy,
    sortOrder, setSortOrder,
    page, setPage,
    importDeveloper,
    changeStatus,
    removeDeveloper,
    bulkAssignCampaign, // New hook function
  } = useDeveloperContext();

  const { isAnalyst } = useAuth();
  const { campaigns } = useCampaignContext();
  const activeCampaignsOptions = (campaigns || [])
    .filter(c => c.status === 'active')
    .map(c => ({ value: c._id, label: c.title }));

  // Ingest Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  
  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  // Clear selections when filters or page change
  useEffect(() => {
    setSelectedIds([]);
  }, [page, search, techStack, location, status]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(developers.map(d => d._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  // Export State
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      let data = [];
      
      if (selectedIds.length > 0) {
        // Export only selected rows from current view
        data = developers.filter(dev => selectedIds.includes(dev._id));
      } else {
        // Fetch up to 10k results ignoring pagination to get a full export of current filter
        const res = await fetchDevelopers({
          page: 1,
          limit: 10000,
          sortBy: 'createdAt',
          sortOrder: -1,
          search,
          techStack,
          location,
          status,
        });
        data = res.developers || [];
      }

      if (data.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Empty Export',
          text: 'There are no developers matching the current filters to export.',
          background: '#0B1220',
          color: '#e2e8f0',
        });
        setIsExporting(false);
        return;
      }

      // Build CSV
      const headers = ['Name', 'Username', 'Source', 'Location', 'Company', 'Activity Score', 'Top Skills', 'Status', 'CreatedAt'];
      const csvRows = [headers.join(',')];

      for (const dev of data) {
        const row = [
          `"${(dev.name || '').replace(/"/g, '""')}"`,
          `"${(dev.username || '').replace(/"/g, '""')}"`,
          `"${(dev.sourceUrl || '').replace(/"/g, '""')}"`,
          `"${(dev.location || '').replace(/"/g, '""')}"`,
          `"${(dev.company || '').replace(/"/g, '""')}"`,
          dev.activityScore || 0,
          `"${(dev.techStack || []).join(', ').replace(/"/g, '""')}"`,
          `"${dev.currentStatus || 'new'}"`,
          `"${new Date(dev.createdAt).toISOString().split('T')[0]}"`,
        ];
        csvRows.push(row.join(','));
      }

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `developers_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: err.message,
        background: '#0B1220',
        color: '#e2e8f0',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!githubUsername.trim()) return;

    setIsImporting(true);
    
    // Split by comma or newline, extract usernames from URLs, and remove empty strings
    const usernames = githubUsername
      .split(/[\n,]+/)
      .map(u => {
        let text = u.trim();
        // Extract from URL (e.g. https://github.com/username)
        const match = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
        if (match && match[1]) return match[1];
        
        // Handle @username format
        if (text.startsWith('@')) return text.substring(1);
        
        // Handle stray trailing slashes
        if (text.endsWith('/')) return text.slice(0, -1);
        
        return text.toLowerCase();
      })
      .filter(Boolean);
      
    // Remove duplicates from the pasted list
    const uniqueUsernames = [...new Set(usernames)];
    
    if (uniqueUsernames.length === 0) {
      setIsImporting(false);
      return;
    }

    let successCount = 0;
    let newCount = 0;
    let updateCount = 0;
    let failCount = 0;
    const failedNames = [];

    // Import sequentially to avoid hitting GitHub API rate limits simultaneously
    for (const username of uniqueUsernames) {
      const res = await importDeveloper(username);
      if (res.success) {
        successCount++;
        if (res.data?.message?.includes('imported')) {
          newCount++;
        } else {
          updateCount++;
        }
      } else {
        failCount++;
        failedNames.push(username);
      }
    }

    setIsImporting(false);

    if (successCount > 0) {
      setIsModalOpen(false);
      setGithubUsername('');
      
      const duplicateCount = usernames.length - uniqueUsernames.length;
      let duplicateMsg = duplicateCount > 0 ? ` (Skipped ${duplicateCount} duplicate entries in input)` : '';

      if (uniqueUsernames.length === 1 && failCount === 0) {
        // Single user import formatting
        const isNew = newCount === 1;
        Swal.fire({
          icon: isNew ? 'success' : 'info',
          title: isNew ? 'Developer Imported' : 'Already Tracked',
          text: (isNew 
            ? `${uniqueUsernames[0]} has been added to the database.` 
            : `${uniqueUsernames[0]} is already in your talent pool. Profile data has been refreshed.`) + duplicateMsg,
          timer: 3000,
          showConfirmButton: false,
          background: '#0B1220',
          color: '#e2e8f0',
        });
      } else {
        // Bulk or mixed results formatting
        let msg = `Successfully processed ${successCount} unique developer(s). (${newCount} new, ${updateCount} updated).`;
        if (duplicateCount > 0) msg += `\nSkipped ${duplicateCount} duplicate entries.`;
        if (failCount > 0) msg += `\nFailed to import: ${failedNames.join(', ')}`;

        Swal.fire({
          icon: failCount > 0 ? 'warning' : 'success',
          title: 'Import Complete',
          text: msg,
          timer: failCount > 0 ? 5000 : 3000,
          showConfirmButton: failCount > 0,
          background: '#0B1220',
          color: '#e2e8f0',
        });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Import Failed',
        text: `Failed to import all developers. Errors on: ${failedNames.join(', ')}`,
        background: '#0B1220',
        color: '#e2e8f0',
        confirmButtonColor: '#2563EB',
      });
    }
  };

  const handleStatusChange = async (devId, newStatus) => {
    const res = await changeStatus(devId, newStatus);
    if (!res.success) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: res.error,
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        background: '#0B1220',
        color: '#e2e8f0',
      });
    }
  };

  const handleDelete = async (devId, devName) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${devName}. This will also remove their activity logs.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Yes, delete it!',
      background: '#0B1220',
      color: '#e2e8f0',
    });

    if (confirm.isConfirmed) {
      const res = await removeDeveloper(devId);
      if (res.success) {
        Swal.fire({
          title: 'Deleted!',
          text: 'The developer has been removed.',
          icon: 'success',
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 3000,
          background: '#0B1220',
          color: '#e2e8f0',
        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: res.error,
          icon: 'error',
          background: '#0B1220',
          color: '#e2e8f0',
        });
      }
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
          <h1 className="text-xl font-semibold text-foreground">Developers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pagination ? `${pagination.total} developers found` : 'Manage your talent pool'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={handleExportCSV}
            disabled={isExporting}
            loading={isExporting}
            icon={!isExporting && <HiOutlineDownload className="h-4 w-4" />}
          >
            {selectedIds.length > 0 ? `Export (${selectedIds.length})` : 'Export CSV'}
          </Button>
          {!isAnalyst && (
            <Button 
              onClick={() => setIsModalOpen(true)}
              icon={<HiOutlinePlus className="h-4 w-4" />}
            >
              Import from GitHub
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          placeholder="Search name, bio..."
          icon={<HiOutlineSearch className="h-4 w-4" />}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Input
          placeholder="Top Skills (e.g. React, Node)"
          icon={<HiOutlineCode className="h-4 w-4" />}
          value={techStack}
          onChange={(e) => {
            setTechStack(e.target.value);
            setPage(1);
          }}
        />
        <Input
          placeholder="Location"
          icon={<HiOutlineLocationMarker className="h-4 w-4" />}
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            setPage(1);
          }}
        />
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          placeholder="All Statuses"
        />
        <Select
          options={SORT_OPTIONS}
          value={`${sortBy}_${sortOrder === -1 ? 'desc' : 'asc'}`}
          onChange={(e) => {
            const [newSortBy, newSortOrderStr] = e.target.value.split('_');
            setSortBy(newSortBy);
            setSortOrder(newSortOrderStr === 'desc' ? -1 : 1);
            setPage(1);
          }}
          placeholder="Sort By..."
        />
      </div>

      {/* Bulk Actions Banner */}
      {selectedIds.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary-foreground sm:flex-nowrap">
          <div className="flex items-center gap-2 font-medium shrink-0">
            <Badge variant="default" className="text-xs bg-primary text-primary-foreground">{selectedIds.length}</Badge>
            <span className="text-foreground">Developer(s) selected</span>
          </div>
          {!isAnalyst && (
            <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
              <Select
                options={[{ value: '', label: 'Change Status...' }, ...STATUS_OPTIONS]}
                value=""
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  if (!newStatus) return;
                  
                  setIsBulkActionLoading(true);
                  let successCount = 0;
                  for (const id of selectedIds) {
                    const res = await changeStatus(id, newStatus);
                    if (res.success) successCount++;
                  }
                  setIsBulkActionLoading(false);
                  setSelectedIds([]);
                  
                  Swal.fire({
                    icon: 'success',
                    title: 'Bulk Update',
                    text: `Updated ${successCount} developer(s)`,
                    toast: true, position: 'bottom-end', timer: 3000, showConfirmButton: false,
                    background: '#0B1220', color: '#e2e8f0',
                  });
                }}
              />
              <Select
                options={[
                  { value: '', label: 'Assign to Campaign...' },
                  { value: 'clear', label: '— Remove from Campaign —' },
                  ...activeCampaignsOptions
                ]}
                value=""
                onChange={async (e) => {
                  const actionValue = e.target.value;
                  if (!actionValue) return;

                  const campaignId = actionValue === 'clear' ? null : actionValue;
                  const actionText = campaignId === null ? 'Removed from campaign' : 'Assigned to campaign';

                  setIsBulkActionLoading(true);
                  const res = await bulkAssignCampaign(selectedIds, campaignId);
                  setIsBulkActionLoading(false);
                  setSelectedIds([]);

                  if (res.success) {
                    Swal.fire({
                      icon: 'success',
                      title: 'Bulk Update',
                      text: `Successfully ${actionText.toLowerCase()}`,
                      toast: true, position: 'bottom-end', timer: 3000, showConfirmButton: false,
                      background: '#0B1220', color: '#e2e8f0',
                    });
                  } else {
                    Swal.fire({
                      icon: 'error',
                      title: 'Update Failed',
                      text: res.error || 'Failed to apply bulk assignment',
                      background: '#0B1220', color: '#e2e8f0',
                    });
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const confirm = await Swal.fire({
                    title: 'Are you sure?',
                    text: `You are about to delete ${selectedIds.length} developer(s).`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ef4444',
                    confirmButtonText: 'Yes, delete them!',
                    background: '#0B1220', color: '#e2e8f0',
                  });

                  if (confirm.isConfirmed) {
                    setIsBulkActionLoading(true);
                    let successCount = 0;
                    for (const id of selectedIds) {
                      const res = await removeDeveloper(id);
                      if (res.success) successCount++;
                    }
                    setIsBulkActionLoading(false);
                    setSelectedIds([]);
                    
                    Swal.fire({
                      icon: 'success',
                      title: 'Deleted!',
                      text: `Removed ${successCount} developer(s)`,
                      toast: true, position: 'bottom-end', timer: 3000, showConfirmButton: false,
                      background: '#0B1220', color: '#e2e8f0',
                    });
                  }
                }}
                loading={isBulkActionLoading}
                className="border-danger/20 bg-danger/10 text-danger hover:bg-danger hover:text-white"
                icon={<HiOutlineTrash className="h-4 w-4" />}
              >
                Delete Selected
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-left text-sm text-foreground">
          <thead className="border-b border-border bg-secondary/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium w-10">
                <input 
                  type="checkbox"
                  className="rounded border-border bg-background checked:bg-primary"
                  checked={developers.length > 0 && selectedIds.length === developers.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-4 py-3 font-medium">Developer</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Location</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Top Skills</th>
              <th className="px-4 py-3 font-medium text-center">Score</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse bg-surface">
                  <td className="px-4 py-4"><div className="h-4 w-4 rounded bg-muted" /></td>
                  <td className="px-4 py-4"><div className="h-10 w-48 rounded bg-muted" /></td>
                  <td className="hidden px-4 py-4 sm:table-cell"><div className="h-4 w-24 rounded bg-muted" /></td>
                  <td className="hidden px-4 py-4 md:table-cell"><div className="h-6 w-32 rounded bg-muted" /></td>
                  <td className="px-4 py-4"><div className="mx-auto h-8 w-8 rounded-full bg-muted" /></td>
                  <td className="px-4 py-4"><div className="h-6 w-20 rounded-full bg-muted" /></td>
                  <td className="px-4 py-4"><div className="ml-auto h-8 w-8 rounded bg-muted" /></td>
                </tr>
              ))
            ) : developers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No developers found. Try changing your filters or import a new one.
                </td>
              </tr>
            ) : (
              developers.map((dev) => (
                <tr key={dev._id} className={`transition-colors hover:bg-surface-hover group ${selectedIds.includes(dev._id) ? 'bg-primary/5' : ''}`}>
                  <td className="px-4 py-3">
                    <input 
                      type="checkbox"
                      className="rounded border-border bg-background checked:bg-primary"
                      checked={selectedIds.includes(dev._id)}
                      onChange={() => handleSelectRow(dev._id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {dev.avatarUrl ? (
                        <img 
                          src={dev.avatarUrl} 
                          alt={dev.name} 
                          className="h-10 w-10 shrink-0 rounded-full bg-muted object-cover border border-border"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary border border-primary/20">
                          {dev.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <Link 
                            href={`/developers/${dev._id}`}
                            className="font-medium text-foreground hover:text-primary transition-colors"
                          >
                            {dev.name}
                          </Link>
                          <a 
                            href={dev.sourceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <FaGithub className="h-3.5 w-3.5" />
                          </a>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-muted-foreground">@{dev.username}</p>
                          {dev.lastActivityAt && (
                            <span className="text-[10px] bg-secondary border border-border text-secondary-foreground px-1.5 py-0.5 rounded-sm flex items-center gap-1 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                              Active {new Date(dev.lastActivityAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="hidden px-4 py-3 sm:table-cell">
                    {dev.location ? (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <HiOutlineLocationMarker className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate max-w-[150px]">{dev.location}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                  
                  <td className="hidden px-4 py-3 md:table-cell">
                    <div className="flex flex-wrap gap-1.5">
                      {dev.techStack?.slice(0, 3).map((tech) => (
                        <Badge key={tech} size="sm" variant="default" className="bg-background">
                          {tech}
                        </Badge>
                      ))}
                      {dev.techStack?.length > 3 && (
                        <Badge size="sm" variant="default" className="bg-background">
                          +{dev.techStack.length - 3}
                        </Badge>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className={`
                      inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold
                      ${dev.activityScore >= 80 ? 'bg-success/15 text-success' : 
                        dev.activityScore >= 50 ? 'bg-warning/15 text-warning' : 
                        'bg-muted text-muted-foreground'}
                    `}>
                      {dev.activityScore}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <select
                      value={dev.currentStatus}
                      onChange={(e) => handleStatusChange(dev._id, e.target.value)}
                      disabled={isAnalyst}
                      className={`
                        text-xs font-medium rounded-full px-2 py-1 outline-none border
                        ${isAnalyst ? 'cursor-default' : 'cursor-pointer'}
                        ${dev.currentStatus === 'new' ? 'bg-status-new/10 text-status-new border-status-new/20' : 
                          dev.currentStatus === 'hired' ? 'bg-status-hired/10 text-status-hired border-status-hired/20' : 
                          'bg-surface-hover text-foreground border-border'}
                      `}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link 
                        href={`/developers/${dev._id}`}
                        className="inline-flex items-center justify-center rounded p-1.5 text-muted-foreground hover:bg-surface hover:text-primary transition-colors border border-transparent hover:border-border"
                        title="View Profile"
                      >
                        <HiOutlineExternalLink className="h-4 w-4" />
                      </Link>
                      {!isAnalyst && (
                        <button
                          onClick={() => handleDelete(dev._id, dev.name)}
                          className="inline-flex items-center justify-center rounded p-1.5 text-muted-foreground hover:bg-surface hover:text-danger transition-colors border border-transparent hover:border-border"
                          title="Delete Developer"
                        >
                          <HiOutlineTrash className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Container */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{((page - 1) * 20) + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * 20, pagination.total)}</span> of <span className="font-medium text-foreground">{pagination.total}</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isImporting && setIsModalOpen(false)}
        title="Import Developer"
      >
        <form onSubmit={handleImport} className="space-y-4">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            Enter one or more GitHub usernames or profile URLs (separated by commas or new lines) to automatically fetch their profiles, calculate their activity scores, and add them to your talent pool.
          </p>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">GitHub Usernames or URLs</label>
            <div className="relative">
              <FaGithub className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <textarea
                placeholder="torvalds, https://github.com/gaearon, @yyx990803"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                disabled={isImporting}
                required
                autoFocus
                rows={4}
                className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              disabled={isImporting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isImporting}
              icon={!isImporting && <HiOutlinePlus className="h-4 w-4" />}
            >
              Import Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
