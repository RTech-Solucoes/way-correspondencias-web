import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { AreaContent } from '@/components/areas/AreaContent';
import { areasClient } from '@/api/areas/client';
import { makeQueryClient } from "@/lib/query-client";
import { areasKeys } from "@/components/areas/hooks/use-areas-query";
import { Suspense } from "react";
import LoadingOverlay from "@/components/ui/loading-overlay";

export default async function AreasPage() {
  const queryClient = makeQueryClient();
  
  const initialParams = {
    page: 0,
    size: 10,
  };

  await queryClient.prefetchQuery({
    queryKey: areasKeys.list(initialParams),
    queryFn: () => areasClient.buscarPorFiltro(initialParams),
  });

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
        <HydrationBoundary state={dehydrate(queryClient)}>
          <AreaContent />
        </HydrationBoundary>
      </Suspense>
    </div>
  );
}