'use client';

import React from 'react';
import Image from 'next/image';
import { User, Avatar } from '@nextui-org/react';

interface AppHeaderProps {
  userName?: string;
  userLogin?: string;
  userAvatar?: string;
}

export function AppHeader({ 
  userName = "Usuário", 
  userLogin = "user@email.com",
  userAvatar 
}: AppHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-[82px] px-6">
        {/* Logo à esquerda */}
        <div className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={120}
            height={40}
            className="h-8 w-auto"
          />
        </div>

        {/* Informações do usuário à direita */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">{userName}</div>
            <div className="text-xs text-gray-500">{userLogin}</div>
          </div>
          <Avatar
            src={userAvatar}
            name={userName}
            size="sm"
            className="flex-shrink-0"
          />
        </div>
      </div>
    </header>
  );
} 