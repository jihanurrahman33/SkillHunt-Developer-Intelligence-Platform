'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  HiOutlineViewGrid,
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineBriefcase,
  HiOutlineLogout,
} from 'react-icons/hi';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HiOutlineViewGrid },
  { name: 'Developers', href: '/developers', icon: HiOutlineUsers },
  { name: 'Campaigns', href: '/campaigns', icon: HiOutlineBriefcase },
  { name: 'Users', href: '/users', icon: HiOutlineUserGroup, adminOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { signOut } = require('next-auth/react');
  
  const userRole = session?.user?.role;

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden w-60 flex-col border-r border-border bg-surface lg:flex">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <img src="/logo.png" alt="SkillHunt Logo" className="h-8 object-contain" />
        <div>
          <h1 className="text-sm font-semibold text-foreground">SkillHunt</h1>
          <p className="text-[10px] leading-none text-muted-foreground">IntelliTrack</p>
        </div>
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
  );
}
