'use client';

import {usePathname} from 'next/navigation';
import {ReactNode, useCallback, useEffect, useState} from 'react';
import {AppLayout} from './AppLayout';
import {SidebarProvider} from '@/context/sidebar/SidebarContext';
import {PUBLIC_ROUTES} from "@/constants/pages";
import {User} from "@/types/auth/types";
import authClient from "@/api/auth/client";
import responsaveisClient from "@/api/responsaveis/client";
import anexosClient from "@/api/anexos/client";
import { TipoObjetoAnexoEnum } from "@/api/anexos/type";

const CONCESSIONARIA_CHECK_INTERVAL = 100; // ms
const CONCESSIONARIA_TIMEOUT = 3000; // ms
const INITIAL_LOAD_DELAY = 100; // ms
const AUTH_TOKEN_SAVED_DELAY = 200; // ms

interface ConditionalLayoutProps {
  children: ReactNode;
}

const waitForConcessionaria = (): Promise<void> => {
  return new Promise((resolve) => {
    const checkConcessionaria = () => {
      const concessionaria = localStorage.getItem('concessionaria-selecionada');
      if (concessionaria) {
        resolve();
      } else {
        setTimeout(checkConcessionaria, CONCESSIONARIA_CHECK_INTERVAL);
      }
    };
    checkConcessionaria();
  });
};

const createTimeout = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const getResponsavelAvatar = async (idResponsavel: number): Promise<string | null> => {
  try {
    const anexos = await anexosClient.buscarPorIdObjetoETipoObjeto(idResponsavel, TipoObjetoAnexoEnum.R);
    const byExt = anexos.find(a => /(\.jpg|jpeg|png)$/i.test(a.nmArquivo));
    const chosen = byExt || anexos[0];
    if (!chosen) return null;
    
    const arquivos = await anexosClient.download(idResponsavel, TipoObjetoAnexoEnum.R, chosen.nmArquivo);
    const first = arquivos?.find(a => (a.tipoConteudo?.startsWith('image/') ?? /(\.jpg|jpeg|png)$/i.test(a.nomeArquivo || '')));
    if (!first?.conteudoArquivo) return null;
    
    const lower = (chosen.nmArquivo || '').toLowerCase();
    const extMime = lower.endsWith('.png') ? 'image/png' : (/\.jpe?g$/.test(lower) ? 'image/jpeg' : undefined);
    const mime = first.tipoConteudo || extMime || 'image/*';
    return `data:${mime};base64,${first.conteudoArquivo}`;
  } catch (error) {
    console.error('[ConditionalLayout] Erro ao carregar avatar:', error);
    return null;
  }
};

const createBasicUser = (idFromToken: number | null, userName: string | null): User => ({
  idResponsavel: idFromToken || 0,
  name: userName || 'Usuário',
  username: userName || '',
  email: userName || '',
  perfil: 'Carregando...',
  avatar: '/images/avatar.svg'
});

const createFallbackUser = (idFromToken: number | null, userName: string | null): User => ({
  idResponsavel: idFromToken || 0,
  name: userName || 'Usuário',
  username: userName || '',
  email: userName || '',
  perfil: 'Sem perfil',
  avatar: '/images/avatar.svg'
});

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  const loadUserData = useCallback(async () => {
    if (isPublicRoute) {
      setUser(null);
      return;
    }

    if (!authClient.isAuthenticated()) {
      setUser(null);
      return;
    }

    try {
      const idFromToken = authClient.getUserIdResponsavelFromToken();
      const userName = authClient.getUserName();
      
      if (!(idFromToken || userName)) {
        setUser(null);
        return;
      }

      const userBasico = createBasicUser(idFromToken, userName);
      setUser(userBasico);

      await Promise.race([
        waitForConcessionaria(),
        createTimeout(CONCESSIONARIA_TIMEOUT)
      ]);

      try {
        const responsavel = idFromToken
          ? await responsaveisClient.buscarPorId(idFromToken)
          : await responsaveisClient.buscarPorNmUsuarioLogin(userName!);
        
        const userData: User = {
          idResponsavel: responsavel.idResponsavel,
          name: responsavel.nmResponsavel,
          username: responsavel.nmUsuarioLogin,
          email: responsavel.dsEmail,
          perfil: responsavel.nmPerfil,
          avatar: '/images/avatar.svg'
        };
        
        setUser(userData);
        
        getResponsavelAvatar(responsavel.idResponsavel)
          .then(avatar => {
            if (avatar) {
              setUser(prev => prev ? { ...prev, avatar } : null);
            }
          })
          .catch((err) => {
            console.warn('[ConditionalLayout] Erro ao carregar avatar:', err?.message || err);
          });
        
      } catch (error) {
        
        const apiError = error as { status?: number; message?: string };
        
        if (apiError?.status === 401) {
          authClient.logout();
          window.location.href = '/';
          return;
        }
        
        setUser(createFallbackUser(idFromToken, userName));
      }
    } catch (error) {
      console.error('[ConditionalLayout] Erro ao processar token:', error);
      setUser(null);
    }
  }, [isPublicRoute]);

  useEffect(() => {
    let isMounted = true;

    const initTimeout = setTimeout(() => {
      if (isMounted) loadUserData();
    }, INITIAL_LOAD_DELAY);

    const handleAuthTokenRemoved = () => {
      if (!isMounted) return;
      console.log('[ConditionalLayout] Token removido');
      setUser(null);
    };

    const handleAuthTokenSaved = () => {
      if (!isMounted) return;
      console.log('[ConditionalLayout] Token salvo, recarregando dados...');
      setUser(null);
      
      setTimeout(() => {
        if (isMounted) loadUserData();
      }, AUTH_TOKEN_SAVED_DELAY);
    };

    window.addEventListener('authTokenRemoved', handleAuthTokenRemoved);
    window.addEventListener('authTokenSaved', handleAuthTokenSaved);

    return () => {
      isMounted = false;
      clearTimeout(initTimeout);
      window.removeEventListener('authTokenRemoved', handleAuthTokenRemoved);
      window.removeEventListener('authTokenSaved', handleAuthTokenSaved);
    };
  }, [isPublicRoute, loadUserData]);

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
        perfil={user?.perfil}
      >
        {children}
      </AppLayout>
    </SidebarProvider>
  );
}

