'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  EnvelopeIcon, 
  DocumentTextIcon, 
  UsersIcon, 
  TagIcon, 
  MapIcon,
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useSidebar } from '@/context/sidebar/SidebarContext';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
  { name: 'Caixa de entrada', href: '/email', icon: EnvelopeIcon },
  { name: 'Solicitações', href: '/solicitacoes', icon: DocumentTextIcon },
  { name: 'Temas', href: '/temas', icon: TagIcon },
  { name: 'Áreas', href: '/areas', icon: MapIcon },
  { name: 'Responsáveis', href: '/responsaveis', icon: UsersIcon },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar, sidebarWidth } = useSidebar();

  return (
    <aside 
      className="fixed left-0 top-[82px] bottom-0 bg-white border-r border-gray-200 overflow-y-auto z-40 transition-all duration-300 flex flex-col"
      style={{ width: `${sidebarWidth}px` }}
    >
      <nav className="p-4 space-y-2 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-400'} ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!isCollapsed && (
                <span className="truncate">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Botão de toggle no final da sidebar */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          title={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeftIcon className="h-5 w-5 mr-2" />
              <span className="text-sm">Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
} 