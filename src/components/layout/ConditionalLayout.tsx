'use client';

import {usePathname} from 'next/navigation';
import {ReactNode, useEffect, useState} from 'react';
import {AppLayout} from './AppLayout';
import {SidebarProvider} from '@/context/sidebar/SidebarContext';
import {PUBLIC_ROUTES} from "@/constants/pages";
import {User} from "@/types/auth/types";
import authClient from "@/api/auth/client";
import responsaveisClient from "@/api/responsaveis/client";

interface ConditionalLayoutProps {
  children: ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(false);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (!isPublicRoute) {
      const loadUserData = async () => {
        const userName = authClient.getUserName();
        if (userName) {
          setLoadingUser(true);
          try {
            const responsavel = await responsaveisClient.buscarPorNmUsuarioLogin(userName);
            setUser({
              name: responsavel.nmResponsavel,
              username: responsavel.nmUsuarioLogin,
              email: responsavel.dsEmail,
              avatar: "/images/avatar.svg"
            });
          } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error);
          } finally {
            setLoadingUser(false);
          }
        }
      };

      loadUserData();
    }
  }, [isPublicRoute]);

  if (isPublicRoute) {
    return (
      <main className="flex flex-col min-h-screen bg-gray-50">
        {children}
      </main>
    );
  }

  return (
    <SidebarProvider>
      <AppLayout 
        userName={user?.name}
        userLogin={user?.email}
        userAvatar={user?.avatar}
      >
        {children}
      </AppLayout>
    </SidebarProvider>
  );
}
