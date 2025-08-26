import ApiClient from '../client';
import { StatusSolicPrazoTemaRequest, StatusSolicPrazoTemaResponse } from './types';

class StatusPrazoTemaClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/temas');
  }

  /**
   * Atualiza ou cria um prazo interno para um status específico de um tema
   */
  async upsertPrazoStatus(
    idTema: number,
    statusCodigo: number,
    request: StatusSolicPrazoTemaRequest
  ): Promise<StatusSolicPrazoTemaResponse> {
    return this.client.request<StatusSolicPrazoTemaResponse>(`/${idTema}/status/${statusCodigo}/prazo`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  /**
   * Lista todos os prazos configurados para um tema
   */
  async listarPrazosTema(idTema: number): Promise<StatusSolicPrazoTemaResponse[]> {
    return this.client.request<StatusSolicPrazoTemaResponse[]>(`/${idTema}/status/prazos`, {
      method: 'GET',
    });
  }
}

export const statusPrazoTemaClient = new StatusPrazoTemaClient();
export default statusPrazoTemaClient;
