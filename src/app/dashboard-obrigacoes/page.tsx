'use client';

import { useEffect, useState } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader/DashboardHeader';
import TasksStatusBoardObrigacoes from '@/components/dashboard/TasksStatusBoard/TasksStatusBoardObrigacoes';
import DeadlinesCalendarObrigacoes from '@/components/obrigacoes/calendario/DeadlinesCalendarObrigacoes';
import { TipoEnum } from '@/api/tipos/types';

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

      <div className="flex flex-col gap-6">
        <div className="w-full">
          <TasksStatusBoardObrigacoes refreshTrigger={refreshTrigger} />
        </div>
        <div className="w-full">
          <DeadlinesCalendarObrigacoes refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}
