'use client';

import { useEffect, useState } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader/DashboardHeader';
import DeadlinesCalendar from '@/components/dashboard/DeadlinesCalendar/DeadlinesCalendar';
import NextDeadlines from '@/components/dashboard/NextDeadlines/NextDeadlines';
import RecentActivity from '@/components/dashboard/RecentActivity/RecentActivity';
import TasksStatusBoard from '@/components/dashboard/TasksStatusBoard/TasksStatusBoard';
import { TipoEnum } from '@/api/tipos/types';
import { useConcessionaria } from '@/context/concessionaria/ConcessionariaContext';
import { Quantum as Loading } from 'ldrs/react';
import { DashboardDateFilter } from "@/components/dashboard/filters/DashboardDateFilter";

export default function DashboardCorrespondenciaContent() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { concessionariaSelecionada, loading } = useConcessionaria();
  const [filtros, setFiltros] = useState({
    dtCriacaoInicio: '',
    dtCriacaoFim: '',
  });
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    dtCriacaoInicio: '',
    dtCriacaoFim: '',
  });

  useEffect(() => {
    if (concessionariaSelecionada) {
      refreshData();
    }
  }, [concessionariaSelecionada]);

  const refreshData = () => {
    setLastUpdated(new Date());
    setRefreshTrigger(prev => prev + 1);
  };

  const aplicarFiltros = () => {
    setFiltrosAplicados(filtros);
    refreshData();
  };

  const limparFiltros = () => {
    const vazio = { dtCriacaoInicio: '', dtCriacaoFim: '' };
    setFiltros(vazio);
    setFiltrosAplicados(vazio);
    refreshData();
  };

  if (loading || !concessionariaSelecionada) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loading
          size="80"
          speed="1.5"
          color="#155dfc"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        lastUpdated={lastUpdated}
        refreshData={refreshData}
        tipoFluxo={TipoEnum.CORRESPONDENCIA}
      />

      <DashboardDateFilter
        values={filtros}
        onChange={setFiltros}
        onApply={aplicarFiltros}
        onClear={limparFiltros}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 h-full">
          <TasksStatusBoard
            refreshTrigger={refreshTrigger}
            dtCriacaoInicio={filtrosAplicados.dtCriacaoInicio || null}
            dtCriacaoFim={filtrosAplicados.dtCriacaoFim || null}
          />
        </div>
        <div className="lg:col-span-2 h-full">
          <RecentActivity
            refreshTrigger={refreshTrigger}
            dtCriacaoInicio={filtrosAplicados.dtCriacaoInicio || null}
            dtCriacaoFim={filtrosAplicados.dtCriacaoFim || null}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <NextDeadlines
          refreshTrigger={refreshTrigger}
          dtCriacaoInicio={filtrosAplicados.dtCriacaoInicio || null}
          dtCriacaoFim={filtrosAplicados.dtCriacaoFim || null}
        />
        <DeadlinesCalendar
          refreshTrigger={refreshTrigger}
          dtCriacaoInicio={filtrosAplicados.dtCriacaoInicio || null}
          dtCriacaoFim={filtrosAplicados.dtCriacaoFim || null}
        />
      </div>
    </div>
  );
}