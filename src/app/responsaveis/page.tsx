'use server';

import { Suspense } from 'react';
import { ResponsaveisContent } from '@/components/responsaveis/ResponsaveisContent';
import LoadingOverlay from '@/components/ui/loading-overlay';
import { responsaveisClient } from '@/api/responsaveis/client';

export default async function ResponsaveisPage() {
  const data = await responsaveisClient.buscarPorFiltro({ page: 0, size: 10 });

  return (
    <div data-ssr="true">
      <Suspense
        fallback={
          <LoadingOverlay
            title="Carregando responsáveis..."
            subtitle="Aguarde enquanto os dados são carregados"
          />
        }
      >
        <ResponsaveisContent initialData={data} />
      </Suspense>
    </div>
  );
}
