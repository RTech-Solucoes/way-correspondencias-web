import { ICalendar } from "@/api/dashboard/type";
import FilterCalendarYear from "./FilterCalendarYear";

interface CalendarYearProps {
  calendarByYear: ICalendar[];
  currentYear: number;
  navigateYear: (direction: 'prev' | 'next') => void;
}

export default function CalendarYear({ calendarByYear, currentYear, navigateYear }: CalendarYearProps) {
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const getObligationCountByMonth = (monthIndex: number) => {
    return calendarByYear.filter(item => {
      const itemDate = new Date(item.dtFim);
      return itemDate.getMonth() === monthIndex;
    }).length;
  };

  const isCurrentMonth = (monthIndex: number) => {
    const currentDate = new Date();
    return currentDate.getMonth() === monthIndex && currentDate.getFullYear() === currentYear;
  };

  return (
    <div className="space-y-4">
      <FilterCalendarYear year={currentYear} navigateYear={navigateYear} />

      <div className="grid grid-cols-4 gap-4">
        {months.map((month, index) => {
          const obligationCount = getObligationCountByMonth(index);
          const isCurrent = isCurrentMonth(index);

          return (
            <div
              key={month}
              className={`p-3 rounded-lg border ${isCurrent ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                }`}
            >
              <div className="font-medium text-sm mb-2">{month}</div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {obligationCount} obrigações
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}