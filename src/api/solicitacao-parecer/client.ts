import ApiClient from '../client';
import { SolicitacaoParecerRequest, SolicitacaoParecerResponse } from './types';

class SolicitacaoParecerClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/solicitacao-parecer');
  }

  async buscarPorId(id: number): Promise<SolicitacaoParecerResponse> {
    return this.client.request<SolicitacaoParecerResponse>(`/${id}`, {
      method: 'GET',
    });
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
}

export const solicitacaoParecerClient = new SolicitacaoParecerClient();
export default solicitacaoParecerClient;


