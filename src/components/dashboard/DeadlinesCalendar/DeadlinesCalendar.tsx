import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import CalendarHeader from "./CalendarHeader/CalendarHeader";
import CalendarMonth from "./CalendarMonth/CalendarMonth";
import CalendarWeek from "./CalendarWeek/CalendarWeek";
import CalendarYear from "./CalendarYear/CalendarYear";

export default function DeadlinesCalendar() {
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'year'>('month');

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
        return <CalendarWeek />;
      case "year":
        return <CalendarYear />
    }
  }
}