import ApiClient from "../client";
import { TramitacaoResponse, PagedResponse, TramitacaoFilterParams } from "./types";

class TramitacaoClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/tramitacao');
  }

  async buscarPorId(id: number): Promise<TramitacaoResponse> {
    return this.client.request<TramitacaoResponse>(`/${id}`, {
      method: 'GET',
    });
  }

  async buscarPorFiltro(params: TramitacaoFilterParams = {}): Promise<PagedResponse<TramitacaoResponse>> {
    const queryParams = new URLSearchParams();

    if (params.filtro) queryParams.append('filtro', params.filtro);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    return this.client.request<PagedResponse<TramitacaoResponse>>(endpoint, {
      method: 'GET',
    });
  }
}

export const tramitacaoClient = new TramitacaoClient();
export default tramitacaoClient;