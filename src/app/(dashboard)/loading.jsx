import { HiOutlineRefresh } from 'react-icons/hi';

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
      <div className="flex flex-col items-center justify-center space-y-4 text-muted-foreground">
        <HiOutlineRefresh className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium animate-pulse">Loading dashboard content...</p>
      </div>
    </div>
  );
}
