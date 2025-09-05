import { weeks } from "@/components/dashboard/MockDados";
import { ICalendar } from "@/api/dashboard/type";
import { getCurrentWeek, getStatusColor } from "../../functions";

interface ICalendarWeekProps {
  calendarByWeek: ICalendar[];
}

export default function CalendarWeek(props: ICalendarWeekProps) {
  const currentWeek = getCurrentWeek();

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {currentWeek.map((dayInfo, index) => {
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
        {currentWeek.map((dayInfo, index) => {
          const dayObligations = props.calendarByWeek.filter(obligation => {
            const obligationDate = new Date(obligation.dtFim);
            return obligationDate.getDate() === dayInfo.date &&
              obligationDate.getMonth() + 1 === dayInfo.month;
          });

          return (
            <div
              key={dayInfo.dayName}
              className="bg-white border border-gray-200 rounded-b-lg p-2 overflow-y-auto"
            >
              {dayObligations?.length === 0 ? (
                <div className="text-xs text-gray-400 h-full flex items-center justify-center">
                  Sem obrigações
                </div>
              ) : (
                dayObligations.map((obligation, i) => {
                  const obligationDate = new Date(obligation.dtFim);
                  const time = obligationDate.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={obligation.idSolicitacaoPrazo}
                      className={`mb-2 p-2 rounded text-xs ${getStatusColor(obligation.nmStatus)}`}
                    >
                      <div className="font-medium">{time}</div>
                      <div>{obligation.nmTema}</div>
                      <div className="text-xs opacity-75 mt-1">{obligation.nmStatus}</div>
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