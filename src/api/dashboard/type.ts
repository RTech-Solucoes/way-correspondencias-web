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
    dtCriacaoFormatada: string;
}

export interface PaginatedResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    numberOfElements: number;
    first: boolean;
    empty: boolean;
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
    nmResponsavel: string;
    cdIdentificacao: string;
}

export interface ICalendar {
    idSolicitacaoPrazo: number;
    idSolicitacao: number;
    idStatusSolicitacao: number;
    nmStatus: string;
    cdIdentificacao: string;
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

export interface ICalendarYear {
    mes: string;
    qtde: number;
}

export interface SolicitacaoCountResponse {
    quantidadeCorrespondencias: number;
    quantidadeObrigacoes: number;
}