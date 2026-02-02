import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { ObrigacoesContent } from "@/components/obrigacoes/list-page/ObrigacoesContent";
import obrigacaoClient from "@/api/obrigacao/client";
import concessionariaClient from "@/api/concessionaria/client";
import { getServerResponsavelLogado } from "@/hooks/server/get-responsavel-logado";
import { makeQueryClient } from "@/lib/query-client";
import { obrigacoesKeys } from "@/components/obrigacoes/hooks/use-obrigacoes-query";
import LoadingOverlay from "@/components/ui/loading-overlay";
import { Suspense } from "react";
import { ObrigacaoFiltroRequest, PERFIS_FILTRO_DEFAULT_DATA_LIMITE } from "@/api/obrigacao/types";

async function getDefaultFilters(): Promise<Partial<ObrigacaoFiltroRequest>> {
  try {
    const [responsavel, anoConcessao] = await Promise.all([
      getServerResponsavelLogado(),
      concessionariaClient.buscarAnoConcessaoConcessionariaPorIdConcessionaria(),
    ]);

    if (!responsavel?.idPerfil || !anoConcessao) {
      return {};
    }

    if (PERFIS_FILTRO_DEFAULT_DATA_LIMITE.includes(responsavel.idPerfil)) {
      // Admin, Gestor, Diretoria, Admin Master - usa data limite
      return {
        dtLimiteInicio: anoConcessao.dtBaseInicioConcessao || null,
        dtLimiteFim: anoConcessao.dtLimiteConcessao || null,
      };
    } else {
      // Demais perfis - usa data de término
      return {
        dtTerminoInicio: anoConcessao.dtBaseInicioConcessao || null,
        dtTerminoFim: anoConcessao.dtLimiteConcessao  || null,
      };
    }
  } catch (error) {
    console.error('Erro ao buscar filtros padrão:', error);
    return {};
  }
}

export default async function ObrigacoesPage() {
  const queryClient = makeQueryClient();
  const defaultFilters = await getDefaultFilters();
  
  const initialParams: ObrigacaoFiltroRequest = {
    page: 0,
    size: 10,
    ...defaultFilters,
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
          <ObrigacoesContent defaultFilters={defaultFilters} />
        </HydrationBoundary>
      </Suspense>
    </div>
  );
}
