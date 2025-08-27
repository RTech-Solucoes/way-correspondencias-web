import ApiClient from '../client';
import { StatusSolicPrazoTemaRequest, StatusSolicitacaoPrazoTema } from './types';

class StatusSolicPrazoTemaClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('');
  }

  /**
   * Criar ou atualizar status-prazo para um tema
   */
  async upsert(idTema: number, request: StatusSolicPrazoTemaRequest): Promise<StatusSolicitacaoPrazoTema> {
    return this.client.request<StatusSolicitacaoPrazoTema>(`/temas/${idTema}/status`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Listar status-prazos de um tema
   */
  async listarPorTema(idTema: number): Promise<StatusSolicitacaoPrazoTema[]> {
    return this.client.request<StatusSolicitacaoPrazoTema[]>(`/temas/${idTema}/status`, {
      method: 'GET',
    });
  }

  /**
   * Alias para compatibilidade (delegando para listarPorTema)
   */
  async listar(idTema: number): Promise<StatusSolicitacaoPrazoTema[]> {
    return this.listarPorTema(idTema);
  }
}

export const statusSolicPrazoTemaClient = new StatusSolicPrazoTemaClient();
export default statusSolicPrazoTemaClient;
