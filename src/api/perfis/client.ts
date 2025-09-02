import ApiClient from "../client";
import { PagedResponse } from "../interfaces/request/PagedResponse";
import { PerfilFilterParams } from "../interfaces/request/PerfilFilterParams";
import { PerfilRequest } from "../interfaces/request/PerfilRequest";
import { PerfilResponse } from "../interfaces/response/PerfilResponse";

class PerfisClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/api/perfis');
  }

  async buscarPorId(id: number): Promise<PerfilResponse> {
    return this.client.request<PerfilResponse>(`/${id}`, {
      method: 'GET',
    });
  }

  async buscarPorFiltro(params: PerfilFilterParams = {}): Promise<PagedResponse<PerfilResponse>> {
    const queryParams = new URLSearchParams();

    if (params.filtro) queryParams.append('filtro', params.filtro);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    return this.client.request<PagedResponse<PerfilResponse>>(endpoint, {
      method: 'GET',
    });
  }

  async criar(perfil: PerfilRequest): Promise<PerfilResponse> {
    return this.client.request<PerfilResponse>('', {
      method: 'POST',
      body: JSON.stringify(perfil),
    });
  }

  async atualizar(id: number, perfil: PerfilRequest): Promise<PerfilResponse> {
    return this.client.request<PerfilResponse>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(perfil),
    });
  }

  async deletar(id: number): Promise<void> {
    return this.client.request<void>(`/${id}`, {
      method: 'DELETE',
    });
  }
}

export const perfisClient = new PerfisClient();
export default perfisClient;
