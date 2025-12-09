import CustomCardHeader from "../../card-header";
import { Button } from "@/components/ui/button";

export type CalendarView = 'month' | 'week' | 'year';

export interface CalendarHeaderProps {
  calendarView: CalendarView;
  setCalendarView: React.Dispatch<React.SetStateAction<CalendarView>>;
  title?: string;
  description?: string;
}

export default function CalendarHeader({ 
  calendarView, 
  setCalendarView, 
  title = "Calendário de Solicitações",
  description = "Visualize suas solicitações no calendário"
}: CalendarHeaderProps) {
  return (
    <div className="w-full flex flex-row justify-between pr-8">
      <CustomCardHeader
        title={title}
        description={description}
      >
      </CustomCardHeader>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCalendarView('month')}
          className={calendarView === 'month' ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
        >
          Mês
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCalendarView('week')}
          className={calendarView === 'week' ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
        >
          Semana
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCalendarView('year')}
          className={calendarView === 'year' ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
        >
          Ano
        </Button>
      </div>
    </div>
  )
}