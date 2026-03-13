import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { ResponsaveisContent } from '@/components/responsaveis/ResponsaveisContent';
import { responsaveisClient } from '@/api/responsaveis/client';
import { makeQueryClient } from "@/lib/query-client";
import { responsaveisKeys } from "@/components/responsaveis/hooks/use-responsaveis-query";
import LoadingOverlay from "@/components/ui/loading-overlay";
import { Suspense } from "react";

export default async function ResponsaveisPage() {
  const queryClient = makeQueryClient();
  
  const initialParams = {
    page: 0,
    size: 10,
  };

  await queryClient.prefetchQuery({
    queryKey: responsaveisKeys.list(initialParams),
    queryFn: () => responsaveisClient.buscarPorFiltro(initialParams),
  });

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
        <HydrationBoundary state={dehydrate(queryClient)}>
          <ResponsaveisContent />
        </HydrationBoundary>
      </Suspense>
    </div>
  );
}
