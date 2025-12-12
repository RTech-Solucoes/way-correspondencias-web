'use client';

import { useEffect, useState } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader/DashboardHeader';
import TasksStatusBoard from '@/components/dashboard/TasksStatusBoard/TasksStatusBoard';
import DeadlinesCalendarObrigacoes from '@/components/dashboard/obrigacao/calendario/DeadlinesCalendarObrigacoes';
import { TipoEnum } from '@/api/tipos/types';
import { RecentActivityObrigacoes, ObrigacoesPrazoMetrics, ObrigacoesRankingAreas } from '@/components/dashboard/obrigacao';

export default function DashboardObrigacoesPage() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setLastUpdated(new Date());
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        lastUpdated={lastUpdated}
        refreshData={refreshData}
        tipoFluxo={TipoEnum.OBRIGACAO}
      />

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
          />
        </div>
        <div className="lg:col-span-2 h-full">
          <RecentActivityObrigacoes refreshTrigger={refreshTrigger} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ObrigacoesPrazoMetrics refreshTrigger={refreshTrigger} />
        <DeadlinesCalendarObrigacoes refreshTrigger={refreshTrigger} />
      </div>

      <div className="w-full">
        <ObrigacoesRankingAreas refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}
