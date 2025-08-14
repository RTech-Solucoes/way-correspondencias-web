import ApiClient from "../client";
import { AreaResponse, AreaRequest, PagedResponse, AreaFilterParams } from "./types";

class AreasClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/areas');
  }

  async buscarPorId(id: number): Promise<AreaResponse> {
    return this.client.request<AreaResponse>(`/${id}`, {
      method: 'GET',
    });
  }

  async buscarPorFiltro(params: AreaFilterParams = {}): Promise<PagedResponse<AreaResponse>> {
    const queryParams = new URLSearchParams();

    if (params.filtro) queryParams.append('filtro', params.filtro);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    return this.client.request<PagedResponse<AreaResponse>>(endpoint, {
      method: 'GET',
    });
  }

  async criar(area: AreaRequest): Promise<AreaResponse> {
    return this.client.request<AreaResponse>('', {
      method: 'POST',
      body: JSON.stringify(area),
    });
  }

  async atualizar(id: number, area: AreaRequest): Promise<AreaResponse> {
    return this.client.request<AreaResponse>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(area),
    });
  }

  async deletar(id: number): Promise<void> {
    return this.client.request<void>(`/${id}`, {
      method: 'DELETE',
    });
  }
}

export const areasClient = new AreasClient();
export default areasClient;