import { months, obligations } from "@/api/MockDados";

export default function CalendarMonth() {
  return (
    <>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {months.map((day) => (
          <div key={day} className="text-xs font-medium text-gray-500">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, index) => {
          const day = index - 5;
          const isCurrentMonth = day > 0 && day <= 31;
          const isToday = day === 17;

          const dayObligations = obligations.filter(o => o.day === day);

          return (
            <div
              key={index}
              className={`p-1 rounded-lg border text-xs h-24 flex flex-col ${isCurrentMonth
                ? isToday
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-gray-200'
                : 'bg-gray-100 border-gray-200 text-gray-400'
                }`}
            >
              <div className="font-medium mb-1">{isCurrentMonth ? day : day <= 0 ? day + 30 : day - 31}</div>
              <div className="overflow-y-auto flex-1">
                {dayObligations.map((obligation, i) => (
                  <div
                    key={i}
                    className={`mb-1 p-1 rounded text-xs truncate ${obligation.status === 'concluido' ? 'bg-green-100 text-green-800' :
                      obligation.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' :
                        obligation.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                      }`}
                  >
                    {obligation.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  )
}