'use client';

import { useEffect, useState } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader/DashboardHeader';
import TasksStatusBoardObrigacoes from '@/components/dashboard/TasksStatusBoard/TasksStatusBoardObrigacoes';
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 h-full">
          <TasksStatusBoardObrigacoes refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}
