'use client';

import authClient from '@/api/auth/client';
import dashboardClient from '@/api/dashboard/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConcessionaria } from '@/context/concessionaria/ConcessionariaContext';
import { User as UserType } from '@/types/auth/types';
import { BellIcon, BuildingIcon, RoadHorizonIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import ProfileButton from './ProfileButton';


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
  const { concessionariaSelecionada, concessionarias, loading: loadingConcessionaria, setConcessionariaSelecionada } = useConcessionaria();
  
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
  
const layoutClient = process.env.NEXT_PUBLIC_LAYOUT_CLIENT || "way262";

const qtdSolicitacaoPendente = pendenteCountData ?? pendenteCountState;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-[82px] px-6">
        <div className="flex items-center gap-6">
          <Image
            src={`/images/${layoutClient}-logo.png`}
            alt="Logo"
            width={120}
            height={40}
            className="h-8 w-auto"
          />
          {!loadingConcessionaria && concessionarias.length > 0 && (
            <>
              {concessionarias.length > 1 ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <BuildingIcon className="h-5 w-5 text-[#276EEB]" weight="fill" />
                    <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Concessionária:</span>
                  </div>
                  <Select
                    value={concessionariaSelecionada?.idConcessionaria.toString() || ''}
                    onValueChange={(value) => {
                      const concessionaria = concessionarias.find(c => c.idConcessionaria.toString() === value);
                      if (concessionaria && concessionaria.idConcessionaria !== concessionariaSelecionada?.idConcessionaria) {
                        setConcessionariaSelecionada(concessionaria);
                        window.location.reload();
                      }
                    }}
                  >
                    <SelectTrigger className="w-[200px] h-10 border-2 border-[#276EEB]/20 bg-gradient-to-r from-blue-50 to-white hover:border-[#276EEB]/40 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-50 shadow-md transition-all duration-200 focus:ring-2 focus:ring-[#276EEB]/30 focus:border-[#276EEB]">
                      {concessionariaSelecionada ? (
                        <div className="flex items-center gap-2 flex-1">
                          <RoadHorizonIcon className="h-4 w-4 text-[#276EEB] flex-shrink-0" weight="fill" />
                          <span className="text-sm text-[#276EEB] font-medium">{concessionariaSelecionada.nmConcessionaria}</span>
                        </div>
                      ) : (
                        <>
                          <RoadHorizonIcon className="h-4 w-4 text-[#276EEB] mr-2 flex-shrink-0" weight="fill" />
                          <SelectValue placeholder="Selecione a concessionária" className="flex-1" />
                        </>
                      )}
                    </SelectTrigger>
                    <SelectContent className="min-w-[200px]">
                      {concessionarias.map((concessionaria) => (
                        <SelectItem 
                          key={concessionaria.idConcessionaria} 
                          value={concessionaria.idConcessionaria.toString()}
                          className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
                        >
                          <div className="flex items-center gap-2">
                            <RoadHorizonIcon className="h-4 w-4 text-[#276EEB]" weight={concessionaria.idConcessionaria === concessionariaSelecionada?.idConcessionaria ? "fill" : "regular"} />
                            <span className={concessionaria.idConcessionaria === concessionariaSelecionada?.idConcessionaria ? "font-semibold text-[#276EEB]" : ""}>
                              {concessionaria.nmConcessionaria}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                concessionariaSelecionada && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <BuildingIcon className="h-5 w-5 text-[#276EEB]" weight="fill" />
                      <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Concessionária:</span>
                    </div>
                    <div className="flex items-center gap-2 h-10 px-4 py-2 rounded-lg border-2 border-[#276EEB]/20 bg-gradient-to-r from-blue-50 to-white shadow-md">
                      <RoadHorizonIcon className="h-4 w-4 text-[#276EEB]" weight="fill" />
                      <span className="text-sm text-[#276EEB] font-semibold">{concessionariaSelecionada.nmConcessionaria}</span>
                    </div>
                  </div>
                )
              )}
            </>
          )}
        </div>

        <div className="flex items-center">
          <div className="relative mr-4" ref={notifRef}>
            <button
              type="button"
              onClick={handleBellClick}
              className="relative p-2 rounded-lg hover:bg-gray-50"
              aria-label="Notificações"
            >
              <BellIcon className="h-6 w-6 text-gray-700" />
                {qtdSolicitacaoPendente > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-semibold h-5 min-w-[20px] px-1">
                    {qtdSolicitacaoPendente}
                  </span>
              )}
            </button>
            {isPanelOpen && (
              <div className="absolute right-0 top-full mt-2 w-max max-w-xs rounded-md border border-gray-200 bg-white shadow-md px-3 py-2 text-sm text-gray-700">
                {`Você possui ${qtdSolicitacaoPendente} novas solicitações para responder.`}
              </div>
            )}
          </div>
          <ProfileButton 
            user={user}
            handleLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
} 