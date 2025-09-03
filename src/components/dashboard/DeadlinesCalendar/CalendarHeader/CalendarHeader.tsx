import CustomCardHeader from "../../card-header";
import {Button} from "@/components/ui/button";

type CalendarView = 'month' | 'week' | 'year';

interface ICalendarHeader {
  calendarView: CalendarView;
  setCalendarView: React.Dispatch<React.SetStateAction<CalendarView>>;
}

export default function CalendarHeader(props: ICalendarHeader) {
  return (
    <CustomCardHeader
      title="Calendário de Obrigações"
      description="Visualize suas obrigações no calendário"
    >
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => props.setCalendarView('month')}
          className={props.calendarView === 'month' ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
        >
          Mês
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => props.setCalendarView('week')}
          className={props.calendarView === 'week' ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
        >
          Semana
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => props.setCalendarView('year')}
          className={props.calendarView === 'year' ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
        >
          Ano
        </Button>
      </div>
    </CustomCardHeader>
  )
}