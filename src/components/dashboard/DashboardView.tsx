import { useEffect, useState } from 'react';
import DashboardHeader from './DashboardHeader/DashboardHeader';
import DeadlinesCalendar from './DeadlinesCalendar/DeadlinesCalendar';
import NextDeadlines from './NextDeadlines/NextDeadlines';
import RecentActivity from './RecentActivity/RecentActivity';
import TasksStatusBoard from './TasksStatusBoard/TasksStatusBoard';

export default function DashboardViewComponent() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setLastUpdated(new Date());
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        lastUpdated={lastUpdated}
        refreshData={refreshData}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TasksStatusBoard />
        <RecentActivity />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <NextDeadlines />
        <DeadlinesCalendar />
      </div>
    </div>
  )
}