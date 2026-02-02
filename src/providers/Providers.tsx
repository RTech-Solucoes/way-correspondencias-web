'use client'

import {ComponentType, ReactNode, useEffect, useState} from 'react';
import {QueryClientProvider} from '@tanstack/react-query';
import {AreasProvider} from '@/context/areas/AreasContext';
import {EmailProvider} from '@/context/email/EmailContext';
import {ResponsaveisProvider} from '@/context/responsaveis/ResponsaveisContext';
import { SolicitacoesProvider } from '@/context/solicitacoes/SolicitacoesContext';
import {TemasProvider} from '@/context/temas/TemasContext';
import {ApiProvider} from "@/providers/ApiProvider";
import IconProvider from "@/providers/IconProvider";
import {PermissoesProvider} from "@/context/permissoes/PermissoesContext";
import {ConcessionariaProvider} from "@/context/concessionaria/ConcessionariaContext";
import {makeQueryClient} from '@/lib/query-client';

let queryClientInstance: ReturnType<typeof makeQueryClient> | null = null;

export function clearQueryCache() {
  if (queryClientInstance) {
    queryClientInstance.clear();
  }
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
  // Cria instância única do Query Client (mesma lógica do SSR)
  const [queryClient] = useState(() => {
    const client = makeQueryClient();
    queryClientInstance = client;
    return client;
  });

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