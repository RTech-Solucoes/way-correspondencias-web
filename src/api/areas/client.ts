import { buildQueryParams } from "@/utils/utils";
import ApiClient from "../client";
import { AreaResponse, AreaRequest, PagedResponse, AreaFilterParams, AreaExecutorAvancadoResponse } from "./types";

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

  async buscarPorCdArea(cdArea: string): Promise<AreaResponse> {
    return this.client.request<AreaResponse>(`/cdArea/${cdArea}`, {
      method: 'GET',
    });
  }

  async buscarPorFiltro(params: AreaFilterParams = {}): Promise<PagedResponse<AreaResponse>> {

    const allowedKeys = [
      'filtro',
      'cdArea',
      'nmArea',
      'dsArea',
      'page',
      'size',
      'sort',
    ] as const;

    const qs = buildQueryParams(params, allowedKeys).toString();

    return this.client.request<PagedResponse<AreaResponse>>(qs ? `?${qs}` : '', {
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

  async buscarPorExecutorAvancado(): Promise<AreaExecutorAvancadoResponse[]> {
    return this.client.request<AreaExecutorAvancadoResponse[]>(`/executor-avancado`, {
      method: 'GET',
    });
  }
}

export const areasClient = new AreasClient();
export default areasClient;