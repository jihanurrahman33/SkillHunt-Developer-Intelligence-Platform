import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { HiOutlineSearch, HiOutlineCode, HiOutlineLocationMarker } from 'react-icons/hi';

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

export default function DeveloperFilters({ 
  search, setSearch, 
  techStack, setTechStack, 
  location, setLocation, 
  status, setStatus, 
  sortBy, setSortBy, 
  sortOrder, setSortOrder, 
  showFilters, setPage 
}) {
  return (
    <div className={`mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 ${showFilters ? 'grid' : 'hidden lg:grid'}`}>
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
        options={[...STATUS_OPTIONS]}
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
  );
}
