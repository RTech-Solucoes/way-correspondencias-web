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

    const allowedKeys = [
      "filtro",
      "dsRemetente",
      "dsDestinatario",
      "dtInicioCriacao",
      "dtFimCriacao",
      "page",
      "size",
      "sort"
      ];
      
      const queryParams = new URLSearchParams();
      
      allowedKeys.forEach((key) => {
      const value = params[key as keyof typeof params];
        
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    return this.client.request<PagedResponse<EmailResponse>>(endpoint, {
      method: 'GET',
    });
  }
}

export const emailClient = new EmailClient();
export default emailClient;