'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Quantum as Loading } from 'ldrs/react';
import 'ldrs/react/Quantum.css';
import { PUBLIC_ROUTES } from '@/constants/pages';
import { canAccessRoute, parsePermissoesCookie } from '@/constants/pages/route-access';
import { getLayoutClient } from '@/lib/layout/layout-client';
import authClient from '@/api/auth/client';
import { toast } from 'sonner';
import { getCookie, removeCookie } from '@/utils/cookies';
import { migrateLocalStorageToCookies } from '@/utils/migrate-storage';
import { usePermissoesStore } from '@/stores/permissoes-store';
import NotFoundView from '@/components/ui/not-found-view';

const FIRST_ROUTES = [
  '/dashboard-correspondencia',
  '/solicitacoes',
  '/email',
  '/areas',
  '/temas',
  '/responsaveis',
  '/concessionarias',
] as const;

function resolvePermissoes(): string[] {
  const fromStore = usePermissoesStore.getState().permissoes;
  if (fromStore.length > 0) return fromStore;
  return parsePermissoesCookie(getCookie('permissoes-storage'));
}

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const [isDenied, setIsDenied] = useState(false);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    migrateLocalStorageToCookies();

    let cancelled = false;

    const finish = (denied = false) => {
      if (cancelled) return;
      setIsDenied(denied);
      setIsReady(true);
    };

    const waitForHydration = () =>
      new Promise<void>((resolve) => {
        const persistApi = usePermissoesStore.persist;
        if (persistApi.hasHydrated()) {
          resolve();
          return;
        }
        const unsub = persistApi.onFinishHydration(() => {
          unsub();
          resolve();
        });
      });

    const checkAuth = async () => {
      setIsReady(false);
      setIsDenied(false);

      await waitForHydration();
      if (cancelled) return;

      const authToken = getCookie('authToken');

      if (authToken) {
        const idsConcessionarias = authClient.getIdsConcessionariasFromToken();

        if (!idsConcessionarias || idsConcessionarias.length === 0) {
          removeCookie('authToken');
          removeCookie('tokenType');
          removeCookie('userName');
          removeCookie('permissoes-storage');
          removeCookie('concessionaria-selecionada');

          toast.error(
            'Seu usuário não possui concessionárias associadas. Entre em contato com o administrador do sistema.',
          );
          router.replace('/');
          finish(false);
          return;
        }

        const permissoes = resolvePermissoes();

        if (isPublicRoute) {
          const firstRoute =
            FIRST_ROUTES.find((route) =>
              canAccessRoute(route, permissoes, getLayoutClient()),
            ) || '/dashboard-correspondencia';
          router.replace(firstRoute);
          finish(false);
          return;
        }

        if (!canAccessRoute(pathname, permissoes, getLayoutClient())) {
          finish(true);
          return;
        }
      } else if (!isPublicRoute) {
        router.replace('/');
        finish(false);
        return;
      }

      finish(false);
    };

    void checkAuth();

    const handleAuthTokenRemoved = () => {
      void checkAuth();
    };

    window.addEventListener('authTokenRemoved', handleAuthTokenRemoved);

    return () => {
      cancelled = true;
      window.removeEventListener('authTokenRemoved', handleAuthTokenRemoved);
    };
  }, [pathname, router, isPublicRoute]);

  if (!isReady) {
    return (
      <div className="fixed z-[9999] top-0 left-0 bg-background min-h-screen min-w-screen flex items-center justify-center">
        <Loading size="120" speed="1.5" color="#155dfc" />
      </div>
    );
  }

  if (isDenied) {
    return <NotFoundView />;
  }

  return <>{children}</>;
}
