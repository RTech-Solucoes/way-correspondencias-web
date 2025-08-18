import ApiClient from "../client";
import { SolicitacaoResponse, SolicitacaoRequest, PagedResponse, SolicitacaoFilterParams } from "./types";

class SolicitacoesClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/solicitacoes');
  }

  async buscarPorId(id: number): Promise<SolicitacaoResponse> {
    return this.client.request<SolicitacaoResponse>(`/${id}`, {
      method: 'GET',
    });
  }

  async buscarPorCdIdentificacao(cdIdentificacao: string): Promise<SolicitacaoResponse> {
    return this.client.request<SolicitacaoResponse>(`/identificacao/${encodeURIComponent(cdIdentificacao)}`, {
      method: 'GET',
    });
  }

  async buscarPorResponsavel(idResponsavel: number): Promise<SolicitacaoResponse[]> {
    return this.client.request<SolicitacaoResponse[]>(`/responsavel/${idResponsavel}`, {
      method: 'GET',
    });
  }

  async buscarPorTema(idTema: number): Promise<SolicitacaoResponse[]> {
    return this.client.request<SolicitacaoResponse[]>(`/tema/${idTema}`, {
      method: 'GET',
    });
  }

  async buscarPorArea(idArea: number): Promise<SolicitacaoResponse[]> {
    return this.client.request<SolicitacaoResponse[]>(`/area/${idArea}`, {
      method: 'GET',
    });
  }

  async buscarPorStatus(flStatus: string): Promise<SolicitacaoResponse[]> {
    return this.client.request<SolicitacaoResponse[]>(`/status/${encodeURIComponent(flStatus)}`, {
      method: 'GET',
    });
  }

  async buscarPorPeriodo(inicio: string, fim: string): Promise<SolicitacaoResponse[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('inicio', inicio);
    queryParams.append('fim', fim);

    return this.client.request<SolicitacaoResponse[]>(`/periodo?${queryParams.toString()}`, {
      method: 'GET',
    });
  }

  async buscarPorResponsavelEStatus(idResponsavel: number, flStatus: string): Promise<SolicitacaoResponse[]> {
    return this.client.request<SolicitacaoResponse[]>(`/responsavel/${idResponsavel}/status/${encodeURIComponent(flStatus)}`, {
      method: 'GET',
    });
  }

  async buscarPorAreaEStatus(idArea: number, flStatus: string): Promise<SolicitacaoResponse[]> {
    return this.client.request<SolicitacaoResponse[]>(`/area/${idArea}/status/${encodeURIComponent(flStatus)}`, {
      method: 'GET',
    });
  }

  async buscarPorFiltro(params: SolicitacaoFilterParams = {}): Promise<PagedResponse<SolicitacaoResponse>> {
    const queryParams = new URLSearchParams();

    if (params.filtro) queryParams.append('filtro', params.filtro);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    return this.client.request<PagedResponse<SolicitacaoResponse>>(endpoint, {
      method: 'GET',
    });
  }

  async criar(solicitacao: SolicitacaoRequest): Promise<SolicitacaoResponse> {
    return this.client.request<SolicitacaoResponse>('', {
      method: 'POST',
      body: JSON.stringify(solicitacao),
    });
  }

  async atualizar(id: number, solicitacao: SolicitacaoRequest): Promise<SolicitacaoResponse> {
    return this.client.request<SolicitacaoResponse>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(solicitacao),
    });
  }

  async deletar(id: number): Promise<void> {
    return this.client.request<void>(`/${id}`, {
      method: 'DELETE',
    });
  }
}

export const solicitacoesClient = new SolicitacoesClient();
export default solicitacoesClient;