'use client'

import { AreasProvider } from '@/context/areas/AreasContext';
import { EmailProvider } from '@/context/email/EmailContext';
import { ResponsaveisProvider } from '@/context/responsaveis/ResponsaveisContext';
import { SolicitacoesProvider } from '@/context/solicitacoes/SolicitacoesContext';
import { TemasProvider } from '@/context/temas/TemasContext';
import { ReactNode } from 'react';
import IconProvider from "@/providers/IconProvider";
import {ApiProvider} from "@/api/ApiProvider";

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
                <IconProvider>
                  {children}
                </IconProvider>
              </TemasProvider>
            </SolicitacoesProvider>
          </ResponsaveisProvider>
        </EmailProvider>
      </AreasProvider>
    </ApiProvider>
  );
}