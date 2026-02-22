'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { HiOutlineSearch, HiOutlineBell, HiOutlineMoon, HiOutlineSun } from 'react-icons/hi';

export default function Header() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4">
      {/* Search */}
      <div className="relative w-full max-w-sm">
        <HiOutlineSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search developers, campaigns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border border-border bg-background py-1.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <HiOutlineSun className="h-4 w-4" />
          ) : (
            <HiOutlineMoon className="h-4 w-4" />
          )}
        </button>

        {/* Notifications */}
        <button className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground">
          <HiOutlineBell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>

        {/* User Avatar */}
        <div className="ml-2 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground leading-none">
              {user?.name || 'User'}
            </p>
            <p className="text-[10px] text-muted-foreground capitalize">
              {user?.role || 'recruiter'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
