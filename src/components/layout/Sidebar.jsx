'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  HiOutlineViewGrid,
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineBriefcase,
  HiOutlineLogout,
  HiOutlineX,
} from 'react-icons/hi';
import { useUI } from '@/providers/UIContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HiOutlineViewGrid },
  { name: 'Developers', href: '/developers', icon: HiOutlineUsers },
  { name: 'Campaigns', href: '/campaigns', icon: HiOutlineBriefcase },
  { name: 'Users', href: '/users', icon: HiOutlineUserGroup, adminOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isSidebarOpen, closeSidebar } = useUI();
  
  const userRole = session?.user?.role;

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-300 ease-in-out lg:static lg:w-60 lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo & Close Button */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="SkillHunt Logo" className="h-8 object-contain" />
            <div>
              <h1 className="text-sm font-semibold text-foreground leading-none">SkillHunt</h1>
              <p className="text-[10px] leading-none text-muted-foreground mt-0.5">IntelliTrack</p>
            </div>
          </div>
          
          {/* Mobile Close Button */}
          <button
            onClick={closeSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground lg:hidden"
          >
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-0.5 px-2 py-3">
          {navigation
            .filter(item => !item.adminOnly || userRole === 'admin' || userRole === 'owner')
            .map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium
                    transition-colors duration-150
                    ${active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-border px-2 py-3">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-surface-hover hover:text-foreground text-left"
          >
            <HiOutlineLogout className="h-4 w-4 shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
