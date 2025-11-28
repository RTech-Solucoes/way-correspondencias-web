import { SolicitacaoResumoResponse } from "@/types/solicitacoes/types";
import ApiClient from "../client";
import { DashboardListSummary, DashboardOverview, ICalendar, ICalendarYear, IRecentActivity, PaginatedResponse, SolicitacaoCountResponse, SolicitacaoPrazo } from "./type";
import { buildQueryParams } from "@/utils/utils";

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
        return this.client.request<DashboardOverview[]>(`/overview${qs ? `?${qs}` : ''}`, {
            method: 'GET',
        });
    }

    async getRecentOverview(page: number, size: number): Promise<PaginatedResponse<DashboardListSummary>> {
        return this.client.request<PaginatedResponse<DashboardListSummary>>(`/list-summary?page=${page}&size=${size}`, {
            method: "GET",
        });
    }

    async getRecentDeadline(page: number, size: number): Promise<PaginatedResponse<SolicitacaoPrazo>> {
        return this.client.request<PaginatedResponse<SolicitacaoPrazo>>(`/recent-deadline?page=${page}&size=${size}`, {
            method: "GET",
        });
    }

    async getRecentActivity(page: number, size: number): Promise<PaginatedResponse<IRecentActivity>> {
        return this.client.request<PaginatedResponse<IRecentActivity>>(`/recent-activity?page=${page}&size=${size}`, {
            method: "GET",
        });
    }

    async getCalendarByWeek(): Promise<ICalendar[]> {
        return this.client.request<ICalendar[]>(`/list-by-week`, {
            method: "GET",
        });
    }

    async getCalendarByMonth(mes: number, ano: number): Promise<ICalendar[]> {
        return this.client.request<ICalendar[]>(`/list-by-mouth?mes=${mes}&ano=${ano}`, {
            method: "GET",
        });
    }

    async getCalendarByYear(ano: number): Promise<ICalendarYear[]> {
        return this.client.request<ICalendarYear[]>(`/list-by-month-in-year?ano=${ano}`, {
            method: "GET",
        });
    }

    async getSolicitacoesPendentes(): Promise<SolicitacaoResumoResponse[]> {
        return this.client.request<SolicitacaoResumoResponse[]>(`/solicitacoes-pendentes`, {
            method: "GET",
        });
    }

    async getSolicitacoesPendentesCount(): Promise<SolicitacaoCountResponse> {
        return this.client.request<SolicitacaoCountResponse>(`/solicitacoes-pendentes/count`, {
            method: "GET",
        });
    }

}

export const dashboardClient = new DashboardClient();
export default dashboardClient;