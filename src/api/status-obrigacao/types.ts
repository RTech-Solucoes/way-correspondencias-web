export interface StatusObrigacaoResponse {
  id: number;
  nmStatus: string;
  dsStatus?: string;
}

export enum StatusObrigacao {
    NAO_INICIADO = 'NAO_INICIADO',
    PENDENTE = 'PENDENTE',
    EM_ANDAMENTO = 'EM_ANDAMENTO',
    EM_VALIDACAO_REGULATORIO = 'EM_VALIDACAO_REGULATORIO',
    ATRASADA = 'ATRASADA',
    CONCLUIDO = 'CONCLUIDO',
    NAO_APLICAVEL_SUSPENSA = 'NAO_APLICAVEL_SUSPENSA',
}

export const statusObrigacaoLabels: Record<StatusObrigacao, string> = {
    [StatusObrigacao.NAO_INICIADO]: 'Não Iniciado',
    [StatusObrigacao.PENDENTE]: 'Pendente',
    [StatusObrigacao.EM_ANDAMENTO]: 'Em Andamento',
    [StatusObrigacao.EM_VALIDACAO_REGULATORIO]: 'Em Validação (Regulatório)',
    [StatusObrigacao.ATRASADA]: 'Atrasada',
    [StatusObrigacao.CONCLUIDO]: 'Concluído',
    [StatusObrigacao.NAO_APLICAVEL_SUSPENSA]: 'Não Aplicável/Suspensa',
}

export const statusObrigacaoList: StatusObrigacaoResponse[] = [
    { id: 12, nmStatus: StatusObrigacao.NAO_INICIADO },
    { id: 13, nmStatus: StatusObrigacao.PENDENTE },
    { id: 14, nmStatus: StatusObrigacao.EM_ANDAMENTO },
    { id: 15, nmStatus: StatusObrigacao.EM_VALIDACAO_REGULATORIO },
    { id: 16, nmStatus: StatusObrigacao.ATRASADA },
    { id: 9, nmStatus: StatusObrigacao.CONCLUIDO },
    { id: 17, nmStatus: StatusObrigacao.NAO_APLICAVEL_SUSPENSA },
];

export const statusListObrigacao: Record<StatusObrigacao, StatusObrigacaoResponse>= {
    [StatusObrigacao.NAO_INICIADO]: statusObrigacaoList[0],
    [StatusObrigacao.PENDENTE]: statusObrigacaoList[1],
    [StatusObrigacao.EM_ANDAMENTO]: statusObrigacaoList[2],
    [StatusObrigacao.EM_VALIDACAO_REGULATORIO]: statusObrigacaoList[3],
    [StatusObrigacao.ATRASADA]: statusObrigacaoList[4],
    [StatusObrigacao.CONCLUIDO]: statusObrigacaoList[5],
    [StatusObrigacao.NAO_APLICAVEL_SUSPENSA]: statusObrigacaoList[6],
};
