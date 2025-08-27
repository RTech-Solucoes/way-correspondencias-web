import ApiClient from '../client';

export interface ArquivoDTO {
  nomeArquivo: string;
  conteudoArquivo: string; // Base64
  tipoArquivo: string;
}

export interface AnexoResponse {
  id: number;
  nomeArquivo: string;
  tamanhoArquivo: number;
  tipoArquivo: string;
  dataCriacao: string;
}

class SolicitacaoAnexosClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('');
  }

  /**
   * Lista anexos de uma solicitação
   */
  async listar(idSolicitacao: number): Promise<AnexoResponse[]> {
    return this.client.request<AnexoResponse[]>(`/solicitacao/${idSolicitacao}/anexos`, {
      method: 'GET',
    });
  }

  /**
   * Upload de anexos para uma solicitação
   */
  async upload(idSolicitacao: number, arquivos: ArquivoDTO[]): Promise<void> {
    return this.client.request<void>(`/solicitacao/${idSolicitacao}/anexos`, {
      method: 'POST',
      body: JSON.stringify(arquivos),
    });
  }

  /**
   * Download de anexos de uma solicitação
   */
  async download(idSolicitacao: number, nmArquivo?: string): Promise<ArquivoDTO[]> {
    const queryParams = new URLSearchParams();
    if (nmArquivo) queryParams.append('nmArquivo', nmArquivo);
    const qs = queryParams.toString();

    return this.client.request<ArquivoDTO[]>(`/solicitacao/${idSolicitacao}/anexos/download${qs ? `?${qs}` : ''}`, {
      method: 'GET',
    });
  }

  /**
   * Deletar um anexo específico
   */
  async deletar(idSolicitacao: number, idAnexo: number): Promise<void> {
    return this.client.request<void>(`/solicitacao/${idSolicitacao}/anexos/${idAnexo}`, {
      method: 'DELETE',
    });
  }
}

export const solicitacaoAnexosClient = new SolicitacaoAnexosClient();
export default solicitacaoAnexosClient;
