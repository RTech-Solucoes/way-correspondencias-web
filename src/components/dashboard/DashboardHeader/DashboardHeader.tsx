import {Button} from "@/components/ui/button";
import {ArrowClockwiseIcon} from "@phosphor-icons/react";
import { TipoEnum } from "@/api/tipos/types";

interface IDashboardHeader {
  lastUpdated: Date | null;
  refreshData: () => void;
  tipoFluxo?: TipoEnum;
}

export default function DashboardHeader(props: IDashboardHeader) {
  const isObrigacao = props.tipoFluxo === TipoEnum.OBRIGACAO;
  const title = isObrigacao ? "Dashboard - Obrigações" : "Dashboard - Correspondências";
  const description = isObrigacao 
    ? "Visão geral das obrigações e métricas importantes"
    : "Visão geral das correspondências e métricas importantes";

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold mb-4 text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">
          {description}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">
          Última atualização: {props.lastUpdated ? props.lastUpdated.toLocaleTimeString() : '--:--:--'}
        </span>
        <Button variant="ghost" size="sm" onClick={props.refreshData}>
          <ArrowClockwiseIcon className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>
    </div>
  )
}