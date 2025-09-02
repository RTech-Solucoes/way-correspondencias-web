import ApiClient from '../client';
import { ArquivoRequest } from '../interfaces/request/ArquivoRequest';
import { AnexoResponse } from '../interfaces/response/AnexoResponse';
import { ArquivoResponse } from '../interfaces/response/ArquivoResponse';


class SolicitacaoAnexosClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('');
  }

  async listar(idSolicitacao: number): Promise<AnexoResponse[]> {
    return this.client.request<AnexoResponse[]>(`/solicitacao/${idSolicitacao}/anexos`, {
      method: 'GET',
    });
  }
 
  async upload(idSolicitacao: number, arquivos: ArquivoRequest[]): Promise<void> {
    return this.client.request<void>(`/solicitacao/${idSolicitacao}/anexos`, {
      method: 'POST',
      body: JSON.stringify(arquivos),
    });
  }

  
  async download(idSolicitacao: number, nmArquivo?: string): Promise<ArquivoResponse[]> {
    const queryParams = new URLSearchParams();
    if (nmArquivo) queryParams.append('nmArquivo', nmArquivo);
    const qs = queryParams.toString();

    return this.client.request<ArquivoResponse[]>(`/solicitacao/${idSolicitacao}/anexos/download${qs ? `?${qs}` : ''}`, {
      method: 'GET',
    });
  }

  async deletar(idSolicitacao: number, idAnexo: number): Promise<void> {
    return this.client.request<void>(`/solicitacao/${idSolicitacao}/anexos/${idAnexo}`, {
      method: 'DELETE',
    });
  }

}

export const solicitacaoAnexosClient = new SolicitacaoAnexosClient();
export default solicitacaoAnexosClient;
