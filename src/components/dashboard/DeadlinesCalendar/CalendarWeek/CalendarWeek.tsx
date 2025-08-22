import { months } from "@/api/MockDados";

export default function CalendarWeek() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {months.map((day, index) => {
          const date = 14 + index;
          const isToday = date === 17;
          return (
            <div
              key={day}
              className={`text-sm font-medium p-2 rounded-t-lg ${isToday ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
            >
              {day}
              <div className="text-xs mt-1">{date}/07</div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {months.map((day, index) => {
          const date = 14 + index;

          const obligations = [
            { day: 17, title: "5.2 - Contrato", status: "pendente", time: "10:00" },
            { day: 18, title: "Ofício SEI n. 714/2025", status: "em_andamento", time: "14:30" },
            { day: 19, title: "3.1.2 - Documentação", status: "pendente", time: "09:00" },
            { day: 15, title: "Reunião Mensal", status: "em_andamento", time: "15:00" },
          ];

          const dayObligations = obligations.filter(o => o.day === date);

          return (
            <div
              key={day}
              className="bg-white border border-gray-200 rounded-b-lg p-2 h-64 overflow-y-auto"
            >
              {dayObligations?.length === 0 ? (
                <div className="text-xs text-gray-400 h-full flex items-center justify-center">
                  Sem obrigações
                </div>
              ) : (
                dayObligations.map((obligation, i) => (
                  <div
                    key={i}
                    className={`mb-2 p-2 rounded text-xs ${obligation.status === 'concluido' ? 'bg-green-100 text-green-800' :
                      obligation.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' :
                        obligation.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                      }`}
                  >
                    <div className="font-medium">{obligation.time}</div>
                    <div>{obligation.title}</div>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  )
}