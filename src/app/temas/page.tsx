import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { TemaContent } from '@/components/temas/TemaContent';
import { temasClient } from '@/api/temas/client';
import { makeQueryClient } from "@/lib/query-client";
import { temasKeys } from "@/components/temas/hooks/use-temas-query";
import LoadingOverlay from "@/components/ui/loading-overlay";
import { Suspense } from "react";

export default async function TemasPage() {
  const queryClient = makeQueryClient();
  
  const initialParams = {
    page: 0,
    size: 10,
  };

  await queryClient.prefetchQuery({
    queryKey: temasKeys.list(initialParams),
    queryFn: () => temasClient.buscarPorFiltro(initialParams),
  });

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
        <HydrationBoundary state={dehydrate(queryClient)}>
          <TemaContent />
        </HydrationBoundary>
      </Suspense>
    </div>
  );
}
