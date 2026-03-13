import { getCurrentWeek } from "../../functions";
import { useRouter } from "next/navigation";

// Tipo genérico para itens do calendário semanal
export interface CalendarWeekItem {
  id: number;
  cdIdentificacao: string;
  data: string; // Data no formato YYYY-MM-DD ou ISO
  status?: string;
  showTime?: boolean;
}

export interface CalendarWeekConfig {
  items: CalendarWeekItem[];
  getItemRoute: (item: CalendarWeekItem) => string;
  getItemStyle: (item: CalendarWeekItem) => string;
}

interface CalendarWeekProps {
  config: CalendarWeekConfig;
}

export default function CalendarWeek({ config }: CalendarWeekProps) {
  const router = useRouter();
  const currentWeek = getCurrentWeek();

  const parseItemDate = (item: CalendarWeekItem): Date => {
    const dateStr = item.data.includes('T') ? item.data : item.data + 'T00:00:00';
    return new Date(dateStr);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {currentWeek.map((dayInfo) => {
          return (
            <div
              key={dayInfo.dayName}
              className={`text-sm font-medium p-2 rounded-t-lg ${dayInfo.isToday ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
            >
              {dayInfo.dayName}
              <div className="text-xs mt-1">{dayInfo.date.toString().padStart(2, '0')}/{dayInfo.month.toString().padStart(2, '0')}</div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {currentWeek.map((dayInfo) => {
          const dayItems = config.items.filter(item => {
            const itemDate = parseItemDate(item);
            return itemDate.getDate() === dayInfo.date &&
              itemDate.getMonth() + 1 === dayInfo.month &&
              itemDate.getFullYear() === dayInfo.year;
          });

          return (
            <div
              key={dayInfo.dayName}
              className="bg-white border border-gray-200 rounded-b-lg p-2 overflow-y-auto min-h-[80px]"
            >
              {dayItems.length === 0 ? (
                <div className="text-xs text-gray-400 h-full flex items-center justify-center">
                  Sem Prazos
                </div>
              ) : (
                dayItems.map((item) => {
                  const itemDate = parseItemDate(item);
                  const time = item.showTime && item.data.includes('T')
                    ? itemDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                    : null;

                  return (
                    <div
                      key={item.id}
                      className={`mb-2 p-2 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity ${config.getItemStyle(item)}`}
                      onClick={() => router.push(config.getItemRoute(item))}
                    >
                      {time && <div className="font-medium">{time}</div>}
                      <div className="truncate font-medium">{item.cdIdentificacao}</div>
                      {item.status && <div className="truncate text-xs opacity-75 mt-1">{item.status}</div>}
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </div>
  )
}