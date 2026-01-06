import { ArquivoDTO } from "../anexos/type";
import ApiClient from "../client";
import { SolicitacaoResumoComHistoricoResponse } from "../solicitacoes";
import { TramitacaoResponse, TramitacaoRequest, ProximoStatusRequest } from './types';

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

  //  async tramitar(data: TramitacaoRequest): Promise<TramitacaoResponse> {
  //   return this.client.request<TramitacaoResponse>(`/tramitar`, {
  //     method: 'POST',
  //     body: JSON.stringify(data),
  //   });
  // }

  async tramitarViaFluxo(data: TramitacaoRequest): Promise<TramitacaoResponse> {
    return this.client.request<TramitacaoResponse>(`/tramitar-via-fluxo`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async buscarProximoStatusPorIdSolicitacaoEIdStatusSolicitacao(data: ProximoStatusRequest): Promise<number> {
    return this.client.request<number>(`/solicitacao/${data.idSolicitacao}/statusSolicitacao/${data.idStatusSolicitacao}/proximo-status`, {
      method: 'GET',
    });
  }

async uploadAnexos(id: number, files: ArquivoDTO[]): Promise<TramitacaoResponse> {
    return this.client.request<TramitacaoResponse>(`/${id}/anexos`, {
      method: "POST",
      body: JSON.stringify(files),
    });
  }

  async listarHistoricoRespostas(idSolicitacao: number): Promise<SolicitacaoResumoComHistoricoResponse> {
    return this.client.request<SolicitacaoResumoComHistoricoResponse>(`/${idSolicitacao}/historico-respostas`, {
      method: 'GET',
    });
  }
}

export const tramitacoesClient = new TramitacoesClient();
export default tramitacoesClient;
