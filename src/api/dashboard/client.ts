import ApiClient from "../client";
import { DashboardListSummary, DashboardOverview, SolicitacaoPrazo } from "./type";

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
}

export const dashboardClient = new DashboardClient();
export default dashboardClient;