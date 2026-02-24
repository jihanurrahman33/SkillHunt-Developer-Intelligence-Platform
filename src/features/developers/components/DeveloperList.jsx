'use client';

import { useState, useEffect } from 'react';
import { useDeveloperContext } from '@/features/developers/context/DeveloperContext';
import { useCampaignContext } from '@/features/campaigns/context/CampaignContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { fetchDevelopers } from '@/features/developers/services/developer.service';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import Swal from 'sweetalert2';
import { 
  HiOutlineSearch, 
  HiOutlinePlus, 
  HiOutlineDownload,
  HiOutlineTrash
} from 'react-icons/hi';

// Subcomponents
import DeveloperFilters from './DeveloperFilters';
import DeveloperCardMobile from './DeveloperCardMobile';
import DeveloperTableRow from './DeveloperTableRow';
import ImportDeveloperModal from './ImportDeveloperModal';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
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
    bulkAssignCampaign,
  } = useDeveloperContext();

  const { user, isAdmin, isAnalyst } = useAuth();
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
  
  // Mobile Filter State
  const [showFilters, setShowFilters] = useState(false);

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
        data = developers.filter(dev => selectedIds.includes(dev._id));
      } else {
        const res = await fetchDevelopers({
          page: 1, limit: 10000, sortBy: 'createdAt', sortOrder: -1,
          search, techStack, location, status,
        });
        data = res.developers || [];
      }

      if (data.length === 0) {
        Swal.fire({
          icon: 'info', title: 'Empty Export', text: 'There are no developers matching the current filters to export.',
          background: '#0B1220', color: '#e2e8f0',
        });
        setIsExporting(false);
        return;
      }

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

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `developers_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      Swal.fire({
        icon: 'error', title: 'Export Failed', text: err.message,
        background: '#0B1220', color: '#e2e8f0',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!githubUsername.trim()) return;

    setIsImporting(true);
    
    const usernames = githubUsername
      .split(/[\n,]+/)
      .map(u => {
        let text = u.trim();
        const match = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
        if (match && match[1]) return match[1];
        if (text.startsWith('@')) return text.substring(1);
        if (text.endsWith('/')) return text.slice(0, -1);
        return text.toLowerCase();
      })
      .filter(Boolean);
      
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
        const isNew = newCount === 1;
        Swal.fire({
          icon: isNew ? 'success' : 'info',
          title: isNew ? 'Developer Imported' : 'Already Tracked',
          text: (isNew 
            ? `${uniqueUsernames[0]} has been added to the database.` 
            : `${uniqueUsernames[0]} is already in your talent pool. Profile data has been refreshed.`) + duplicateMsg,
          timer: 3000, showConfirmButton: false,
          background: '#0B1220', color: '#e2e8f0',
        });
      } else {
        let msg = `Successfully processed ${successCount} unique developer(s). (${newCount} new, ${updateCount} updated).`;
        if (duplicateCount > 0) msg += `\nSkipped ${duplicateCount} duplicate entries.`;
        if (failCount > 0) msg += `\nFailed to import: ${failedNames.join(', ')}`;

        Swal.fire({
          icon: failCount > 0 ? 'warning' : 'success',
          title: 'Import Complete',
          text: msg,
          timer: failCount > 0 ? 5000 : 3000,
          showConfirmButton: failCount > 0,
          background: '#0B1220', color: '#e2e8f0',
        });
      }
    } else {
      Swal.fire({
        icon: 'error', title: 'Import Failed',
        text: `Failed to import all developers. Errors on: ${failedNames.join(', ')}`,
        background: '#0B1220', color: '#e2e8f0', confirmButtonColor: '#2563EB',
      });
    }
  };

  const handleStatusChange = async (devId, newStatus) => {
    const res = await changeStatus(devId, newStatus);
    if (!res.success) {
      Swal.fire({
        icon: 'error', title: 'Update Failed', text: res.error, toast: true, position: 'bottom-end',
        showConfirmButton: false, timer: 3000, background: '#0B1220', color: '#e2e8f0',
      });
    }
  };

  const handleDelete = async (devId, devName) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${devName}. This will also remove their activity logs.`,
      icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Yes, delete it!',
      background: '#0B1220', color: '#e2e8f0',
    });

    if (confirm.isConfirmed) {
      const res = await removeDeveloper(devId);
      if (res.success) {
        Swal.fire({
          title: 'Deleted!', text: 'The developer has been removed.', icon: 'success', toast: true,
          position: 'bottom-end', showConfirmButton: false, timer: 3000, background: '#0B1220', color: '#e2e8f0',
        });
      } else {
        Swal.fire({
          title: 'Error!', text: res.error, icon: 'error', background: '#0B1220', color: '#e2e8f0',
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
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline"
            onClick={handleExportCSV}
            disabled={isExporting}
            loading={isExporting}
            className="flex-1 sm:flex-none"
            icon={!isExporting && <HiOutlineDownload className="h-4 w-4" />}
          >
            <span className="hidden xs:inline">{selectedIds.length > 0 ? `Export (${selectedIds.length})` : 'Export CSV'}</span>
            <span className="xs:hidden">{selectedIds.length > 0 ? `(${selectedIds.length})` : 'CSV'}</span>
          </Button>
          {!isAnalyst && (
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none"
              icon={<HiOutlinePlus className="h-4 w-4" />}
            >
              <span className="hidden xs:inline">Import from GitHub</span>
              <span className="xs:hidden">Import</span>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="mb-4 lg:hidden">
        <Button 
          variant="ghost" 
          fullWidth
          onClick={() => setShowFilters(!showFilters)}
          className="justify-between border border-border bg-surface"
        >
          <span className="flex items-center gap-2">
            <HiOutlineSearch className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters & Search'}
          </span>
          <Badge variant="outline" className="ml-2">
            {[search, techStack, location, status].filter(Boolean).length} Active
          </Badge>
        </Button>
      </div>

      {/* Filters Base Component */}
      <DeveloperFilters 
        search={search} setSearch={setSearch}
        techStack={techStack} setTechStack={setTechStack}
        location={location} setLocation={setLocation}
        status={status} setStatus={setStatus}
        sortBy={sortBy} setSortBy={setSortBy}
        sortOrder={sortOrder} setSortOrder={setSortOrder}
        showFilters={showFilters} setPage={setPage}
      />

      {/* Bulk Actions Banner */}
      {selectedIds.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-medium">
            <Badge variant="default" className="text-xs bg-primary text-primary-foreground">{selectedIds.length}</Badge>
            <span className="text-foreground">Developer(s) selected</span>
          </div>
          {!isAnalyst && (
            <div className="grid grid-cols-1 gap-2 xs:grid-cols-2 sm:flex sm:items-center">
              <div className="xs:col-span-1">
                <Select
                  options={[{ value: '', label: 'Status...' }, ...STATUS_OPTIONS]}
                  value=""
                  className="w-full"
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
                      icon: 'success', title: 'Bulk Update', text: `Updated ${successCount} developer(s)`,
                      toast: true, position: 'bottom-end', timer: 3000, showConfirmButton: false,
                      background: '#0B1220', color: '#e2e8f0',
                    });
                  }}
                />
              </div>
              <div className="xs:col-span-1">
                <Select
                  options={[
                    { value: '', label: 'Campaign...' },
                    { value: 'clear', label: '— Unassign —' },
                    ...activeCampaignsOptions
                  ]}
                  value=""
                  className="w-full"
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
                        icon: 'success', title: 'Bulk Update', text: `Successfully ${actionText.toLowerCase()}`,
                        toast: true, position: 'bottom-end', timer: 3000, showConfirmButton: false,
                        background: '#0B1220', color: '#e2e8f0',
                      });
                    } else {
                      Swal.fire({
                        icon: 'error', title: 'Update Failed', text: res.error || 'Failed to apply bulk assignment',
                        background: '#0B1220', color: '#e2e8f0',
                      });
                    }
                  }}
                />
              </div>
              <Button
                variant="outline" size="sm"
                onClick={async () => {
                  const confirm = await Swal.fire({
                    title: 'Are you sure?', text: `You are about to delete ${selectedIds.length} developer(s).`,
                    icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Yes, delete them!',
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
                      icon: 'success', title: 'Deleted!', text: `Removed ${successCount} developer(s)`,
                      toast: true, position: 'bottom-end', timer: 3000, showConfirmButton: false,
                      background: '#0B1220', color: '#e2e8f0',
                    });
                  }
                }}
                loading={isBulkActionLoading}
                className="w-full xs:col-span-2 sm:w-auto border-danger/20 bg-danger/10 text-danger hover:bg-danger hover:text-white"
                icon={<HiOutlineTrash className="h-4 w-4" />}
              >
                Delete Selected
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Mobile Card View (shown only on small screens) */}
      <div className="grid gap-4 sm:hidden">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-border bg-surface p-4 h-48" />
          ))
        ) : developers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
            No developers found.
          </div>
        ) : (
          developers.map((dev) => (
            <DeveloperCardMobile
              key={dev._id} dev={dev}
              selectedIds={selectedIds} handleSelectRow={handleSelectRow}
              handleStatusChange={handleStatusChange} handleDelete={handleDelete}
              isAnalyst={isAnalyst} isAdmin={isAdmin} user={user}
            />
          ))
        )}
      </div>

      {/* Desktop Table View (hidden on small screens) */}
      <div className="hidden sm:block overflow-x-auto rounded-lg border border-border bg-surface">
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
                <DeveloperTableRow
                  key={dev._id} dev={dev}
                  selectedIds={selectedIds} handleSelectRow={handleSelectRow}
                  handleStatusChange={handleStatusChange} handleDelete={handleDelete}
                  isAnalyst={isAnalyst} isAdmin={isAdmin} user={user}
                />
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
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <ImportDeveloperModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        handleImport={handleImport}
        githubUsername={githubUsername}
        setGithubUsername={setGithubUsername}
        isImporting={isImporting}
      />
    </div>
  );
}
