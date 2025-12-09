import TasksStatusBoard from "./TasksStatusBoard";
import { TipoEnum } from "@/api/tipos/types";

interface TasksStatusBoardObrigacoesProps {
  refreshTrigger?: number;
}

export default function TasksStatusBoardObrigacoes({ refreshTrigger }: TasksStatusBoardObrigacoesProps) {
  return (
    <TasksStatusBoard
      refreshTrigger={refreshTrigger}
      cdTipoFluxo={TipoEnum.OBRIGACAO}
      cdTipoStatus={[TipoEnum.TODOS, TipoEnum.OBRIGACAO]}
      title="Visão Geral de Obrigações"
      description="Status de todas as obrigações contratuais"
      showPendentes={true}
      showRecent={true}
    />
  );
}

