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
    { id: 1, nmStatus: StatusObrigacao.NAO_INICIADO },
    { id: 2, nmStatus: StatusObrigacao.PENDENTE },
    { id: 3, nmStatus: StatusObrigacao.EM_ANDAMENTO },
    { id: 4, nmStatus: StatusObrigacao.EM_VALIDACAO_REGULATORIO },
    { id: 5, nmStatus: StatusObrigacao.ATRASADA },
    { id: 6, nmStatus: StatusObrigacao.CONCLUIDO },
    { id: 7, nmStatus: StatusObrigacao.NAO_APLICAVEL_SUSPENSA },
]
