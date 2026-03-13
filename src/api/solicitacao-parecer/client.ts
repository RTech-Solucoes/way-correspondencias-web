import ApiClient from '../client';
import { SolicitacaoParecerRequest, SolicitacaoParecerResponse } from './types';

class SolicitacaoParecerClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/solicitacao-parecer');
  }

  async buscarPorIdSolicitacao(idSolicitacao: number): Promise<SolicitacaoParecerResponse[]> {
    return this.client.request<SolicitacaoParecerResponse[]>(`/solicitacao/${idSolicitacao}`, {
      method: 'GET',
    });
  }

  async criar(req: SolicitacaoParecerRequest): Promise<SolicitacaoParecerResponse> {
    return this.client.request<SolicitacaoParecerResponse>('', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }

  async atualizar(id: number, req: SolicitacaoParecerRequest): Promise<SolicitacaoParecerResponse> {
    return this.client.request<SolicitacaoParecerResponse>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(req),
    });
  }

  async deletar(id: number): Promise<void> {
    return this.client.request<void>(`/${id}`, {
      method: 'DELETE',
    });
  }
}

export const solicitacaoParecerClient = new SolicitacaoParecerClient();
export default solicitacaoParecerClient;


