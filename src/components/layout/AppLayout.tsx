'use client';

import React from 'react';
import {AppHeader} from './AppHeader';
import {AppSidebar} from './AppSidebar';
import {useSidebar} from '@/context/sidebar/SidebarContext';

interface AppLayoutProps {
  children: React.ReactNode;
  userName?: string;
  userLogin?: string;
  userAvatar?: string;
}

export function AppLayout({ 
  children, 
  userName, 
  userLogin, 
  userAvatar 
}: AppLayoutProps) {
  const { sidebarWidth } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader 
        userName={userName}
        userLogin={userLogin}
        userAvatar={userAvatar}
      />

      <AppSidebar />

      <main 
        className="pt-[82px] transition-all duration-300"
        style={{ paddingLeft: `${sidebarWidth}px` }}
      >
        <div className="p-10">
          {children}
        </div>
      </main>
    </div>
  );
} 