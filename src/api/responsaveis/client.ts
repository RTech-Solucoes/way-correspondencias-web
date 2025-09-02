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
    const queryParams = new URLSearchParams();

    if (params.filtro) queryParams.append('filtro', params.filtro);
    if (params.nmUsuarioLogin) queryParams.append('nmUsuarioLogin', params.nmUsuarioLogin);
    if (params.dsEmail) queryParams.append('dsEmail', params.dsEmail);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    return this.client.request<PagedResponse<ResponsavelResponse>>(endpoint, {
      method: 'GET',
    });
  }

  async buscarPorIdComAreas(id: number): Promise<ResponsavelResponse> {
    return this.client.request<ResponsavelResponse>(`/${id}/areas`, {
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