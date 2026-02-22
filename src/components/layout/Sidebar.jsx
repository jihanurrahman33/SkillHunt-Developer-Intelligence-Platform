'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HiOutlineViewGrid,
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineBriefcase,
  HiOutlineChartBar,
  HiOutlineCog,
} from 'react-icons/hi';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HiOutlineViewGrid },
  { name: 'Developers', href: '/developers', icon: HiOutlineUsers },
  { name: 'Campaigns', href: '/campaigns', icon: HiOutlineBriefcase },
  { name: 'Analytics', href: '/analytics', icon: HiOutlineChartBar },
  { name: 'Users', href: '/users', icon: HiOutlineUserGroup },
];

const bottomNav = [
  { name: 'Settings', href: '/settings', icon: HiOutlineCog },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden w-60 flex-col border-r border-border bg-surface lg:flex">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <span className="text-xs font-bold text-primary-foreground">SH</span>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-foreground">SkillHunt</h1>
          <p className="text-[10px] leading-none text-muted-foreground">IntelliTrack</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {navigation.map((item) => {
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
        {bottomNav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-surface-hover hover:text-foreground"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
