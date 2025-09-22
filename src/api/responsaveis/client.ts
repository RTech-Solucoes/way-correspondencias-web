import { buildQueryParams } from "@/utils/utils";
import ApiClient from "../client";
import { ResponsavelResponse, ResponsavelRequest, PagedResponse, ResponsavelFilterParams } from "./types";

class ResponsaveisClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/responsaveis');
  }

  async buscarPorId(id: number): Promise<ResponsavelResponse> {
    return this.client.request<ResponsavelResponse>(`/${id}`, {
      method: 'GET',
    });
  }

  async buscarPorNmUsuarioLogin(nmUsuarioLogin: string): Promise<ResponsavelResponse> {
    return this.client.request<ResponsavelResponse>(`/usuario/${encodeURIComponent(nmUsuarioLogin)}`, {
      method: 'GET',
    });
  }

  async buscarPorDsEmail(dsEmail: string): Promise<ResponsavelResponse> {
    return this.client.request<ResponsavelResponse>(`/email/${encodeURIComponent(dsEmail)}`, {
      method: 'GET',
    });
  }

  async buscarPorFiltro(params: ResponsavelFilterParams = {}): Promise<PagedResponse<ResponsavelResponse>> {

    const allowedKeys = [
      'filtro',
      'nmUsuarioLogin',
      'dsEmail',
      'page',
      'size',
      'sort',
    ] as const;

    const qs = buildQueryParams(params, allowedKeys).toString();
    return this.client.request<PagedResponse<ResponsavelResponse>>(qs ? `?${qs}` : '', {
      method: 'GET',
    });
  }

  async criar(responsavel: ResponsavelRequest): Promise<ResponsavelResponse> {
    return this.client.request<ResponsavelResponse>('', {
      method: 'POST',
      body: JSON.stringify(responsavel),
    });
  }

  async atualizar(id: number, responsavel: ResponsavelRequest): Promise<ResponsavelResponse> {
    return this.client.request<ResponsavelResponse>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(responsavel),
    });
  }

  async deletar(id: number): Promise<void> {
    return this.client.request<void>(`/${id}`, {
      method: 'DELETE',
    });
  }
}

export const responsaveisClient = new ResponsaveisClient();
export default responsaveisClient;