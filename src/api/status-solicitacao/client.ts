import ApiClient from '../client';

export interface StatusSolicitacaoResponse {
  idStatusSolicitacao: number;
  nmStatus: string;
  dsStatus?: string;
}

class StatusSolicitacaoClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/status-solicitacao');
  }

  async listarTodos(): Promise<StatusSolicitacaoResponse[]> {
    return this.client.request<StatusSolicitacaoResponse[]>('', {
      method: 'GET',
    });
  }
}

export const statusSolicitacaoClient = new StatusSolicitacaoClient();
export default statusSolicitacaoClient;
