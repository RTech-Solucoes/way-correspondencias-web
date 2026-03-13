import { Suspense } from "react";
import { EmailDetailContent } from "@/components/email/EmailDetailContent";
import LoadingOverlay from "@/components/ui/loading-overlay";
import { emailClient } from "@/api/email/client";

interface EmailDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EmailDetailPage({ params }: EmailDetailPageProps) {
  const { id } = await params;
  
  let initialData = null;
  if (id && !Number.isNaN(Number(id))) {
    try {
      initialData = await emailClient.buscarPorId(Number(id));
    } catch (error) {
      console.error('Erro ao carregar detalhes do email:', error);
    }
  }

  return (
    <div data-ssr="true">
      <Suspense
        fallback={
          <LoadingOverlay
            title="Carregando email..."
            subtitle="Aguarde enquanto os dados são carregados"
          />
        }
      >
        <EmailDetailContent emailId={id} initialData={initialData} />
      </Suspense>
    </div>
  );
}