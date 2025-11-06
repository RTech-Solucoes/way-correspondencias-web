import { buildQueryParams } from "@/utils/utils";
import ApiClient from "../client";
import { ObrigacaoResponse, ObrigacaoRequest, ObrigacaoDetalheResponse, ObrigacaoFiltroRequest } from "./types";
import { ObrigacaoFormData } from "@/components/obrigacoes/ObrigacaoModal";

export interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export class ObrigacaoClient {
    private client: ApiClient;

    constructor() {
        this.client = new ApiClient('/obrigacoes');
    }

    async buscarPorId(id: number): Promise<ObrigacaoResponse> {
        return this.client.request<ObrigacaoResponse>(`/${id}`, {
            method: 'GET',
        });
    }

    async atualizar(id: number, data: ObrigacaoRequest): Promise<ObrigacaoResponse> {
        return this.client.request<ObrigacaoResponse>(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deletar(id: number): Promise<void> {
        return this.client.request<void>(`/${id}`, {
            method: 'DELETE',
        });
    }

    async criar(data: ObrigacaoFormData): Promise<ObrigacaoResponse> {
          
        if (data.idSolicitacao) {
            return await this.client.request<ObrigacaoResponse>(`/${data.idSolicitacao}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
        }
    
        return await this.client.request<ObrigacaoResponse>('', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async buscarDetalhePorId(id: number): Promise<ObrigacaoDetalheResponse> {
        return this.client.request<ObrigacaoDetalheResponse>(`/detalhe/${id}`, {
            method: 'GET',
        });
    }

    async buscarLista(filtro: ObrigacaoFiltroRequest = {}): Promise<PaginatedResponse<ObrigacaoResponse>> {

        const allowedKeys = [
            'filtro',
            'page',
            'size',
            'sort',
            'idStatusSolicitacao',
            'idAreaAtribuida',
            'dtLimiteInicio',
            'dtLimiteFim',
            'dtInicioInicio',
            'dtInicioFim',
            'idTema',
            'idTipoClassificacao',
            'idTipoPeriodicidade',
        ] as const;

        const qs = buildQueryParams(filtro, allowedKeys).toString();
        return this.client.request<PaginatedResponse<ObrigacaoResponse>>(`?${qs}`, {
            method: 'GET',
        });
    }

    async importarObrigacoesExcel(file: File): Promise<{ mensagem: string; obrigacoesImportadas: number }> {
        const formData = new FormData();
        formData.append('file', file);

        return this.client.request<{ mensagem: string; obrigacoesImportadas: number }>('/importar-excel', {
            method: 'POST',
            body: formData,
        });
    }

    async replicarObrigacoesPorPeriodicidade(id: number): Promise<{ mensagem: string; obrigacaoReplicada: boolean }> {
        return this.client.request<{ mensagem: string; obrigacaoReplicada: boolean }>(`/replicar-periodicidade/${id}`, {
            method: 'POST',
        });
    }

}

const obrigacaoClient = new ObrigacaoClient();
export default obrigacaoClient;
