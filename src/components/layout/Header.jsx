'use client';

import { useAuth } from '@/features/auth/context/AuthContext';
import { useTheme } from '@/providers/ThemeContext';
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi';

export default function Header() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4">
      {/* Empty Left Section to maintain spacing for the Right Section */}
      <div className="flex-1"></div>

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
