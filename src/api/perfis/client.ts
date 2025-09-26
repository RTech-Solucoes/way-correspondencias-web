import { buildQueryParams } from "@/utils/utils";
import ApiClient from "../client";
import { PerfilResponse, PerfilRequest, PagedResponse, PerfilFilterParams } from "./types";

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

    const allowedKeys = [
      'filtro',
      'page',
      'size',
      'sort',
    ] as const;

    const qs = buildQueryParams(params, allowedKeys).toString();
    const endpoint = qs ? `?${qs}` : '';

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
