import FilterCalendarYear from "./FilterCalendarYear";

export interface CalendarYearData {
  mes: string | number;
  quantidade: number;
}

interface CalendarYearProps {
  calendarByYear: CalendarYearData[];
  currentYear: number;
  navigateYear: (direction: 'prev' | 'next') => void;
  itemLabel?: string; // "solicitação" ou "obrigação"
  itemLabelPlural?: string; // "solicitações" ou "obrigações"
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function CalendarYear({ 
  calendarByYear, 
  currentYear, 
  navigateYear,
  itemLabel = "solicitação",
  itemLabelPlural = "solicitações"
}: CalendarYearProps) {
  
  const isCurrentMonth = (monthIndex: number) => {
    const currentDate = new Date();
    return monthIndex === currentDate.getMonth() && currentDate.getFullYear() === currentYear;
  };

  // Criar mapa de quantidade por mês (suporta mes como string ou número)
  const monthMap = new Map<number, number>();
  calendarByYear.forEach(item => {
    if (typeof item.mes === 'number') {
      monthMap.set(item.mes - 1, item.quantidade);
    } else {
      const monthIndex = MONTHS.findIndex(m => m.toLowerCase() === item.mes.toString().toLowerCase());
      if (monthIndex !== -1) {
        monthMap.set(monthIndex, item.quantidade);
      }
    }
  });

  return (
    <div className="space-y-4">
      <FilterCalendarYear year={currentYear} navigateYear={navigateYear} />

      <div className="grid grid-cols-4 gap-4">
        {MONTHS.map((monthName, index) => {
          const quantidade = monthMap.get(index) || 0;
          const isCurrent = isCurrentMonth(index);

          return (
            <div
              key={monthName}
              className={`p-4 rounded-lg border transition-all ${
                isCurrent 
                  ? 'bg-blue-50 border-blue-300 shadow-md' 
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="font-semibold text-sm mb-2 text-gray-700">{monthName}</div>
              <div className="flex items-center gap-2">
                <div className={`text-3xl font-bold ${
                  quantidade > 0 ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {quantidade}
                </div>
                <div className="text-xs text-gray-500">
                  {quantidade === 1 ? itemLabel : itemLabelPlural}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}