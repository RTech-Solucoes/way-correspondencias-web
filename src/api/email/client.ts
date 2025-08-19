import ApiClient from "../client";
import { EmailResponse, EmailRequest, PagedResponse, EmailFilterParams } from "./types";

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
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    return this.client.request<PagedResponse<EmailResponse>>(endpoint, {
      method: 'GET',
    });
  }

  async criar(email: EmailRequest): Promise<EmailResponse> {
    return this.client.request<EmailResponse>('', {
      method: 'POST',
      body: JSON.stringify(email),
    });
  }

  async atualizar(id: number, email: EmailRequest): Promise<EmailResponse> {
    return this.client.request<EmailResponse>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(email),
    });
  }

  async deletar(id: number): Promise<void> {
    return this.client.request<void>(`/${id}`, {
      method: 'DELETE',
    });
  }
}

export const emailClient = new EmailClient();
export default emailClient;