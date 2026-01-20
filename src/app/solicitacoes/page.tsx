'use server';

import { Suspense } from 'react';
import { SolicitacoesContent } from '@/components/solicitacoes/content/SolicitacoesContent';
import LoadingOverlay from '@/components/ui/loading-overlay';
import correspondenciaClient from '@/api/correspondencia/client';
import { PagedResponse } from '@/api/solicitacoes/types';
import { CorrespondenciaResponse } from '@/api/correspondencia/types';

export default async function SolicitacoesPage() {
  let initialData: PagedResponse<CorrespondenciaResponse> | null = null;

  try {
    const response = await correspondenciaClient.buscarPorFiltro({ page: 0, size: 10 });
    
    if (response) {
      initialData = response as PagedResponse<CorrespondenciaResponse>;
    }
  } catch {
    initialData = null;
  }

  return (
    <div data-ssr="true">
      <Suspense
        fallback={
          <LoadingOverlay
            title="Carregando solicitações..."
            subtitle="Aguarde enquanto os dados são carregados"
          />
        }
      >
        <SolicitacoesContent initialData={initialData} />
      </Suspense>
    </div>
  );
}
