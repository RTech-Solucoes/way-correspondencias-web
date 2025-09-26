import {Button} from "@/components/ui/button";
import PageTitle from "@/components/ui/page-title";
import {ArrowClockwiseIcon} from "@phosphor-icons/react";

interface IDashboardHeader {
  lastUpdated: Date | null;
  refreshData: () => void;
}

export default function DashboardHeader(props: IDashboardHeader) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <PageTitle />
        <p className="text-gray-500 mt-1">
          Visão geral do sistema e métricas importantes
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