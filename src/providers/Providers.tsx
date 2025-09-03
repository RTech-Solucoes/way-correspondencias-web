'use client'

import {ReactNode} from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {AreasProvider} from '@/context/areas/AreasContext';
import {EmailProvider} from '@/context/email/EmailContext';
import {ResponsaveisProvider} from '@/context/responsaveis/ResponsaveisContext';
import {SolicitacoesProvider} from '@/context/solicitacoes/SolicitacoesContext';
import {TemasProvider} from '@/context/temas/TemasContext';
import {ApiProvider} from "@/providers/ApiProvider";
import IconProvider from "@/providers/IconProvider";
import {PermissoesProvider} from "@/context/permissoes/PermissoesContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({children}: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider>
        <PermissoesProvider>
          <AreasProvider>
            <EmailProvider>
              <ResponsaveisProvider>
                <SolicitacoesProvider>
                  <TemasProvider>
                    <IconProvider>
                      {children}
                    </IconProvider>
                  </TemasProvider>
                </SolicitacoesProvider>
              </ResponsaveisProvider>
            </EmailProvider>
          </AreasProvider>
        </PermissoesProvider>
      </ApiProvider>
    </QueryClientProvider>
  );
}