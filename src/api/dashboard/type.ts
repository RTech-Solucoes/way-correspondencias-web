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