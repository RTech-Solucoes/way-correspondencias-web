import ApiClient from "../client";
import { EmailResponse, PagedResponse, EmailFilterParams } from "./types";

class EmailClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/emails');
  }

  async buscarPorId(id: number): Promise<EmailResponse> {
    return this.client.request<EmailResponse>(`/${id}`, {
      method: 'GET',
    });
  }

  async buscarPorDsRemetente(dsRemetente: string): Promise<EmailResponse[]> {
    return this.client.request<EmailResponse[]>(`/remetente/${encodeURIComponent(dsRemetente)}`, {
      method: 'GET',
    });
  }

  async buscarPorDsDestinatario(dsDestinatario: string): Promise<EmailResponse[]> {
    return this.client.request<EmailResponse[]>(`/destinatario/${encodeURIComponent(dsDestinatario)}`, {
      method: 'GET',
    });
  }

  async buscarPorPeriodo(inicio: string, fim: string): Promise<EmailResponse[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('inicio', inicio);
    queryParams.append('fim', fim);

    return this.client.request<EmailResponse[]>(`/periodo?${queryParams.toString()}`, {
      method: 'GET',
    });
  }

  async buscarPorFiltro(params: EmailFilterParams = {}): Promise<PagedResponse<EmailResponse>> {
    const queryParams = new URLSearchParams();

    if (params.filtro) queryParams.append('filtro', params.filtro);
    if (params.dsRemetente) queryParams.append('dsRemetente', params.dsRemetente);
    if (params.dsDestinatario) queryParams.append('dsDestinatario', params.dsDestinatario);
    if (params.dtInicioCriacao) queryParams.append('dtInicioCriacao', params.dtInicioCriacao);
    if (params.dtFimCriacao) queryParams.append('dtFimCriacao', params.dtFimCriacao);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    return this.client.request<PagedResponse<EmailResponse>>(endpoint, {
      method: 'GET',
    });
  }
}

export const emailClient = new EmailClient();
export default emailClient;