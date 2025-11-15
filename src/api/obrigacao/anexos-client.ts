import { ArquivoDTO } from '../anexos/type';
import ApiClient from '../client';
import { LinkAnexoRequest } from './types';

class ObrigacaoAnexosClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('');
  }

  async upload(idObrigacao: number, arquivos: ArquivoDTO[]): Promise<void> {
    return this.client.request<void>(`/obrigacoes/${idObrigacao}/anexos`, {
      method: 'POST',
      body: JSON.stringify(arquivos),
    });
  }

  async deletar(idObrigacao: number, idAnexo: number): Promise<void> {
    return this.client.request<void>(`/obrigacoes/${idObrigacao}/anexos/${idAnexo}`, {
      method: 'DELETE',
    });
  }

  async inserirLink(idObrigacao: number, request: LinkAnexoRequest): Promise<void> {
    return this.client.request<void>(`/obrigacoes/${idObrigacao}/anexos/link`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export const obrigacaoAnexosClient = new ObrigacaoAnexosClient();
export default obrigacaoAnexosClient;

