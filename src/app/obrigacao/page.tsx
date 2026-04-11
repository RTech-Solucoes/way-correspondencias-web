import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { ObrigacoesContent } from "@/components/obrigacoes/list-page/ObrigacoesContent";
import obrigacaoClient from "@/api/obrigacao/client";

// import { getServerResponsavelLogado } from "@/hooks/server/get-responsavel-logado";
import { makeQueryClient } from "@/lib/query-client";
import { obrigacoesKeys } from "@/components/obrigacoes/hooks/use-obrigacoes-query";
import LoadingOverlay from "@/components/ui/loading-overlay";
import { Suspense } from "react";
import { ObrigacaoFiltroRequest, PERFIS_FILTRO_DEFAULT_DATA_LIMITE } from "@/api/obrigacao/types";

// import { getPeriodoConcessao } from "@/utils/concession-period";

// import { getPeriodoConcessao } from "@/utils/concession-period";

// async function getDefaultFilters(): Promise<Partial<ObrigacaoFiltroRequest>> {
//   const [responsavel, periodoConcessao] = await Promise.all([
//     getServerResponsavelLogado(),
//     getPeriodoConcessao(),
//   ]);

//   if (!responsavel?.idPerfil || !periodoConcessao) {
//     return {};
//   }

//   const { dtInicio, dtFim } = periodoConcessao;

//   if (PERFIS_FILTRO_DEFAULT_DATA_LIMITE.includes(responsavel.idPerfil)) {
//     // Admin, Gestor, Diretoria, Super Admin - usa data limite
//     return {
//       dtLimiteInicio: dtInicio,
//       dtLimiteFim: dtFim,
//     };
//   } else {
//     // Demais perfis - usa data de término
//     return {
//       dtTerminoInicio: dtInicio,
//       dtTerminoFim: dtFim,
//     };
//   }
// }

export default async function ObrigacoesPage() {
  const queryClient = makeQueryClient();

  // const defaultFilters = await getDefaultFilters();
  const defaultFilters: Partial<ObrigacaoFiltroRequest> = {};

  const initialParams: ObrigacaoFiltroRequest = {
    page: 0,
    size: 10,
    // ...defaultFilters,
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
        {/* <ObrigacoesContent defaultFilters={defaultFilters} /> */}
          <ObrigacoesContent defaultFilters={defaultFilters} />
        </HydrationBoundary>
      </Suspense>
    </div>
  );
}
