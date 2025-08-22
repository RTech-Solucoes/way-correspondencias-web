'use client'

import { ReactNode } from 'react';
import { AreasProvider } from '@/context/areas/AreasContext';
import { EmailProvider } from '@/context/email/EmailContext';
import { ResponsaveisProvider } from '@/context/responsaveis/ResponsaveisContext';
import { SolicitacoesProvider } from '@/context/solicitacoes/SolicitacoesContext';
import { TemasProvider } from '@/context/temas/TemasContext';
import { TramitacaoProvider } from '@/context/tramitacao/TramitacaoContext';
import {ApiProvider} from "@/api/ApiProvider";
import IconProvider from "@/providers/IconProvider";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({children}: ProvidersProps) {
  return (
    <ApiProvider>
      <AreasProvider>
        <EmailProvider>
          <ResponsaveisProvider>
            <SolicitacoesProvider>
              <TemasProvider>
                <TramitacaoProvider>
                  <IconProvider>
                    {children}
                  </IconProvider>
                </TramitacaoProvider>
              </TemasProvider>
            </SolicitacoesProvider>
          </ResponsaveisProvider>
        </EmailProvider>
      </AreasProvider>
    </ApiProvider>
  );
}