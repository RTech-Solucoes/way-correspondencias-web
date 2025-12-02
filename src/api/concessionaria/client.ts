import ApiClient from '../client';
import { ConcessionariaResponse } from './types';

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

  async buscarPorIdResponsavel(): Promise<ConcessionariaResponse[]> {
    return this.client.request<ConcessionariaResponse[]>('/responsavel', {
      method: 'GET',
      skipConcessionariaParam: true
    });
  }
}

export const concessionariaClient = new ConcessionariaClient();
export default concessionariaClient;

