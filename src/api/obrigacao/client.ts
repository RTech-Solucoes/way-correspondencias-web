import ApiClient from "../client";
import { ObrigacaoResponse, ObrigacaoRequest, ObrigacaoDetalheResponse } from "./types";
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

    async buscarFiltroPaginado(page: number = 0, size: number = 10, search?: string): Promise<PaginatedResponse<ObrigacaoResponse>> {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
        });

        if (search) {
            params.append('search', search);
        }

        return this.client.request<PaginatedResponse<ObrigacaoResponse>>(`?${params.toString()}`, {
            method: 'GET',
        });
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

}

const obrigacaoContratualClient = new ObrigacaoClient();
export default obrigacaoContratualClient;
