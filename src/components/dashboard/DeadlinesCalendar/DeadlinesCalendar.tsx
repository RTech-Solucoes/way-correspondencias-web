import dashboardClient from "@/api/dashboard/client";
import { ICalendar } from "@/api/dashboard/type";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import CalendarHeader from "./CalendarHeader/CalendarHeader";
import CalendarMonth from "./CalendarMonth/CalendarMonth";
import CalendarWeek from "./CalendarWeek/CalendarWeek";
import CalendarYear from "./CalendarYear/CalendarYear";

interface DeadlinesCalendarProps {
  refreshTrigger?: number;
}

export default function DeadlinesCalendar({ refreshTrigger }: DeadlinesCalendarProps) {
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'year'>('month');
  const [calendarByWeek, setCalendarByWeek] = useState<ICalendar[]>([]);
  const [calendarByYear, setCalendarByYear] = useState<ICalendar[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const getCalendarByWeek = async () => {
      const data = await dashboardClient.getCalendarByWeek();
      setCalendarByWeek(data);
    };

    getCalendarByWeek();
  }, [refreshTrigger]);

  useEffect(() => {
    const getCalendarByYear = async () => {
      const data = await dashboardClient.getCalendarByYear(currentYear);
      setCalendarByYear(data);
    };

    getCalendarByYear();
  }, [refreshTrigger, currentYear]);


  const navigateYear = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentYear(prev => prev + 1);
    }
  };

  return (
    <Card className="flex flex-col lg:col-span-2">
      <CalendarHeader calendarView={calendarView} setCalendarView={setCalendarView} />

      <CardContent className="h-full">
        <div className="bg-gray-50 rounded-lg p-4 min-h-full overflow-y-auto">
          {renderContent()}
        </div>
      </CardContent>
    </Card>
  )

  function renderContent() {
    switch (calendarView) {
      case "month":
        return <CalendarMonth />;
      case "week":
        return <CalendarWeek calendarByWeek={calendarByWeek} />;
      case "year":
        return <CalendarYear calendarByYear={calendarByYear} currentYear={currentYear} navigateYear={navigateYear} />
    }
  }
}