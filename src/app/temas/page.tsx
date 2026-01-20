import { Suspense } from 'react';
import { TemaContent } from '@/components/temas/TemaContent';
import LoadingOverlay from '@/components/ui/loading-overlay';
import { temasClient } from '@/api/temas/client';

export default async function TemasPage() {
  const data = await temasClient.buscarPorFiltro({ page: 0, size: 10 });

  return (
    <div data-ssr="true">
      <Suspense
        fallback={
          <LoadingOverlay
            title="Carregando temas..."
            subtitle="Aguarde enquanto os dados são carregados"
          />
        }
      >
        <TemaContent initialData={data} />
      </Suspense>
    </div>
  );
}
