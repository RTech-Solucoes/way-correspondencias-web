import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import concessionariaClient from '@/api/concessionaria/client';
import { ConcessionariasContent } from '@/components/concessionarias/ConcessionariasContent';
import { concessionariasKeys } from '@/components/concessionarias/hooks/use-concessionarias-query';
import LoadingOverlay from '@/components/ui/loading-overlay';
import { makeQueryClient } from '@/lib/query-client';
import { getLayoutClient } from '@/lib/layout/layout-client';
import { ClienteEnum } from '@/lib/layout/layout-client.enum';

export default async function ConcessionariasPage() {
  if (getLayoutClient() !== ClienteEnum.RTECH) {
    notFound();
  }

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
