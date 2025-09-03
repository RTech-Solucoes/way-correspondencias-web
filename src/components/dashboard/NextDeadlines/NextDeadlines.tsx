import {deadlines} from "@/components/dashboard/MockDados";
import CardHeader from "../card-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ClockIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import dashboardClient from "@/api/dashboard/client";
import { toast } from "sonner";
import { SolicitacaoPrazo } from "@/api/dashboard/type";
import { getStatusColor } from "../functions";
import { formatarDataHora } from "@/utils/FormattDate";


export default function NextDeadlines() {

  const [listDeadline, setListDeadline] = useState<SolicitacaoPrazo[]>([]);

  useEffect(() => {
    const getRecentDeadline = async () => {
      try {
        const data = await dashboardClient.getRecentDeadline();
        setListDeadline(data);
      } catch (error) {
        console.error("Erro ao buscar prazos:", error);
        toast.error("Não foi possível carregar os próximos prazos.");
      }
    };

    getRecentDeadline();
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Próximos Prazos"
        description="Obrigações com vencimento próximo"
      />
      <CardContent>
        <div className="space-y-4">
          {listDeadline.map((deadline) => (
            <div key={deadline.idSolicitacao} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(deadline.nmStatus)}`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{deadline.nmTema}</div>
                <div className="flex items-center text-xs text-gray-500">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  {formatarDataHora(deadline.dtFim)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 mt-auto">
        <Button variant="outline" className="w-full">Ver Todos os Prazos</Button>
      </CardFooter>
    </Card>
  )
}