'use client';

import Link from 'next/link';
import { PageDef } from '@/constants/pages/pages';

interface SidebarNavItemProps {
  item: PageDef;
  pathname: string;
  isCollapsed: boolean;
}

export function SidebarNavItem({ item, pathname, isCollapsed }: SidebarNavItemProps) {
  const isActive = pathname === item.path || (pathname.startsWith(item.path + '/') && item.path !== '/');
  const Icon = item.icon;

  return (
    <Link
      href={item.path}
      className={`
        flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors
        ${isActive
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
        }
      `}
      title={isCollapsed ? item.label : undefined}
    >
      <Icon
        className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'} ${isCollapsed ? 'mx-auto' : 'mr-3'}`}
      />
      {!isCollapsed && (
        <span className="truncate">{item.label}</span>
      )}
    </Link>
  );
}
