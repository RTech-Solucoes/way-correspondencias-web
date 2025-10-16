import { ICalendar } from "@/api/dashboard/type";
import { getCurrentWeek, getStatusColorCalendar } from "../../functions";
import { useRouter } from "next/navigation";

interface ICalendarWeekProps {
  calendarByWeek: ICalendar[];
}

export default function CalendarWeek(props: ICalendarWeekProps) {
  const router = useRouter();
  const currentWeek = getCurrentWeek();

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
                  Sem Prazos
                </div>
              ) : (
                dayObligations.map((obligation) => {
                  const obligationDate = new Date(obligation.dtFim);
                  const time = obligationDate.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={obligation.idSolicitacaoPrazo}
                      className={`mb-2 p-2 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity ${getStatusColorCalendar(obligation.nmStatus)}`}
                      onClick={() => router.push(`/solicitacoes?idSolicitacao=${obligation.idSolicitacao}`)}
                    >
                      <div className="font-medium">{time}</div>
                      <div className="truncate">{obligation.cdIdentificacao}</div>
                      <div className="truncate text-xs opacity-75 mt-1">{obligation.nmStatus}</div>
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