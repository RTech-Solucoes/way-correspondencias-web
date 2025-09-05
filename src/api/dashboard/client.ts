import ApiClient from "../client";
import { DashboardListSummary, DashboardOverview, ICalendar, IRecentActivity, SolicitacaoPrazo } from "./type";

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

    async getRecentOverview(qtd: number): Promise<DashboardListSummary[]> {
        return this.client.request<DashboardListSummary[]>(`/list-summary?qtd=${qtd}`, {
            method: "GET",
        });
    }

    async getRecentDeadline(): Promise<SolicitacaoPrazo[]> {
        return this.client.request<SolicitacaoPrazo[]>(`/recent-deadline`, {
            method: "GET",
        });
    }

    async getRecentActivity(dia: number): Promise<IRecentActivity[]> {
        return this.client.request<IRecentActivity[]>(`/recent-activity?dia=${dia}`, {
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
}

export const dashboardClient = new DashboardClient();
export default dashboardClient;