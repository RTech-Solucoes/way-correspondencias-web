import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { ObrigacoesContent } from "@/components/obrigacoes/list-page/ObrigacoesContent";
import obrigacaoClient from "@/api/obrigacao/client";
import { makeQueryClient } from "@/lib/query-client";
import { obrigacoesKeys } from "@/components/obrigacoes/hooks/use-obrigacoes-query";
import LoadingOverlay from "@/components/ui/loading-overlay";
import { Suspense } from "react";

export default async function ObrigacoesPage() {
  const queryClient = makeQueryClient();
  
  const initialParams = {
    page: 0,
    size: 10,
  };

  await queryClient.prefetchQuery({
    queryKey: obrigacoesKeys.list(initialParams),
    queryFn: () => obrigacaoClient.buscarLista(initialParams),
  });

  return (
    <div data-ssr="true">
      <Suspense
        fallback={
          <LoadingOverlay
            title="Carregando obrigações..."
            subtitle="Aguarde enquanto os dados são carregados"
          />
        }
      >
        <HydrationBoundary state={dehydrate(queryClient)}>
          <ObrigacoesContent />
        </HydrationBoundary>
      </Suspense>
    </div>
  );
}
