import ApiClient from '../client';
import { SolicitacaoAssinanteRequest, SolicitacaoAssinanteResponse } from './types';

class SolicitacaoAssinanteClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/solicitacao-assinante');
  }

  async buscarPorIdSolicitacaoEIdStatusSolicitacao(
    idSolicitacao: number, 
    idsStatusSolicitacao: number[]
  ): Promise<SolicitacaoAssinanteResponse[]> {
    const params = new URLSearchParams();
    idsStatusSolicitacao.forEach(id => params.append('idsStatusSolicitacao', id.toString()));
    
    return this.client.request<SolicitacaoAssinanteResponse[]>(
      `/solicitacao/${idSolicitacao}?${params.toString()}`, 
      {
        method: 'GET',
      }
    );
  }

  async criar(requests: SolicitacaoAssinanteRequest[]): Promise<SolicitacaoAssinanteResponse[]> {
    return this.client.request<SolicitacaoAssinanteResponse[]>('', {
      method: 'POST',
      body: JSON.stringify(requests),
    });
  }
}

export const solicitacaoAssinanteClient = new SolicitacaoAssinanteClient();
export default solicitacaoAssinanteClient;