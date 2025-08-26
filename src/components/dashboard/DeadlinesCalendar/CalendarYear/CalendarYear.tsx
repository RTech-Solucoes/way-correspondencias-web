export default function CalendarYear() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((month, index) => {
          const isCurrentMonth = index === 6;

          const obligationCounts = [3, 5, 2, 4, 6, 3, 8, 2, 0, 0, 0, 0];

          return (
            <div
              key={month}
              className={`p-3 rounded-lg border ${isCurrentMonth ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                }`}
            >
              <div className="font-medium text-sm mb-2">{month}</div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {obligationCounts[index]} obrigações
                </div>
              </div>
            </div>
          );
        })}
    </div>
  )
}