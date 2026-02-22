'use client';

import { useState } from 'react';
import { useDeveloperContext } from '@/features/developers/context/DeveloperContext';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/modals/Modal';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { 
  HiOutlineSearch, 
  HiOutlinePlus, 
  HiOutlineLocationMarker,
  HiOutlineCode,
  HiOutlineExternalLink
} from 'react-icons/hi';
import { FaGithub } from 'react-icons/fa';

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
    page, setPage,
    importDeveloper,
    changeStatus,
  } = useDeveloperContext();

  // Ingest Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async (e) => {
    e.preventDefault();
    if (!githubUsername.trim()) return;

    setIsImporting(true);
    const res = await importDeveloper(githubUsername.trim());
    setIsImporting(false);

    if (res.success) {
      setIsModalOpen(false);
      setGithubUsername('');
      Swal.fire({
        icon: 'success',
        title: 'Developer Imported',
        text: `${githubUsername} has been added to the database.`,
        timer: 2000,
        showConfirmButton: false,
        background: '#0B1220',
        color: '#e2e8f0',
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Import Failed',
        text: res.error,
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
        <Button 
          onClick={() => setIsModalOpen(true)}
          icon={<HiOutlinePlus className="h-4 w-4" />}
        >
          Import from GitHub
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          placeholder="Tech Stack (e.g. React, Node)"
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
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-left text-sm text-foreground">
          <thead className="border-b border-border bg-secondary/50 text-xs uppercase text-muted-foreground">
            <tr>
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
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No developers found. Try changing your filters or import a new one.
                </td>
              </tr>
            ) : (
              developers.map((dev) => (
                <tr key={dev._id} className="transition-colors hover:bg-surface-hover group">
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
                      className={`
                        text-xs font-medium rounded-full px-2 py-1 outline-none cursor-pointer border
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
                    <Link 
                      href={`/developers/${dev._id}`}
                      className="inline-flex items-center justify-center rounded p-1.5 text-muted-foreground hover:bg-surface hover:text-primary transition-colors border border-transparent hover:border-border"
                      title="View Profile"
                    >
                      <HiOutlineExternalLink className="h-4 w-4" />
                    </Link>
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
          <p className="text-sm text-muted-foreground">
            Enter a GitHub username to automatically fetch their profile, calculate their activity score, and add them to your talent pool.
          </p>
          
          <Input
            label="GitHub Username"
            placeholder="e.g. torvalds"
            icon={<FaGithub className="h-4 w-4" />}
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            disabled={isImporting}
            required
            autoFocus
          />
          
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
