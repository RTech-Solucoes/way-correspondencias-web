import dashboardClient from "@/api/dashboard/client";
import {DashboardListSummary, DashboardOverview} from "@/api/dashboard/type";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter} from "@/components/ui/card";
import {useEffect, useState} from "react";
import {toast} from "sonner";
import CardHeader from "../card-header";
import {getStatusColor, renderIcon} from "../functions";

export default function TasksStatusBoard() {
  const [visionGeral, setVisionGeral] = useState<DashboardOverview[]>([]);
  const [listSummary, setListSummary] = useState<DashboardListSummary[]>([]);

  useEffect(() => {
    const getOverview = async () => {
      try {
        const data = await dashboardClient.getOverview();
        setVisionGeral(data);
      } catch (error) {
        console.error("Erro ao buscar overview:", error);
        toast.error("Não foi possível carregar os dados do dashboard.");
      }
    };

    const getRecentOverview = async () => {
      try {
        const data = await dashboardClient.getRecentOverview(3);
        setListSummary(data);
      } catch (error) {
        console.error("Erro ao buscar overview:", error);
        toast.error("Não foi possível carregar os dados do dashboard.");
      }
    };

    getRecentOverview();
    getOverview();
  }, []);


  return (
    <Card className="flex flex-col lg:col-span-2">
      <CardHeader
        title="Visão Geral de Obrigações"
        description="Status de todas as obrigações contratuais"
      />
      <CardContent>
        <div className="space-y-4">
          {visionGeral.map((item) => (
            <div key={item.nmStatus} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  {renderIcon(item.nmStatus)}
                  <span>{item.nmStatus}</span>
                </div>
                <span className="font-medium">{item.qtStatus} ({item.qtPercentual}%)</span>
              </div>
              <div className="h-2 bg-gray-100 w-full rounded-full overflow-hidden">
                <div className={`h-full ${getStatusColor(item.nmStatus)}`} style={{ width: `${item.qtPercentual}%` }}></div>
              </div>
            </div>
          ))}
          {visionGeral.length === 0 && (<div className="text-sm text-gray-500">Nenhum dado disponível</div>)}
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">Obrigações Recentes</h4>
          <div className="space-y-3">
            {listSummary.map((task) => (
              <div key={task.idSolicitacao} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div>
                    <div className="font-medium text-sm">{task.nmArea}</div>
                    <div className="text-xs text-gray-500">{task.nmTema}</div>
                  </div>
                </div>
              </div>
            ))}
            {listSummary.length === 0 && (<div className="text-sm text-gray-500">Nenhuma tarefa foi realizada recentemente.</div>)}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 mt-auto">
        <Button variant="outline" className="w-full">Ver Todas as Obrigações</Button>
      </CardFooter>
    </Card>
  )
}
