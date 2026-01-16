import { Suspense } from "react";
import { EmailContent } from "@/components/email/EmailContent";
import LoadingOverlay from "@/components/ui/loading-overlay";
import { emailClient } from "@/api/email/client";

export default async function EmailPage() {
  const data = await emailClient.buscarPorFiltro({ page: 0, size: 15 });

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
        <EmailContent initialData={data} />
      </Suspense>
    </div>
  );
}