import { weeks } from "@/components/dashboard/MockDados";
import { useEffect, useState, useLayoutEffect } from "react";
import { getStatusColor } from "../../functions";
import FilterCalendarMonth from "./FilterCalendarMonth";
import { ICalendar } from "@/api/dashboard/type";
import dashboardClient from "@/api/dashboard/client";

export default function CalendarMonth() {
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    items: any[];
  }>({ visible: false, x: 0, y: 0, items: [] });

  const showTooltip = (e: React.MouseEvent, items: any[]) => {
    setTooltip({
      visible: true,
      x: e.clientX + 10,
      y: e.clientY + 10,
      items,
    });
  };

  const hideTooltip = () => {
    setTooltip({ visible: false, x: 0, y: 0, items: [] });
  };

  // Prevenir scroll quando tooltip está visível
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

  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarByMonth, setCalendarByMonth] = useState<ICalendar[]>([]);

  useEffect(() => {
    const getCalendarByMonth = async () => {
      const data = await dashboardClient.getCalendarByMonth(currentDate.getMonth() + 1, currentDate.getFullYear());
      setCalendarByMonth(data);
    };
    getCalendarByMonth();
  }, [currentDate]);

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
          const dayObligations = calendarByMonth.filter(obligation => {
            const obligationDate = new Date(obligation.dtFim);
            return obligationDate.getDate() === dayInfo.date.getDate() &&
              obligationDate.getMonth() === dayInfo.date.getMonth() &&
              obligationDate.getFullYear() === dayInfo.date.getFullYear();
          });

          return (
            <div
              key={index}
              className={`p-2 rounded-lg border text-xs flex flex-col transition-all duration-200 ${dayInfo.isCurrentMonth
                ? dayInfo.isToday
                  ? 'bg-blue-50 border-blue-300 shadow-md'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
                : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}
            >
              <div className={`font-medium mb-1 ${dayInfo.isToday ? 'text-blue-700 font-bold' :
                dayInfo.isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                }`}>
                {dayInfo.day}
              </div>

              <div className="overflow-y-auto flex-1 space-y-1">
                {dayObligations.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-1">
                    -
                  </div>
                ) : (
                  dayObligations.slice(0, 3).map((obligation) => {
                    const obligationDate = new Date(obligation.dtFim);
                    const time = obligationDate.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div
                        key={obligation.idSolicitacaoPrazo}
                        className={`p-1 rounded text-xs truncate ${getStatusColor(obligation.nmStatus)}`}
                        title={`${obligation.nmTema} - ${time}`}
                      >
                        <div className="font-medium text-xs">{time}</div>
                        <div className="truncate">{obligation.nmTema}</div>
                      </div>
                    );
                  })
                )}

                {dayObligations.length > 3 && (
                  <div
                    className="text-xs text-gray-500 text-center py-1 cursor-pointer"
                    onMouseEnter={(e) =>
                      showTooltip(
                        e,
                        dayObligations.slice(3)
                      )
                    }
                    onMouseLeave={hideTooltip}
                  >
                    +{dayObligations.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {tooltip.visible && (
        <div
          className="fixed z-50 bg-white border border-gray-300 shadow-lg rounded-lg p-2 w-64 max-h-80 overflow-y-auto pointer-events-none"
          style={{
            top: tooltip.y,
            left: tooltip.x
          }}
        >
          <div className="font-semibold text-sm mb-2 text-gray-700">
            Outras obrigações:
          </div>
          {tooltip.items.map((obligation) => {
            const obligationDate = new Date(obligation.dtFim);
            const time = obligationDate.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={obligation.idSolicitacaoPrazo}
                className={`p-1 mb-1 rounded text-xs ${getStatusColor(
                  obligation.nmStatus
                )}`}
              >
                <div className="font-medium">{time}</div>
                <div>{obligation.nmTema}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}