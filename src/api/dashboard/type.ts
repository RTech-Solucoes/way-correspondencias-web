export interface DashboardOverview {
    nmStatus: string;
    qtStatus: number;
    qtTotal: number;
    qtPercentual: number;
}

export interface DashboardListSummary {
    idSolicitacao: number;
    idArea: number;
    nmArea: string;
    nmTema: string;
}

export interface SolicitacaoPrazo {
    idSolicitacaoPrazo: number;
    idSolicitacao: number;
    idStatusSolicitacao: number;
    nmStatus: string;
    nrPrazoInterno: number;
    tpPrazo: string;
    dtInicio: string;
    dtFim: string;
    minutosRestantes: number;
    estourou: 0 | 1;
    nmTema: string;
}

export interface IRecentActivity {
    id: number;
    dsAssunto: string;
    dtCriacao: string;
    tempoDecorrido: string;
    nmTema: string;
    nrProcesso: string;
}

export interface ICalendar {
    idSolicitacaoPrazo: number;
    idSolicitacao: number;
    idStatusSolicitacao: number;
    nmStatus: string;
    idTema: number;
    nmTema: string;
    nrPrazoInterno: number;
    tpPrazo: string;
    dtInicio: string;
    dtFim: string;
    minutosRestantes: number;
    estourou: number;
    estourado: boolean;
}