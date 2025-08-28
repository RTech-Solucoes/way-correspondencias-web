'use client';

import React from 'react';
import Image from 'next/image';
import { User, Avatar } from '@nextui-org/react';
import ProfileButton from './ProfileButton';
import { User as UserType } from '@/types/auth/types';
import authClient from '@/api/auth/client';

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
  const user: UserType = {
    name: userName,
    username: userLogin,
    email: userLogin,
    avatar: userAvatar || '/images/avatar.svg'
  };

  const handleLogout = () => {
    authClient.logout();
  };

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

        {/* ProfileButton à direita */}
        <div className="flex items-center">
          <ProfileButton 
            user={user}
            handleLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
} 