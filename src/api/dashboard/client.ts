import ApiClient from "../client";
import { SolicitacaoResponse } from "../solicitacoes/types";
import { DashboardListSummary, DashboardOverview, ICalendar, IRecentActivity, PaginatedResponse, SolicitacaoPrazo } from "./type";

class DashboardClient {
    private client: ApiClient;

    constructor() {
        this.client = new ApiClient('/dashboard');
    }

    async getOverview(): Promise<DashboardOverview[]> {
        return this.client.request<DashboardOverview[]>(`/overview`, {
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

    async getCalendarByYear(ano: number): Promise<ICalendar[]> {
        return this.client.request<ICalendar[]>(`/list-by-month-in-year?ano=${ano}`, {
            method: "GET",
        });
    }

    async getSolicitacoesPendentes(): Promise<SolicitacaoResponse[]> {
        return this.client.request<SolicitacaoResponse[]>(`/solicitacoes-pendentes`, {
            method: "GET",
        });
    }

    async getSolicitacoesPendentesCount(): Promise<number> {
        return this.client.request<number>(`/solicitacoes-pendentes/count`, {
            method: "GET",
        });
    }

}

export const dashboardClient = new DashboardClient();
export default dashboardClient;