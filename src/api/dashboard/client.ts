import ApiClient from "../client";
import { AreaRankingDTO, DashboardListSummary, DashboardOverview, ICalendar, ICalendarYear, IRecentActivity, ObrigacaoAreaTemaDTO, ObrigacaoPendenteResponse, ObrigacaoPrazoResponse, ObrigacaoRecentActivityDTO, ObrigacaoTempoMedioResponse, PaginatedResponse, SolicitacaoCountResponse, SolicitacaoPrazo } from "./type";
import { buildQueryParams } from "@/utils/utils";
import { ObrigacaoCalendarioResponse, ObrigacaoCalendarioMesCountResponse } from "../obrigacao/types";
import { CorrespondenciaResumoResponse } from "../correspondencia/types";

interface DateFilterParams {
    dtCriacaoInicio?: string | null;
    dtCriacaoFim?: string | null;
}

interface ObrigacaoDateFilterParams {
    dtLimiteInicio?: string | null;
    dtLimiteFim?: string | null;
    dtTerminoInicio?: string | null;
    dtTerminoFim?: string | null;
}

interface OverviewParams extends DateFilterParams, ObrigacaoDateFilterParams {
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
        const queryParams = params
            ? buildQueryParams(
                params,
                ['cdTipoFluxo', 'nmCategoriaFluxo', 'nmCategoriaStatus', 'dtCriacaoInicio', 'dtCriacaoFim', 'dtLimiteInicio', 'dtLimiteFim', 'dtTerminoInicio', 'dtTerminoFim'] as const
            )
            : new URLSearchParams();
        
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

    async getRecentOverview(
        page: number,
        size: number,
        filters?: DateFilterParams
    ): Promise<PaginatedResponse<DashboardListSummary>> {
        const qs = buildQueryParams(
            { page, size, dtCriacaoInicio: filters?.dtCriacaoInicio, dtCriacaoFim: filters?.dtCriacaoFim },
            ['page', 'size', 'dtCriacaoInicio', 'dtCriacaoFim'] as const
        ).toString();
        return this.client.request<PaginatedResponse<DashboardListSummary>>(`/listar-resumo${qs ? `?${qs}` : ''}`, {
            method: "GET",
        });
    }

    async getRecentDeadline(
        page: number,
        size: number,
        filters?: DateFilterParams
    ): Promise<PaginatedResponse<SolicitacaoPrazo>> {
        const qs = buildQueryParams(
            { page, size, dtCriacaoInicio: filters?.dtCriacaoInicio, dtCriacaoFim: filters?.dtCriacaoFim },
            ['page', 'size', 'dtCriacaoInicio', 'dtCriacaoFim'] as const
        ).toString();
        return this.client.request<PaginatedResponse<SolicitacaoPrazo>>(`/prazos-recentes${qs ? `?${qs}` : ''}`, {
            method: "GET",
        });
    }

    async getRecentActivity(
        page: number,
        size: number,
        filters?: DateFilterParams
    ): Promise<PaginatedResponse<IRecentActivity>> {
        const qs = buildQueryParams(
            { page, size, dtCriacaoInicio: filters?.dtCriacaoInicio, dtCriacaoFim: filters?.dtCriacaoFim },
            ['page', 'size', 'dtCriacaoInicio', 'dtCriacaoFim'] as const
        ).toString();
        return this.client.request<PaginatedResponse<IRecentActivity>>(`/atividade-recente${qs ? `?${qs}` : ''}`, {
            method: "GET",
        });
    }

    async getCalendarByWeek(filters?: DateFilterParams): Promise<ICalendar[]> {
        const qs = buildQueryParams(
            { dtCriacaoInicio: filters?.dtCriacaoInicio, dtCriacaoFim: filters?.dtCriacaoFim },
            ['dtCriacaoInicio', 'dtCriacaoFim'] as const
        ).toString();
        return this.client.request<ICalendar[]>(`/listar-por-semana${qs ? `?${qs}` : ''}`, {
            method: "GET",
        });
    }

    async getCalendarByMonth(
        mes: number,
        ano: number,
        filters?: DateFilterParams
    ): Promise<ICalendar[]> {
        const qs = buildQueryParams(
            { mes, ano, dtCriacaoInicio: filters?.dtCriacaoInicio, dtCriacaoFim: filters?.dtCriacaoFim },
            ['mes', 'ano', 'dtCriacaoInicio', 'dtCriacaoFim'] as const
        ).toString();
        return this.client.request<ICalendar[]>(`/listar-por-mes${qs ? `?${qs}` : ''}`, {
            method: "GET",
        });
    }

    async getCalendarByYear(ano: number, filters?: DateFilterParams): Promise<ICalendarYear[]> {
        const qs = buildQueryParams(
            { ano, dtCriacaoInicio: filters?.dtCriacaoInicio, dtCriacaoFim: filters?.dtCriacaoFim },
            ['ano', 'dtCriacaoInicio', 'dtCriacaoFim'] as const
        ).toString();
        return this.client.request<ICalendarYear[]>(`/listar-meses-do-ano${qs ? `?${qs}` : ''}`, {
            method: "GET",
        });
    }

