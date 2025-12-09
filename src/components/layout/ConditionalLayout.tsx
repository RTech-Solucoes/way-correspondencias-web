'use client';

import {usePathname} from 'next/navigation';
import {ReactNode, useEffect, useState} from 'react';
import {AppLayout} from './AppLayout';
import {SidebarProvider} from '@/context/sidebar/SidebarContext';
import {PUBLIC_ROUTES} from "@/constants/pages";
import {User} from "@/types/auth/types";
import authClient from "@/api/auth/client";
import responsaveisClient from "@/api/responsaveis/client";
import anexosClient from "@/api/anexos/client";
import { TipoObjetoAnexo } from "@/api/anexos/type";
import LoadingOverlay from '../ui/loading-overlay';

interface ConditionalLayoutProps {
  children: ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    const loadUserData = async () => {
      if (isPublicRoute) {
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const idFromToken = authClient.getUserIdResponsavelFromToken();
      const userName = authClient.getUserName();
      if (!(idFromToken || userName)) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const [responsavel, avatar] = await Promise.all([
          idFromToken
            ? responsaveisClient.buscarPorId(idFromToken)
            : responsaveisClient.buscarPorNmUsuarioLogin(userName!),
          (async () => {
            const id = idFromToken
              ? idFromToken
              : (await responsaveisClient.buscarPorNmUsuarioLogin(userName!)).idResponsavel;
            return await getResponsavelAvatar(id);
          })()
        ]);
        setUser({
          idResponsavel: responsavel.idResponsavel,
          name: responsavel.nmResponsavel,
          username: responsavel.nmUsuarioLogin,
          email: responsavel.dsEmail,
          perfil: responsavel.nmPerfil,
          avatar: avatar || "/images/avatar.svg"
        });
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();

    const handleAuthTokenRemoved = () => {
      console.log('[ConditionalLayout] Token removido - limpando dados do usuário');
      setUser(null);
    };

    const handleAuthTokenSaved = () => {
      console.log('[ConditionalLayout] Token salvo - recarregando dados do usuário');
      setTimeout(() => {
        loadUserData();
      }, 100);
    };

    window.addEventListener('authTokenRemoved', handleAuthTokenRemoved);
    window.addEventListener('authTokenSaved', handleAuthTokenSaved);

    return () => {
      window.removeEventListener('authTokenRemoved', handleAuthTokenRemoved);
      window.removeEventListener('authTokenSaved', handleAuthTokenSaved);
    };
  }, [isPublicRoute]);

  if (isPublicRoute) {
    return (
      <main className="flex flex-col min-h-screen bg-gray-50">
        {children}
      </main>
    );
  }

  if (loading) {
    return (
      <LoadingOverlay
        title="Carregando dados do usuário"
        subtitle="Aguarde enquanto o processo é concluído"
      />
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

async function getResponsavelAvatar(idResponsavel: number): Promise<string | null> {
  try {
    const anexos = await anexosClient.buscarPorIdObjetoETipoObjeto(idResponsavel, TipoObjetoAnexo.R);
    const byExt = anexos.find(a => /(\.jpg|jpeg|png)$/i.test(a.nmArquivo));
    const chosen = byExt || anexos[0];
    if (!chosen) return null;
    const arquivos = await anexosClient.download(idResponsavel, TipoObjetoAnexo.R, chosen.nmArquivo);
    const first = arquivos?.find(a => (a.tipoConteudo?.startsWith('image/') ?? /(\.jpg|jpeg|png)$/i.test(a.nomeArquivo || '')));
    if (!first?.conteudoArquivo) return null;
    const lower = (chosen.nmArquivo || '').toLowerCase();
    const extMime = lower.endsWith('.png') ? 'image/png' : (/\.jpe?g$/.test(lower) ? 'image/jpeg' : undefined);
    const mime = first.tipoConteudo || extMime || 'image/*';
    return `data:${mime};base64,${first.conteudoArquivo}`;
  } catch {
    return null;
  }
}
