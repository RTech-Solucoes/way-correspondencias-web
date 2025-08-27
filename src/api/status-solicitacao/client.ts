import ApiClient from '../client';

export interface StatusSolicitacaoResponse {
  id: number;
  nome: string;
  descricao?: string;
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
