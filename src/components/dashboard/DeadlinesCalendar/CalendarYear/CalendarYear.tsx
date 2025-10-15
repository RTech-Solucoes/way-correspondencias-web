import { ICalendarYear } from "@/api/dashboard/type";
import FilterCalendarYear from "./FilterCalendarYear";

interface CalendarYearProps {
  calendarByYear: ICalendarYear[];
  currentYear: number;
  navigateYear: (direction: 'prev' | 'next') => void;
}

export default function CalendarYear({ calendarByYear, currentYear, navigateYear }: CalendarYearProps) {
  const isCurrentMonth = (monthName: string) => {
    const currentDate = new Date();
    const currentMonthName = currentDate.toLocaleDateString('pt-BR', { month: 'long' });
    const normalizedCurrentMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);
    return normalizedCurrentMonth === monthName && currentDate.getFullYear() === currentYear;
  };

  return (
    <div className="space-y-4">
      <FilterCalendarYear year={currentYear} navigateYear={navigateYear} />

      <div className="grid grid-cols-4 gap-4">
        {calendarByYear.map((monthData) => {
          const isCurrent = isCurrentMonth(monthData.mes);

          return (
            <div
              key={monthData.mes}
              className={`p-4 rounded-lg border transition-all ${
                isCurrent 
                  ? 'bg-blue-50 border-blue-300 shadow-md' 
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="font-semibold text-sm mb-2 text-gray-700">{monthData.mes}</div>
              <div className="flex items-center gap-2">
                <div className={`text-3xl font-bold ${
                  monthData.qtde > 0 ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {monthData.qtde}
                </div>
                <div className="text-xs text-gray-500">
                  {monthData.qtde === 1 ? 'solicitação' : 'solicitações'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}