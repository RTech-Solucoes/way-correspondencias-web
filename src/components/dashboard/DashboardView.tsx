import { useEffect, useState } from 'react';
import DashboardHeader from './DashboardHeader/DashboardHeader';
import DeadlinesCalendar from './DeadlinesCalendar/DeadlinesCalendar';
import NextDeadlines from './NextDeadlines/NextDeadlines';
import RecentActivity from './RecentActivity/RecentActivity';
import TasksStatusBoard from './TasksStatusBoard/TasksStatusBoard';
import { useConcessionaria } from '@/context/concessionaria/ConcessionariaContext';
import { Quantum as Loading } from 'ldrs/react';

export default function DashboardViewComponent() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { concessionariaSelecionada, loading } = useConcessionaria();

  useEffect(() => {
    if (concessionariaSelecionada) {
      refreshData();
    }
  }, [concessionariaSelecionada]);

  const refreshData = () => {
    setLastUpdated(new Date());
    setRefreshTrigger(prev => prev + 1);
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
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 h-full">
          <TasksStatusBoard refreshTrigger={refreshTrigger} />
        </div>
        <div className="lg:col-span-2 h-full">
          <RecentActivity refreshTrigger={refreshTrigger} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <NextDeadlines refreshTrigger={refreshTrigger} />
        <DeadlinesCalendar refreshTrigger={refreshTrigger} />
      </div>
    </div>
  )
}