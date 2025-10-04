'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import ProfileButton from './ProfileButton';
import {User as UserType} from '@/types/auth/types';
import authClient from '@/api/auth/client';
import { BellIcon } from '@phosphor-icons/react';
import dashboardClient from '@/api/dashboard/client';
import { useQuery } from '@tanstack/react-query';

interface AppHeaderProps {
  userName?: string;
  userLogin?: string;
  userAvatar?: string;
  perfil?: string;
}

export function AppHeader({ 
  userName = "Usuário", 
  userLogin = "user@email.com",
  userAvatar,
  perfil
}: AppHeaderProps) {
  const user: UserType = {
    name: userName,
    username: userLogin,
    email: userLogin,
    avatar: userAvatar || '/images/avatar.svg',
    perfil: perfil || ''
  };

  const handleLogout = () => {
    authClient.logout();
  };

const [pendenteCountState] = useState<number>(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);


  const handleBellClick = useCallback(async () => {
    setIsPanelOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsPanelOpen(false);
      }
    }
    if (isPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPanelOpen]);

const { data: pendenteCountData } = useQuery<number>({
  queryKey: ['solicitacoesPendentesCount'],
  queryFn: () => dashboardClient.getSolicitacoesPendentesCount(),
  staleTime: 0,
  refetchInterval: 10_000,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  refetchOnMount: 'always',
});

const qtdSolicitacaoPendente = pendenteCountData ?? pendenteCountState;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-[82px] px-6">
        <div className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={120}
            height={40}
            className="h-8 w-auto"
          />
        </div>

        <div className="flex items-center">
          {qtdSolicitacaoPendente > 0 && (
            <div className="relative mr-4" ref={notifRef}>
              <button
                type="button"
                onClick={handleBellClick}
                className="relative p-2 rounded-lg hover:bg-gray-50"
                aria-label="Notificações"
              >
                <BellIcon className="h-6 w-6 text-gray-700" />
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-semibold h-5 min-w-[20px] px-1">
                  {qtdSolicitacaoPendente}
                </span>
              </button>
              {isPanelOpen && (
                <div className="absolute right-0 top-full mt-2 w-max max-w-xs rounded-md border border-gray-200 bg-white shadow-md px-3 py-2 text-sm text-gray-700">
                  {`Você possui ${qtdSolicitacaoPendente} novas solicitações para responder.`}
                </div>
              )}
            </div>
          )}
          <ProfileButton 
            user={user}
            handleLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
} 