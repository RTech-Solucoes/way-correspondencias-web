import { buildQueryParams } from "@/utils/utils";
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

  async buscarPorFiltro(params: TemaFilterParams = {}): Promise<PagedResponse<TemaResponse>> {

    const allowedKeys = [
      'filtro',
      'nmTema',
      'dsTema',
      'page',
      'size',
      'sort',
    ] as const;

    const qs = buildQueryParams(params, allowedKeys).toString();

    return this.client.request<PagedResponse<TemaResponse>>(qs ? `?${qs}` : '', {
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