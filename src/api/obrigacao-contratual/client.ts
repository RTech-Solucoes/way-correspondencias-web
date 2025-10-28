import ApiClient from "../client";
import { ObrigacaoContratualRequest, ObrigacaoContratualResponse } from "./types";

export interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export class ObrigacaoContratualClient {
    private client: ApiClient;

    constructor() {
        this.client = new ApiClient('/obrigacao-contratual');
    }

    async buscarFiltroPaginado(page: number = 0, size: number = 10, search?: string): Promise<PaginatedResponse<ObrigacaoContratualResponse>> {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
        });

        if (search) {
            params.append('search', search);
        }

        return this.client.request<PaginatedResponse<ObrigacaoContratualResponse>>(`?${params.toString()}`, {
            method: 'GET',
        });
    }

    async buscarPorId(id: number): Promise<ObrigacaoContratualResponse> {
        return this.client.request<ObrigacaoContratualResponse>(`/${id}`, {
            method: 'GET',
        });
    }

    async criar(data: ObrigacaoContratualRequest): Promise<ObrigacaoContratualResponse> {
        return this.client.request<ObrigacaoContratualResponse>('', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async atualizar(id: number, data: ObrigacaoContratualRequest): Promise<ObrigacaoContratualResponse> {
        return this.client.request<ObrigacaoContratualResponse>(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deletar(id: number): Promise<void> {
        return this.client.request<void>(`/${id}`, {
            method: 'DELETE',
        });
    }

    async salvarStep1(data: Partial<ObrigacaoContratualRequest>): Promise<void> {
    
    }

    async salvarStep2(data: Partial<ObrigacaoContratualRequest>): Promise<void> {

    }

    async salvarStep3(data: Partial<ObrigacaoContratualRequest>): Promise<void> {

    }

    async salvarStep4(data: Partial<ObrigacaoContratualRequest>): Promise<void> {

    }

    async salvarStep5(data: Partial<ObrigacaoContratualRequest>): Promise<void> {

    }

    async salvarStep6(data: Partial<ObrigacaoContratualRequest>): Promise<void> {

    }
}

const obrigacaoContratualClient = new ObrigacaoContratualClient();
export default obrigacaoContratualClient;
