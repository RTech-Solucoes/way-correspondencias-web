import { ArquivoDTO } from '../anexos/type';
import ApiClient from '../client';

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
}

export const obrigacaoAnexosClient = new ObrigacaoAnexosClient();
export default obrigacaoAnexosClient;

