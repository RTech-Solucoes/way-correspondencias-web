'use client';

import { useEffect, useState } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader/DashboardHeader';
import TasksStatusBoard from '@/components/dashboard/TasksStatusBoard/TasksStatusBoard';
import DeadlinesCalendarObrigacoes from '@/components/dashboard/obrigacao/calendario/DeadlinesCalendarObrigacoes';
import { TipoEnum } from '@/api/tipos/types';
import { RecentActivityObrigacoes, ObrigacoesPrazoMetrics, ObrigacoesRankingAreas } from '@/components/dashboard/obrigacao';
import { DashboardObrigacoesDateFilter, ObrigacoesDateFilterValues } from '@/components/dashboard/filters/DashboardObrigacoesDateFilter';
import { useUserGestao } from '@/hooks/use-user-gestao';
import { PERFIS_FILTRO_DEFAULT_DATA_LIMITE } from '@/api/obrigacao/types';

export default function DashboardObrigacoesContent() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { idPerfil } = useUserGestao();

  const [filtros, setFiltros] = useState<ObrigacoesDateFilterValues>({
    dtInicio: '',
    dtFim: '',
  });
  const [filtrosAplicados, setFiltrosAplicados] = useState<ObrigacoesDateFilterValues>({
    dtInicio: '',
    dtFim: '',
  });

  const getFilterParams = () => {
    if (PERFIS_FILTRO_DEFAULT_DATA_LIMITE.includes(idPerfil ?? 0)) {
      return {
        dtLimiteInicio: filtrosAplicados.dtInicio || null,
        dtLimiteFim: filtrosAplicados.dtFim || null,
        dtTerminoInicio: null,
        dtTerminoFim: null,
      };
    }
    return {
      dtLimiteInicio: null,
      dtLimiteFim: null,
      dtTerminoInicio: filtrosAplicados.dtInicio || null,
      dtTerminoFim: filtrosAplicados.dtFim || null,
    };
  };

  const filterParams = getFilterParams();

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setLastUpdated(new Date());
    setRefreshTrigger(prev => prev + 1);
  };

  // const aplicarFiltros = () => {
  //   setFiltrosAplicados(filtros);
  //   refreshData();
  // };

  // const limparFiltros = () => {
  //   const vazio = { dtInicio: '', dtFim: '' };
  //   setFiltros(vazio);
  //   setFiltrosAplicados(vazio);
  //   refreshData();
  // };

  return (
    <div className="space-y-6">
      <DashboardHeader
        lastUpdated={lastUpdated}
        refreshData={refreshData}
        tipoFluxo={TipoEnum.OBRIGACAO}
      />

      {/* <DashboardObrigacoesDateFilter
        values={filtros}
        onChange={setFiltros}
        onApply={aplicarFiltros}
        onClear={limparFiltros}
      /> */}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 h-full">
          <TasksStatusBoard
            refreshTrigger={refreshTrigger}
            cdTipoFluxo={TipoEnum.OBRIGACAO}
            cdTipoStatus={[TipoEnum.TODOS, TipoEnum.OBRIGACAO]}
            title="Visão Geral de Obrigações"
            description="Status de todas as obrigações contratuais"
            showPendentes={true}
            showRecent={true}
            dtLimiteInicio={filterParams.dtLimiteInicio}
            dtLimiteFim={filterParams.dtLimiteFim}
            dtTerminoInicio={filterParams.dtTerminoInicio}
            dtTerminoFim={filterParams.dtTerminoFim}
          />
        </div>
        <div className="lg:col-span-2 h-full">
          <RecentActivityObrigacoes
            refreshTrigger={refreshTrigger}
            dtLimiteInicio={filterParams.dtLimiteInicio}
            dtLimiteFim={filterParams.dtLimiteFim}
            dtTerminoInicio={filterParams.dtTerminoInicio}
            dtTerminoFim={filterParams.dtTerminoFim}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ObrigacoesPrazoMetrics
          refreshTrigger={refreshTrigger}
          dtLimiteInicio={filterParams.dtLimiteInicio}
          dtLimiteFim={filterParams.dtLimiteFim}
          dtTerminoInicio={filterParams.dtTerminoInicio}
          dtTerminoFim={filterParams.dtTerminoFim}
        />
        <DeadlinesCalendarObrigacoes
          refreshTrigger={refreshTrigger}
          dtLimiteInicio={filterParams.dtLimiteInicio}
          dtLimiteFim={filterParams.dtLimiteFim}
          dtTerminoInicio={filterParams.dtTerminoInicio}
          dtTerminoFim={filterParams.dtTerminoFim}
        />
      </div>

      <div className="w-full">
        <ObrigacoesRankingAreas
          refreshTrigger={refreshTrigger}
          dtLimiteInicio={filterParams.dtLimiteInicio}
          dtLimiteFim={filterParams.dtLimiteFim}
          dtTerminoInicio={filterParams.dtTerminoInicio}
          dtTerminoFim={filterParams.dtTerminoFim}
        />
      </div>
    </div>
  );
}