    async getSolicitacoesPendentes(filters?: DateFilterParams): Promise<CorrespondenciaResumoResponse[]> {
        const qs = buildQueryParams(
            { dtCriacaoInicio: filters?.dtCriacaoInicio, dtCriacaoFim: filters?.dtCriacaoFim },
            ['dtCriacaoInicio', 'dtCriacaoFim'] as const
        ).toString();
        return this.client.request<CorrespondenciaResumoResponse[]>(`/solicitacoes-pendentes${qs ? `?${qs}` : ''}`, {
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

    async buscarCalendarioObrigacoes(
        dataInicio?: string,
        dataFim?: string,
        filters?: ObrigacaoDateFilterParams
    ): Promise<ObrigacaoCalendarioResponse[]> {
        const qs = buildQueryParams(
            { dataInicio, dataFim, ...filters },
            ['dataInicio', 'dataFim', 'dtLimiteInicio', 'dtLimiteFim', 'dtTerminoInicio', 'dtTerminoFim'] as const
        ).toString();
        return this.client.request<ObrigacaoCalendarioResponse[]>(`/obrigacoes-calendario${qs ? `?${qs}` : ''}`, {
            method: 'GET',
        });
    }

    async contarObrigacoesPorMesNoAno(ano: number, filters?: ObrigacaoDateFilterParams): Promise<ObrigacaoCalendarioMesCountResponse[]> {
        const qs = buildQueryParams(
            { ano, ...filters },
            ['ano', 'dtLimiteInicio', 'dtLimiteFim', 'dtTerminoInicio', 'dtTerminoFim'] as const
        ).toString();
        return this.client.request<ObrigacaoCalendarioMesCountResponse[]>(`/obrigacoes-calendario/contar-por-mes${qs ? `?${qs}` : ''}`, {
            method: 'GET',
        });
    }

    async getObrigacoesRecentActivity(
        page: number,
        size: number,
        filters?: ObrigacaoDateFilterParams
    ): Promise<PaginatedResponse<ObrigacaoRecentActivityDTO>> {
        const qs = buildQueryParams(
            { page, size, ...filters },
            ['page', 'size', 'dtLimiteInicio', 'dtLimiteFim', 'dtTerminoInicio', 'dtTerminoFim'] as const
        ).toString();
        return this.client.request<PaginatedResponse<ObrigacaoRecentActivityDTO>>(
            `/obrigacoes-atividade-recente${qs ? `?${qs}` : ''}`,
            { method: 'GET' }
        );
    }

    async getObrigacoesListSummary(
        page: number,
        size: number,
        filters?: ObrigacaoDateFilterParams
    ): Promise<PaginatedResponse<ObrigacaoAreaTemaDTO>> {
        const qs = buildQueryParams(
            { page, size, ...filters },
            ['page', 'size', 'dtLimiteInicio', 'dtLimiteFim', 'dtTerminoInicio', 'dtTerminoFim'] as const
        ).toString();
        return this.client.request<PaginatedResponse<ObrigacaoAreaTemaDTO>>(
            `/obrigacoes-recentes${qs ? `?${qs}` : ''}`,
            { method: 'GET' }
        );
    }

    async getObrigacoesPorPrazo(filters?: ObrigacaoDateFilterParams): Promise<ObrigacaoPrazoResponse> {
        const qs = buildQueryParams(
            { ...filters },
            ['dtLimiteInicio', 'dtLimiteFim', 'dtTerminoInicio', 'dtTerminoFim'] as const
        ).toString();
        return this.client.request<ObrigacaoPrazoResponse>(
            `/obrigacoes-prazo${qs ? `?${qs}` : ''}`,
            { method: 'GET' }
        );
    }

    async getObrigacoesTempoMedio(filters?: ObrigacaoDateFilterParams): Promise<ObrigacaoTempoMedioResponse> {
        const qs = buildQueryParams(
            { ...filters },
            ['dtLimiteInicio', 'dtLimiteFim', 'dtTerminoInicio', 'dtTerminoFim'] as const
        ).toString();
        return this.client.request<ObrigacaoTempoMedioResponse>(
            `/obrigacoes-tempo-medio${qs ? `?${qs}` : ''}`,
            { method: 'GET' }
        );
    }

    async buscarRankingAreas(idsStatus?: number[], filters?: ObrigacaoDateFilterParams): Promise<AreaRankingDTO[]> {
        const queryParams = buildQueryParams(
            { ...filters },
            ['dtLimiteInicio', 'dtLimiteFim', 'dtTerminoInicio', 'dtTerminoFim'] as const
        );
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
export type { ObrigacaoDateFilterParams };