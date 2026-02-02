import ApiClient from '../client';
import { AnoConcessaoConcessionariaResponse, ConcessionariaResponse } from './types';

class ConcessionariaClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/concessionarias');
  }

  async buscarTodas(): Promise<ConcessionariaResponse[]> {
    return this.client.request<ConcessionariaResponse[]>('', {
      method: 'GET',
    });
  }

  async buscarPorIdResponsavelLogado(): Promise<ConcessionariaResponse[]> {
    return this.client.request<ConcessionariaResponse[]>('/responsavel', {
      method: 'GET',
      skipConcessionariaParam: true
    });
  }

  async buscarAnoConcessaoConcessionariaPorIdConcessionaria() : Promise<AnoConcessaoConcessionariaResponse> {
    return this.client.request<AnoConcessaoConcessionariaResponse>('/ano-concessao', {
      method: 'GET',
    })
  }
}

export const concessionariaClient = new ConcessionariaClient();
export default concessionariaClient;

