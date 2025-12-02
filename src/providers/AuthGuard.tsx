'use client';

import {ReactNode, useEffect, useState} from 'react';
import {usePathname, useRouter} from 'next/navigation';

import {Quantum as Loading} from 'ldrs/react'
import 'ldrs/react/Quantum.css'
import {PUBLIC_ROUTES} from "@/constants/pages";
import {usePermittedRoutes} from "@/hooks/use-permitted-routes";
import authClient from "@/api/auth/client";
import { toast } from 'sonner';

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const permittedRoutes = usePermittedRoutes()

  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('authToken');

      if (authToken) {
        // Validar se o usuário tem concessionárias associadas (apenas para rotas protegidas)
        if (!isPublicRoute) {
          const idsConcessionarias = authClient.getIdsConcessionariasFromToken();
          
          if (!idsConcessionarias || idsConcessionarias.length === 0) {
            // Remover token e limpar dados
            localStorage.removeItem('authToken');
            localStorage.removeItem('tokenType');
            localStorage.removeItem('userName');
            localStorage.removeItem('permissoes-storage');
            localStorage.removeItem('concessionaria-selecionada');
            sessionStorage.removeItem('permissoes-storage');
            
            toast.error("Seu usuário não possui concessionárias associadas. Entre em contato com o administrador do sistema.");
            router.push('/');
            setIsLoading(false);
            return;
          }
        }
        
        if (isPublicRoute) {
          if (permittedRoutes.length > 0) {
            router.push(permittedRoutes[0]);
            return;
          }
        }

        const isPermittedRoute = permittedRoutes.some(route =>
          pathname === route || pathname.startsWith(route + '/')
        );

        if (!isPermittedRoute) {
          if (permittedRoutes.length > 0) {
            router.push(permittedRoutes[0]);
            return;
          }
        }
      } else {
        if (!isPublicRoute) {
          router.push('/');
          return;
        }
      }

      setIsLoading(false);
    };

    const authToken = localStorage.getItem('authToken');
    if (authToken && permittedRoutes.length === 0) {
      return;
    }

    checkAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname, router, isPublicRoute, permittedRoutes]);

  return (
    <>
      {children}
      {isLoading &&
        <div className="fixed z-9999 top-0 left-0 bg-background min-h-screen min-w-screen flex items-center justify-center">
          <Loading
            size="120"
            speed="1.5"
            color="#155dfc"
          />
        </div>
      }
    </>
  );
}
