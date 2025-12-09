import dashboardClient from "@/api/dashboard/client";
import { ObrigacaoCalendarioMesCountResponse } from "@/api/obrigacao/types";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState, useMemo } from "react";
import CalendarHeader from "@/components/dashboard/DeadlinesCalendar/CalendarHeader/CalendarHeader";
import CalendarMonth, { CalendarMonthConfig, CalendarMonthItem } from "@/components/dashboard/DeadlinesCalendar/CalendarMonth/CalendarMonth";
import CalendarWeek, { CalendarWeekConfig, CalendarWeekItem } from "@/components/dashboard/DeadlinesCalendar/CalendarWeek/CalendarWeek";
import CalendarYear from "@/components/dashboard/DeadlinesCalendar/CalendarYear/CalendarYear";

interface DeadlinesCalendarObrigacoesProps {
  refreshTrigger?: number;
}

export default function DeadlinesCalendarObrigacoes({ refreshTrigger }: DeadlinesCalendarObrigacoesProps) {
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'year'>('month');
  const [calendarByWeek, setCalendarByWeek] = useState<CalendarWeekItem[]>([]);
  const [calendarByYear, setCalendarByYear] = useState<ObrigacaoCalendarioMesCountResponse[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Configuração do calendário mensal para obrigações
  const calendarMonthConfig: CalendarMonthConfig = useMemo(() => ({
    fetchData: async (dataInicio: string, dataFim: string): Promise<CalendarMonthItem[]> => {
      const data = await dashboardClient.buscarCalendarioObrigacoes(dataInicio, dataFim);
      return data.map(item => ({
        id: item.idObrigacao,
        cdIdentificacao: item.cdIdentificacao,
        data: item.dtLimite,
        showTime: false,
      }));
    },
    getItemRoute: (item) => `/obrigacao?idObrigacao=${item.id}`,
    getItemStyle: () => 'bg-blue-100 text-blue-900 border-blue-200 hover:border-blue-300',
    tooltipTitle: "Outras Obrigações:",
    refreshTrigger,
  }), [refreshTrigger]);

  // Configuração do calendário semanal para obrigações
  const calendarWeekConfig: CalendarWeekConfig = useMemo(() => ({
    items: calendarByWeek,
    getItemRoute: (item) => `/obrigacao?idObrigacao=${item.id}`,
    getItemStyle: () => 'bg-blue-100 text-blue-900',
  }), [calendarByWeek]);

  useEffect(() => {
    const getCalendarByWeek = async () => {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const dataInicio = formatDate(startOfWeek);
      const dataFim = formatDate(endOfWeek);
      
      const data = await dashboardClient.buscarCalendarioObrigacoes(dataInicio, dataFim);
      setCalendarByWeek(data.map(item => ({
        id: item.idObrigacao,
        cdIdentificacao: item.cdIdentificacao,
        data: item.dtLimite,
        showTime: false,
      })));
    };

    getCalendarByWeek();
  }, [refreshTrigger]);

  useEffect(() => {
    const getCalendarByYear = async () => {
      const data = await dashboardClient.contarObrigacoesPorMesNoAno(currentYear);
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
      <CalendarHeader 
        calendarView={calendarView} 
        setCalendarView={setCalendarView}
        title="Calendário de Obrigações"
        description="Visualize suas obrigações no calendário"
      />

      <CardContent className="h-full flex flex-col">
        <div className="bg-gray-50 rounded-lg p-4 flex-1 overflow-y-auto">
          {renderContent()}
        </div>
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
            calendarByYear={calendarByYear.map(item => ({ mes: item.mes, quantidade: item.quantidade }))} 
            currentYear={currentYear} 
            navigateYear={navigateYear}
            itemLabel="obrigação"
            itemLabelPlural="obrigações"
          />
        );
    }
  }
}

