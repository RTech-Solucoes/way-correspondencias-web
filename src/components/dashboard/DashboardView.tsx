import { useEffect, useState } from 'react';
import DashboardHeader from './DashboardHeader/DashboardHeader';
import DeadlinesCalendar from './DeadlinesCalendar/DeadlinesCalendar';
import NextDeadlines from './NextDeadlines/NextDeadlines';
import RecentActivity from './RecentActivity/RecentActivity';
import TasksStatusBoard from './TasksStatusBoard/TasksStatusBoard';

export default function DashboardViewComponent() {
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