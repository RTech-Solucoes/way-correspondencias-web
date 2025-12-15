import { weeks } from "@/components/dashboard/MockDados";
import { useEffect, useState, useLayoutEffect } from "react";
import FilterCalendarMonth from "./FilterCalendarMonth";
import { useRouter } from "next/navigation";

// Tipo genérico para itens do calendário mensal
export interface CalendarMonthItem {
  id: number;
  cdIdentificacao: string;
  data: string; // Data no formato YYYY-MM-DD ou ISO
  status?: string;
  showTime?: boolean;
}

export interface CalendarMonthConfig {
  fetchData: (dataInicio: string, dataFim: string) => Promise<CalendarMonthItem[]>;
  getItemRoute: (item: CalendarMonthItem) => string;
  getItemStyle: (item: CalendarMonthItem) => string;
  tooltipTitle: string;
  refreshTrigger?: number;
}

interface CalendarMonthProps {
  config: CalendarMonthConfig;
}

export default function CalendarMonth({ config }: CalendarMonthProps) {
  const router = useRouter();
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    items: CalendarMonthItem[];
  }>({ visible: false, x: 0, y: 0, items: [] });
  const [tooltipHoverTimeout, setTooltipHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = (e: React.MouseEvent, items: CalendarMonthItem[]) => {
    if (tooltipHoverTimeout) {
      clearTimeout(tooltipHoverTimeout);
      setTooltipHoverTimeout(null);
    }
    setTooltip({
      visible: true,
      x: e.clientX + 10,
      y: e.clientY + 10,
      items,
    });
  };

  const hideTooltip = () => {
    const timeout = setTimeout(() => {
      setTooltip({ visible: false, x: 0, y: 0, items: [] });
    }, 200);
    setTooltipHoverTimeout(timeout);
  };

  const keepTooltipOpen = () => {
    if (tooltipHoverTimeout) {
      clearTimeout(tooltipHoverTimeout);
      setTooltipHoverTimeout(null);
    }
  };

  useLayoutEffect(() => {
    if (tooltip.visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [tooltip.visible]);

  useEffect(() => {
    return () => {
      if (tooltipHoverTimeout) {
        clearTimeout(tooltipHoverTimeout);
      }
    };
  }, [tooltipHoverTimeout]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarByMonth, setCalendarByMonth] = useState<CalendarMonthItem[]>([]);

  useEffect(() => {
    const getCalendarByMonth = async () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const formatDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };
      
      const dataInicio = formatDate(firstDay);
      const dataFim = formatDate(lastDay);
      
      const data = await config.fetchData(dataInicio, dataFim);
      setCalendarByMonth(data);
    };
    getCalendarByMonth();
  }, [currentDate, config, config.refreshTrigger]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const days = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const prevMonthDay = new Date(year, month, -i);
    days.push({
      day: prevMonthDay.getDate(),
      isCurrentMonth: false,
      date: prevMonthDay,
      isToday: false
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const today = new Date();
    days.push({
      day,
      isCurrentMonth: true,
      date,
      isToday: date.toDateString() === today.toDateString()
    });
  }

  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    const nextMonthDay = new Date(year, month + 1, day);
    days.push({
      day,
      isCurrentMonth: false,
      date: nextMonthDay,
      isToday: false
    });
  }

  const parseItemDate = (item: CalendarMonthItem): Date => {
    // Se a data já tem 'T', é ISO, senão adiciona T00:00:00
    const dateStr = item.data.includes('T') ? item.data : item.data + 'T00:00:00';
    return new Date(dateStr);
  };

  const formatItemDisplay = (item: CalendarMonthItem): { primary: string; secondary: string } => {
    const itemDate = parseItemDate(item);
    
    if (item.showTime && item.data.includes('T')) {
      const time = itemDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return { primary: time, secondary: item.cdIdentificacao };
    }
    
    const date = itemDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    return { primary: item.cdIdentificacao, secondary: date };
  };

  return (
    <div className="space-y-4">
      <FilterCalendarMonth month={month + 1} year={year} navigateMonth={navigateMonth} />

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weeks.map((day) => (
          <div key={day} className="text-sm font-medium text-gray-600 py-2 bg-gray-50 rounded-lg">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((dayInfo, index) => {
          const dayItems = calendarByMonth.filter(item => {
            const itemDate = parseItemDate(item);
            return itemDate.getDate() === dayInfo.date.getDate() &&
              itemDate.getMonth() === dayInfo.date.getMonth() &&
              itemDate.getFullYear() === dayInfo.date.getFullYear();
          });

          return (
            <div
              key={index}
              className={`p-2 rounded-lg border text-xs flex flex-col transition-all duration-200 min-h-[80px] ${dayInfo.isCurrentMonth
                ? dayInfo.isToday
                  ? 'bg-blue-50 border-blue-300 shadow-md'
                  : 'bg-white border-gray-200 hover:bg-gray-50 hover:shadow-sm'
                : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}
            >
              <div className={`font-medium mb-1 ${dayInfo.isToday ? 'text-blue-700 font-bold' :
                dayInfo.isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                }`}>
                {dayInfo.day}
              </div>

              <div className="overflow-y-auto flex-1 space-y-1">
                {dayItems.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-1">
                    -
                  </div>
                ) : (
                  dayItems.slice(0, 2).map((item) => {
                    const display = formatItemDisplay(item);

                    return (
                      <div
                        key={item.id}
                        className={`p-1.5 rounded text-xs cursor-pointer hover:opacity-90 transition-all border hover:shadow-sm ${config.getItemStyle(item)}`}
                        title={`${item.cdIdentificacao}`}
                        onClick={() => router.push(config.getItemRoute(item))}
                      >
                        <div className="truncate font-semibold text-xs leading-tight">{display.primary}</div>
                        <div className="text-[10px] opacity-70 mt-0.5">{display.secondary}</div>
                        {item.status && (
                          <div className="truncate text-[10px] opacity-75 mt-0.5">{item.status}</div>
                        )}
                      </div>
                    );
                  })
                )}

                {dayItems.length > 2 && (
                  <div
                    className="text-xs text-gray-500 text-center py-1 cursor-pointer hover:text-gray-700"
                    onMouseEnter={(e) => showTooltip(e, dayItems.slice(2))}
                    onMouseLeave={hideTooltip}
                  >
                    +{dayItems.length - 2} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {tooltip.visible && (
        <div
          className="fixed z-50 bg-white border border-gray-300 shadow-lg rounded-lg p-2 w-64 overflow-y-auto max-h-80"
          style={{
            top: tooltip.y,
            left: tooltip.x
          }}
          onMouseEnter={keepTooltipOpen}
          onMouseLeave={hideTooltip}
        >
          <div className="font-semibold text-sm mb-2 text-gray-700">
            {config.tooltipTitle}
          </div>
          {tooltip.items.map((item) => {
            const display = formatItemDisplay(item);

            return (
              <div
                key={item.id}
                className={`p-2 mb-1.5 rounded text-xs cursor-pointer hover:opacity-90 transition-all border hover:shadow-sm ${config.getItemStyle(item)}`}
                onClick={() => router.push(config.getItemRoute(item))}
              >
                <div className="font-semibold">{display.primary}</div>
                <div className="text-[10px] opacity-75 mt-0.5">{display.secondary}</div>
                {item.status && (
                  <div className="text-[10px] opacity-75 mt-0.5">{item.status}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}