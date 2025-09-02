import ApiClient from "../client";
import { fileToArquivoDTO } from "@/utils/utils";
import { TramitacaoRequest } from "../interfaces/request/TramitacaoRequest";
import { TramitacaoResponse } from "../interfaces/response/TramitacaoResponse";
import { ArquivoRequest } from "../interfaces/request/ArquivoRequest";

class TramitacoesClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/tramitacoes');
  }

  async obter(id: number): Promise<TramitacaoResponse> {
    return this.client.request<TramitacaoResponse>(`/${id}`, {
      method: 'GET',
    });
  }

  async listarPorSolicitacao(idSolicitacao: number): Promise<TramitacaoResponse[]> {
    return this.client.request<TramitacaoResponse[]>(`/solicitacao/${idSolicitacao}`, {
      method: 'GET',
    });
  }

  async criar(data: TramitacaoRequest): Promise<TramitacaoResponse> {
    return this.client.request<TramitacaoResponse>('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async atualizar(id: number, data: TramitacaoRequest): Promise<TramitacaoResponse> {
    return this.client.request<TramitacaoResponse>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletar(id: number): Promise<void> {
    return this.client.request<void>(`/${id}`, {
      method: 'DELETE',
    });
  }

   async tramitar(data: TramitacaoRequest): Promise<TramitacaoResponse> {
    return this.client.request<TramitacaoResponse>(`/tramitar`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

async uploadAnexos(id: number, files: File[]): Promise<TramitacaoResponse> {
    const arquivos: ArquivoRequest[] = await Promise.all(files.map(fileToArquivoDTO));
    return this.client.request<TramitacaoResponse>(`/${id}/anexos`, {
      method: "POST",
      body: JSON.stringify(arquivos),
    });
  }

}

export const tramitacoesClient = new TramitacoesClient();
export default tramitacoesClient;
