import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { SolicitacoesContent } from '@/components/solicitacoes/content/SolicitacoesContent';
import correspondenciaClient from '@/api/correspondencia/client';
import { makeQueryClient } from "@/lib/query-client";
import { solicitacoesKeys } from "@/components/solicitacoes/hooks/use-solicitacoes-query";
import LoadingOverlay from "@/components/ui/loading-overlay";
import { Suspense } from "react";

// import { getPeriodoConcessao } from "@/utils/concession-period";

export default async function SolicitacoesPage() {
  const queryClient = makeQueryClient();
  

  // const { dtInicio, dtFim } = await getPeriodoConcessao();

  const initialParams = {
    page: 0,
    size: 10,
    // dtCriacaoInicio: dtInicio ?? undefined,
    // dtCriacaoFim: dtFim ?? undefined,
  };

  await queryClient.prefetchQuery({
    queryKey: solicitacoesKeys.list(initialParams),
    queryFn: () => correspondenciaClient.buscarPorFiltro(initialParams),
  });

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
        <HydrationBoundary state={dehydrate(queryClient)}>
          {/* <SolicitacoesContent defaultFilters={initialParams} /> */}
          <SolicitacoesContent defaultFilters={initialParams} />
        </HydrationBoundary>
      </Suspense>
    </div>
  );
}
