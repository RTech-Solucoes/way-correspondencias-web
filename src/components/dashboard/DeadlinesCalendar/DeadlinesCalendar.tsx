import dashboardClient from "@/api/dashboard/client";
import { ICalendar, ICalendarYear } from "@/api/dashboard/type";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import CalendarHeader from "./CalendarHeader/CalendarHeader";
import CalendarMonth from "./CalendarMonth/CalendarMonth";
import CalendarWeek from "./CalendarWeek/CalendarWeek";
import CalendarYear from "./CalendarYear/CalendarYear";
import { getAllStatusLegend } from "../functions";

interface DeadlinesCalendarProps {
  refreshTrigger?: number;
}

export default function DeadlinesCalendar({ refreshTrigger }: DeadlinesCalendarProps) {
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'year'>('month');
  const [calendarByWeek, setCalendarByWeek] = useState<ICalendar[]>([]);
  const [calendarByYear, setCalendarByYear] = useState<ICalendarYear[]>([]);
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

      <CardContent className="h-full flex flex-col">
        <div className="bg-gray-50 rounded-lg p-4 flex-1 overflow-y-auto">
          {renderContent()}
        </div>
        
        {(calendarView === 'month' || calendarView === 'week') && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="font-semibold text-sm mb-3 text-gray-600">Legenda de Status:</div>
            <div className="flex flex-col gap-2">
              {getAllStatusLegend().map((status) => (
                <div 
                  key={status.label} 
                  className="flex items-center gap-2"
                >
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: status.bgColor }}
                  />
                  <span 
                    className="text-xs font-medium truncate text-black"
                  >
                    {status.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
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