import { RecentActivityObrigacoes } from "../obrigacao";
import TasksStatusBoard from "./TasksStatusBoard";
import { TipoEnum } from "@/api/tipos/types";

interface TasksStatusBoardObrigacoesProps {
  refreshTrigger?: number;
}

export default function TasksStatusBoardObrigacoes({ refreshTrigger }: TasksStatusBoardObrigacoesProps) {
  return (
    <div className="flex flex-row gap-6 min-h-[600px]">
      <div className="w-[65%] h-full">
        <TasksStatusBoard
          refreshTrigger={refreshTrigger}
          cdTipoFluxo={TipoEnum.OBRIGACAO}
          cdTipoStatus={[TipoEnum.TODOS, TipoEnum.OBRIGACAO]}
          title="Visão Geral de Obrigações"
          description="Status de todas as obrigações contratuais"
          showPendentes={true}
          showRecent={true}
        />
      </div>
      <div className="w-[35%] h-full">
        <RecentActivityObrigacoes
          refreshTrigger={refreshTrigger}
        />
      </div>
    </div>
  );
}

