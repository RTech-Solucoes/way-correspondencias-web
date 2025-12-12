import { SolicitacaoResumoResponse } from "@/types/solicitacoes/types";
import ApiClient from "../client";
import { AreaRankingDTO, DashboardListSummary, DashboardOverview, ICalendar, ICalendarYear, IRecentActivity, ObrigacaoAreaTemaDTO, ObrigacaoPendenteResponse, ObrigacaoPrazoResponse, ObrigacaoRecentActivityDTO, ObrigacaoTempoMedioResponse, PaginatedResponse, SolicitacaoCountResponse, SolicitacaoPrazo } from "./type";
import { buildQueryParams } from "@/utils/utils";
import { ObrigacaoCalendarioResponse, ObrigacaoCalendarioMesCountResponse } from "../obrigacao/types";

interface OverviewParams {
    cdTipoFluxo?: string;
    nmCategoriaFluxo?: string;
    cdTipoStatus?: string[];
    nmCategoriaStatus?: string;
}

class DashboardClient {
    private client: ApiClient;

    constructor() {
        this.client = new ApiClient('/dashboard');
    }

    async getOverview(params?: OverviewParams): Promise<DashboardOverview[]> {
        const queryParams = params ? buildQueryParams(params, ['cdTipoFluxo', 'nmCategoriaFluxo', 'nmCategoriaStatus'] as const) : new URLSearchParams();
        
        // Tratar arrays manualmente (cdTipoStatus)
        if (params?.cdTipoStatus && params.cdTipoStatus.length > 0) {
            params.cdTipoStatus.forEach(tipo => {
                queryParams.append('cdTipoStatus', tipo);
            });
        }
        
        const qs = queryParams.toString();
        return this.client.request<DashboardOverview[]>(`/visao-geral${qs ? `?${qs}` : ''}`, {
            method: 'GET',
        });
    }

    async getRecentOverview(page: number, size: number): Promise<PaginatedResponse<DashboardListSummary>> {
        return this.client.request<PaginatedResponse<DashboardListSummary>>(`/listar-resumo?page=${page}&size=${size}`, {
            method: "GET",
        });
    }

    async getRecentDeadline(page: number, size: number): Promise<PaginatedResponse<SolicitacaoPrazo>> {
        return this.client.request<PaginatedResponse<SolicitacaoPrazo>>(`/prazos-recentes?page=${page}&size=${size}`, {
            method: "GET",
        });
    }

    async getRecentActivity(page: number, size: number): Promise<PaginatedResponse<IRecentActivity>> {
        return this.client.request<PaginatedResponse<IRecentActivity>>(`/atividade-recente?page=${page}&size=${size}`, {
            method: "GET",
        });
    }

    async getCalendarByWeek(): Promise<ICalendar[]> {
        return this.client.request<ICalendar[]>(`/listar-por-semana`, {
            method: "GET",
        });
    }

    async getCalendarByMonth(mes: number, ano: number): Promise<ICalendar[]> {
        return this.client.request<ICalendar[]>(`/listar-por-mes?mes=${mes}&ano=${ano}`, {
            method: "GET",
        });
    }

    async getCalendarByYear(ano: number): Promise<ICalendarYear[]> {
        return this.client.request<ICalendarYear[]>(`/listar-meses-do-ano?ano=${ano}`, {
            method: "GET",
        });
    }

    async getSolicitacoesPendentes(): Promise<SolicitacaoResumoResponse[]> {
        return this.client.request<SolicitacaoResumoResponse[]>(`/solicitacoes-pendentes`, {
            method: "GET",
        });
    }

    async getObrigacoesPendentes(): Promise<ObrigacaoPendenteResponse[]> {
        return this.client.request<ObrigacaoPendenteResponse[]>(`/obrigacoes-pendentes`, {
            method: "GET",
        });
    }

    async getSolicitacoesPendentesCount(): Promise<SolicitacaoCountResponse> {
        return this.client.request<SolicitacaoCountResponse>(`/solicitacoes-pendentes/count`, {
            method: "GET",
        });
    }

    async buscarCalendarioObrigacoes(dataInicio?: string, dataFim?: string): Promise<ObrigacaoCalendarioResponse[]> {
        
        const allowedKeys = ['dataInicio', 'dataFim'] as const;

        const qs = buildQueryParams({ dataInicio, dataFim }, allowedKeys).toString();
        return this.client.request<ObrigacaoCalendarioResponse[]>(`/obrigacoes-calendario${qs ? `?${qs}` : ''}`, {
            method: 'GET',
        });
    }

    async contarObrigacoesPorMesNoAno(ano: number): Promise<ObrigacaoCalendarioMesCountResponse[]> {
        return this.client.request<ObrigacaoCalendarioMesCountResponse[]>(`/obrigacoes-calendario/contar-por-mes?ano=${ano}`, {
            method: 'GET',
        });
    }

    async getObrigacoesRecentActivity(page: number, size: number): Promise<PaginatedResponse<ObrigacaoRecentActivityDTO>> {
        return this.client.request<PaginatedResponse<ObrigacaoRecentActivityDTO>>(
            `/obrigacoes-atividade-recente?page=${page}&size=${size}`,
            { method: 'GET' }
        );
    }

    async getObrigacoesListSummary(page: number, size: number): Promise<PaginatedResponse<ObrigacaoAreaTemaDTO>> {
        return this.client.request<PaginatedResponse<ObrigacaoAreaTemaDTO>>(
            `/obrigacoes-recentes?page=${page}&size=${size}`,
            { method: 'GET' }
        );
    }

    async getObrigacoesPorPrazo(): Promise<ObrigacaoPrazoResponse> {
        return this.client.request<ObrigacaoPrazoResponse>(
            `/obrigacoes-prazo`,
            { method: 'GET' }
        );
    }

    async getObrigacoesTempoMedio(): Promise<ObrigacaoTempoMedioResponse> {
        return this.client.request<ObrigacaoTempoMedioResponse>(
            `/obrigacoes-tempo-medio`,
            { method: 'GET' }
        );
    }

    async buscarRankingAreas(idsStatus?: number[]): Promise<AreaRankingDTO[]> {
        const queryParams = new URLSearchParams();
        if (idsStatus && idsStatus.length > 0) {
            idsStatus.forEach(id => {
                queryParams.append('idsStatus', id.toString());
            });
        }
        const qs = queryParams.toString();
        return this.client.request<AreaRankingDTO[]>(
            `/ranking-areas${qs ? `?${qs}` : ''}`,
            { method: 'GET' }
        );
    }

}

export const dashboardClient = new DashboardClient();
export default dashboardClient;