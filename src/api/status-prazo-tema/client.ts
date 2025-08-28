import ApiClient from '../client';
import { StatusSolicPrazoTemaRequest, StatusSolicPrazoTemaResponse, StatusSolicPrazoTemaForUI } from './types';

class StatusSolicPrazoTemaClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('');
  }

  /**
   * Criar ou atualizar status-prazo para um tema
   */
  async upsert(idTema: number, request: StatusSolicPrazoTemaRequest): Promise<StatusSolicPrazoTemaResponse> {
    return this.client.request<StatusSolicPrazoTemaResponse>(`/temas/${idTema}/status`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Listar status-prazos de um tema (raw backend response)
   */
  async listarPorTema(idTema: number): Promise<StatusSolicPrazoTemaResponse[]> {
    return this.client.request<StatusSolicPrazoTemaResponse[]>(`/temas/${idTema}/status`, {
      method: 'GET',
    });
  }

  /**
   * Listar status-prazos de um tema (mapped for UI usage)
   */
  async listar(idTema: number): Promise<StatusSolicPrazoTemaForUI[]> {
    const backendResponse = await this.listarPorTema(idTema);

    return backendResponse.map(item => ({
      idStatusSolicPrazoTema: item.idStatusSolicPrazoTema,
      idStatusSolicitacao: item.statusCodigo,
      idTema: item.idTema,
      nrPrazoInterno: item.nrPrazoInterno,
      flAtivo: item.flAtivo,
      tema: {
        idTema: item.idTema,
        nmTema: ''
      }
    }));
  }
}

export const statusSolicPrazoTemaClient = new StatusSolicPrazoTemaClient();
export default statusSolicPrazoTemaClient;
