import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import concessionariaClient from '@/api/concessionaria/client';
import { ConcessionariasContent } from '@/components/concessionarias/ConcessionariasContent';
import { concessionariasKeys } from '@/components/concessionarias/hooks/use-concessionarias-query';
import LoadingOverlay from '@/components/ui/loading-overlay';
import { makeQueryClient } from '@/lib/query-client';

export default async function ConcessionariasPage() {
  const queryClient = makeQueryClient();
  const initialParams = {
    page: 0,
    size: 10,
  };

  await queryClient.prefetchQuery({
    queryKey: concessionariasKeys.list(initialParams),
    queryFn: () => concessionariaClient.buscarParaAdministracao(initialParams),
  });

  return (
    <div data-ssr="true">
      <Suspense
        fallback={
          <LoadingOverlay
            title="Carregando concessionárias..."
            subtitle="Aguarde enquanto os dados sao carregados"
          />
        }
      >
        <HydrationBoundary state={dehydrate(queryClient)}>
          <ConcessionariasContent />
        </HydrationBoundary>
      </Suspense>
    </div>
  );
}
