import ApiClient from "../client";
import { TemaResponse, TemaRequest, PagedResponse, TemaFilterParams } from "./types";

class TemasClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/temas');
  }

  async buscarPorId(id: number): Promise<TemaResponse> {
    return this.client.request<TemaResponse>(`/${id}`, {
      method: 'GET',
    });
  }

  async buscarPorNmTema(nmTema: string): Promise<TemaResponse> {
    return this.client.request<TemaResponse>(`/nmTema/${encodeURIComponent(nmTema)}`, {
      method: 'GET',
    });
  }

  async buscarPorFiltro(params: TemaFilterParams = {}): Promise<PagedResponse<TemaResponse>> {
    const queryParams = new URLSearchParams();

    if (params.filtro) queryParams.append('filtro', params.filtro);
    if (params.nmTema) queryParams.append('nmTema', params.nmTema);
    if (params.dsTema) queryParams.append('dsTema', params.dsTema);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    return this.client.request<PagedResponse<TemaResponse>>(endpoint, {
      method: 'GET',
    });
  }

  async buscarPorFiltroComAreas(params: TemaFilterParams = {}): Promise<PagedResponse<TemaResponse>> {
    const queryParams = new URLSearchParams();

    if (params.filtro) queryParams.append('filtro', params.filtro);
    if (params.nmTema) queryParams.append('nmTema', params.nmTema);
    if (params.dsTema) queryParams.append('dsTema', params.dsTema);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/com-areas?${queryString}` : '/com-areas';

    return this.client.request<PagedResponse<TemaResponse>>(endpoint, {
      method: 'GET',
    });
  }

  async buscarPorIdComAreas(id: number): Promise<TemaResponse> {
    return this.client.request<TemaResponse>(`/${id}/com-areas`, {
      method: 'GET',
    });
  }

  async criar(tema: TemaRequest): Promise<TemaResponse> {
    return this.client.request<TemaResponse>('', {
      method: 'POST',
      body: JSON.stringify(tema),
    });
  }

  async atualizar(id: number, tema: TemaRequest): Promise<TemaResponse> {
    return this.client.request<TemaResponse>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tema),
    });
  }

  async deletar(id: number): Promise<void> {
    return this.client.request<void>(`/${id}`, {
      method: 'DELETE',
    });
  }
}

export const temasClient = new TemasClient();
export default temasClient;