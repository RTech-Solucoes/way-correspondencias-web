import { Suspense } from "react";
import { ObrigacoesContent } from "@/components/obrigacoes/list-page/ObrigacoesContent";
import LoadingOverlay from "@/components/ui/loading-overlay";
import obrigacaoClient from "@/api/obrigacao/client";

export default async function ObrigacoesPage() {
  const data = await obrigacaoClient.buscarLista({ page: 0, size: 10 });

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
        <ObrigacoesContent initialData={data} />
      </Suspense>
    </div>
  );
}
