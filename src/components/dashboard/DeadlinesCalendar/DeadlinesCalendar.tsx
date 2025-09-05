import dashboardClient from "@/api/dashboard/client";
import { ICalendar } from "@/api/dashboard/type";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import CalendarHeader from "./CalendarHeader/CalendarHeader";
import CalendarMonth from "./CalendarMonth/CalendarMonth";
import CalendarWeek from "./CalendarWeek/CalendarWeek";
import CalendarYear from "./CalendarYear/CalendarYear";

export default function DeadlinesCalendar() {
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'year'>('month');
  const [calendarByWeek, setCalendarByWeek] = useState<ICalendar[]>([]);

  useEffect(() => {
    const getCalendarByWeek = async () => {
      const data = await dashboardClient.getCalendarByWeek();
      setCalendarByWeek(data);
    };

    getCalendarByWeek();
  }, []);

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
        return <CalendarYear />
    }
  }
}