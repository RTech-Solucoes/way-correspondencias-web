'use client'

import {ComponentType, ReactNode, useEffect} from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {AreasProvider} from '@/context/areas/AreasContext';
import {EmailProvider} from '@/context/email/EmailContext';
import {ResponsaveisProvider} from '@/context/responsaveis/ResponsaveisContext';
import {SolicitacoesProvider} from '@/context/solicitacoes/SolicitacoesContext';
import {TemasProvider} from '@/context/temas/TemasContext';
import {ObrigacoesProvider} from '@/context/obrigacoes/ObrigacoesContext';
import {ApiProvider} from "@/providers/ApiProvider";
import IconProvider from "@/providers/IconProvider";
import {PermissoesProvider} from "@/context/permissoes/PermissoesContext";
import {ConcessionariaProvider} from "@/context/concessionaria/ConcessionariaContext";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function clearQueryCache() {
  queryClient.clear();
}

interface ProvidersProps {
  children: ReactNode;
}

function ComposeProviders({ 
  providers, 
  children 
}: { 
  providers: Array<ComponentType<{ children: ReactNode }>>;
  children: ReactNode;
}) {
  return providers.reduceRight(
    (acc, Provider) => <Provider>{acc}</Provider>,
    children
  );
}

export default function Providers({children}: ProvidersProps) {
  useEffect(() => {
    const handleAuthTokenRemoved = () => {
      clearQueryCache();
    };

    const handleAuthTokenSaved = () => {
      clearQueryCache();
    };

    const handleConcessionariaChanged = () => {
      console.log('[Providers] Concessionária mudou - limpando cache do React Query');
      clearQueryCache();
    };

    window.addEventListener('authTokenRemoved', handleAuthTokenRemoved);
    window.addEventListener('authTokenSaved', handleAuthTokenSaved);
    window.addEventListener('concessionariaChanged', handleConcessionariaChanged);

    return () => {
      window.removeEventListener('authTokenRemoved', handleAuthTokenRemoved);
      window.removeEventListener('authTokenSaved', handleAuthTokenSaved);
      window.removeEventListener('concessionariaChanged', handleConcessionariaChanged);
    };
  }, []);

  const providers = [
    IconProvider,
    TemasProvider,
    ObrigacoesProvider,
    SolicitacoesProvider,
    ResponsaveisProvider,
    EmailProvider,
    AreasProvider,
    ConcessionariaProvider,
    PermissoesProvider,
    ApiProvider,
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <ComposeProviders providers={providers}>
        {children}
      </ComposeProviders>
    </QueryClientProvider>
  );
}