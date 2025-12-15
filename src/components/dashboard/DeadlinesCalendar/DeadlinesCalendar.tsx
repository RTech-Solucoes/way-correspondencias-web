import dashboardClient from "@/api/dashboard/client";
import { ICalendarYear } from "@/api/dashboard/type";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState, useMemo } from "react";
import CalendarHeader from "./CalendarHeader/CalendarHeader";
import CalendarMonth, { CalendarMonthConfig, CalendarMonthItem } from "./CalendarMonth/CalendarMonth";
import CalendarWeek, { CalendarWeekConfig, CalendarWeekItem } from "./CalendarWeek/CalendarWeek";
import CalendarYear from "./CalendarYear/CalendarYear";
import { getAllStatusLegend, getStatusColorCalendar } from "../functions";

interface DeadlinesCalendarProps {
  refreshTrigger?: number;
}

export default function DeadlinesCalendar({ refreshTrigger }: DeadlinesCalendarProps) {
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'year'>('month');
  const [calendarByWeek, setCalendarByWeek] = useState<CalendarWeekItem[]>([]);
  const [calendarByYear, setCalendarByYear] = useState<ICalendarYear[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Configuração do calendário mensal para solicitações
  const calendarMonthConfig: CalendarMonthConfig = useMemo(() => ({
    fetchData: async (dataInicio: string, dataFim: string): Promise<CalendarMonthItem[]> => {
      const [ano, mes] = dataInicio.split('-');
      const data = await dashboardClient.getCalendarByMonth(parseInt(mes), parseInt(ano));
      return data.map(item => ({
        id: item.idSolicitacao,
        cdIdentificacao: item.cdIdentificacao,
        data: item.dtFim,
        status: item.nmStatus,
        showTime: true,
      }));
    },
    getItemRoute: (item) => `/solicitacoes?idSolicitacao=${item.id}`,
    getItemStyle: (item) => getStatusColorCalendar(item.status || ''),
    tooltipTitle: "Outras Solicitações:",
    refreshTrigger,
  }), [refreshTrigger]);

  // Configuração do calendário semanal para solicitações
  const calendarWeekConfig: CalendarWeekConfig = useMemo(() => ({
    items: calendarByWeek,
    getItemRoute: (item) => `/solicitacoes?idSolicitacao=${item.id}`,
    getItemStyle: (item) => getStatusColorCalendar(item.status || ''),
  }), [calendarByWeek]);

  useEffect(() => {
    const getCalendarByWeek = async () => {
      const data = await dashboardClient.getCalendarByWeek();
      setCalendarByWeek(data.map(item => ({
        id: item.idSolicitacao,
        cdIdentificacao: item.cdIdentificacao,
        data: item.dtFim,
        status: item.nmStatus,
        showTime: true,
      })));
    };

    getCalendarByWeek();
  }, [refreshTrigger]);

  useEffect(() => {
    const getCalendarByYear = async () => {
      const data = await dashboardClient.getCalendarByYear(currentYear);
      setCalendarByYear(data);
    };

    getCalendarByYear();
  }, [refreshTrigger, currentYear]);


  const navigateYear = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentYear(prev => prev + 1);
    }
  };

  return (
    <Card className="flex flex-col lg:col-span-2">
      <CalendarHeader calendarView={calendarView} setCalendarView={setCalendarView} />

      <CardContent className="h-full flex flex-col">
        <div className="bg-gray-50 rounded-lg p-4 flex-1 overflow-y-auto">
          {renderContent()}
        </div>
        
        {(calendarView === 'month' || calendarView === 'week') && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="font-semibold text-sm mb-3 text-gray-600">Legenda de Status:</div>
            <div className="flex flex-col gap-2">
              {getAllStatusLegend().map((status) => (
                <div 
                  key={status.label} 
                  className="flex items-center gap-2"
                >
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: status.bgColor }}
                  />
                  <span 
                    className="text-xs font-medium truncate text-black"
                  >
                    {status.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  function renderContent() {
    switch (calendarView) {
      case "month":
        return <CalendarMonth config={calendarMonthConfig} />;
      case "week":
        return <CalendarWeek config={calendarWeekConfig} />;
      case "year":
        return (
          <CalendarYear 
            calendarByYear={calendarByYear.map(item => ({ mes: item.mes, quantidade: item.qtde }))} 
            currentYear={currentYear} 
            navigateYear={navigateYear}
            itemLabel="solicitação"
            itemLabelPlural="solicitações"
          />
        );
    }
  }
}