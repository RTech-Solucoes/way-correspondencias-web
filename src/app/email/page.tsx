import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { EmailContent } from "@/components/email/EmailContent";
import { emailClient } from "@/api/email/client";
import { makeQueryClient } from "@/lib/query-client";
import { emailsKeys } from "@/components/email/hooks/use-email-query";
import { Suspense } from "react";
import LoadingOverlay from "@/components/ui/loading-overlay";

export default async function EmailPage() {
  const queryClient = makeQueryClient();
  
  const initialParams = {
    page: 0,
    size: 15,
  };

  await queryClient.prefetchQuery({
    queryKey: emailsKeys.list(initialParams),
    queryFn: () => emailClient.buscarPorFiltro(initialParams),
  });

  return (
    <div data-ssr="true">
      <Suspense
        fallback={
          <LoadingOverlay
            title="Carregando emails..."
            subtitle="Aguarde enquanto os dados são carregados"
          />
        }
      >
        <HydrationBoundary state={dehydrate(queryClient)}>
          <EmailContent />
        </HydrationBoundary>
      </Suspense>
    </div>
  );
}