'use server';

import { Suspense } from 'react';
import { AreaContent } from '@/components/areas/AreaContent';
import LoadingOverlay from '@/components/ui/loading-overlay';
import { areasClient } from '@/api/areas/client';

export default async function AreasPage() {
  const data = await areasClient.buscarPorFiltro({ page: 0, size: 10 });

  return (
    <div data-ssr="true">
      <Suspense
        fallback={
          <LoadingOverlay
            title="Carregando áreas..."
            subtitle="Aguarde enquanto os dados são carregados"
          />
        }
      >
        <AreaContent initialData={data} />
      </Suspense>
    </div>
  );
}