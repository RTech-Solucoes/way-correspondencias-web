import ApiClient from '../client';
import {
  SolicitacaoResponse,
  SolicitacaoRequest,
  SolicitacaoIdentificacaoRequest,
  SolicitacaoTemaEtapaRequest,
  SolicitacaoEtapaPrazoRequest,
  SolicitacaoPrazoResponse
} from './types';
import { solicitacaoAnexosClient, ArquivoDTO, AnexoResponse } from './anexos-client';

class SolicitacoesClient {

  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/solicitacoes');
  }

  /**
   * Lista todas as solicitações ou filtra por critério
   */
  async listar(filtro?: string, page?: number, size?: number, sort?: string): Promise<SolicitacaoResponse[]> {
    const queryParams = new URLSearchParams();
    if (filtro) queryParams.append('filtro', filtro);
    if (page !== undefined) queryParams.append('page', page.toString());
    if (size !== undefined) queryParams.append('size', size.toString());
    if (sort) queryParams.append('sort', sort);
    const qs = queryParams.toString();
    return this.client.request<SolicitacaoResponse[]>(qs ? `?${qs}` : '', { method: 'GET' });
  }

  async buscarPorId(id: number): Promise<SolicitacaoResponse> {
    return this.client.request<SolicitacaoResponse>(`/${id}`, {
      method: 'GET',
    });
  }

  async criar(solicitacao: SolicitacaoRequest): Promise<SolicitacaoResponse> {
    return this.client.request<SolicitacaoResponse>('', {
      method: 'POST',
      body: JSON.stringify(solicitacao),
    });
  }

  async atualizar(id: number, solicitacao: SolicitacaoRequest): Promise<SolicitacaoResponse> {
    return this.client.request<SolicitacaoResponse>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(solicitacao),
    });
  }

  async deletar(id: number): Promise<void> {
    return this.client.request<void>(`/${id}`, {
      method: 'DELETE',
    });
  }

  async listarPrazos(idSolicitacao: number): Promise<SolicitacaoPrazoResponse[]> {
    return this.client.request<SolicitacaoPrazoResponse[]>(`/${idSolicitacao}/prazos`, { method: 'GET' });
  }

  async previewSla(idSolicitacao: number, idStatusSolicitacao: number): Promise<number> {
    return this.client.request<number>(`/${idSolicitacao}/sla?idStatusSolicitacao=${idStatusSolicitacao}`, {
      method: 'GET',
    });
  }

  async definirPrazo(id: number, nrPrazoDias: number, idStatusSolicitacao?: number, tpPrazo?: string) {
    const params = new URLSearchParams();
    params.append('nrPrazoDias', nrPrazoDias.toString());
    if (idStatusSolicitacao !== undefined) params.append('idStatusSolicitacao', idStatusSolicitacao.toString());
    if (tpPrazo) params.append('tpPrazo', tpPrazo);
    return this.client.request<any>(`/${id}/prazos/definir?${params.toString()}`, { method: 'POST' });
  }

  async definirPrazoExcepcional(id: number, nrPrazoDias: number, idStatusSolicitacao?: number, tpPrazo?: string) {
    const params = new URLSearchParams();
    params.append('nrPrazoDias', nrPrazoDias.toString());
    if (idStatusSolicitacao !== undefined) params.append('idStatusSolicitacao', idStatusSolicitacao.toString());
    if (tpPrazo) params.append('tpPrazo', tpPrazo);
    return this.client.request<any>(`/${id}/prazos/excepcional?${params.toString()}`, { method: 'POST' });
  }

  async aplicarStatus(id: number, idStatusSolicitacao: number) {
    return this.client.request<void>(`/${id}/aplicar-status/${idStatusSolicitacao}`, { method: 'POST' });
  }

  async etapaIdentificacao(id: number, req: SolicitacaoIdentificacaoRequest) {
    return this.client.request<SolicitacaoResponse>(`/encaminhar/${id}/etapa01`, {
      method: 'PUT',
      body: JSON.stringify(req),
    });
  }

  async etapaTema(id: number, req: SolicitacaoTemaEtapaRequest) {
    return this.client.request<SolicitacaoResponse>(`/encaminhar/${id}/etapa02`, {
      method: 'PUT',
      body: JSON.stringify(req),
    });
  }

  async etapaPrazo(id: number, req: SolicitacaoEtapaPrazoRequest) {
    return this.client.request<SolicitacaoResponse>(`/encaminhar/${id}/etapa03`, {
      method: 'PUT',
      body: JSON.stringify(req),
    });
  }

  async etapaStatus(id: number, idStatusSolicitacao?: number) {
    const qs = idStatusSolicitacao ? `?idStatusSolicitacao=${idStatusSolicitacao}` : '';
    return this.client.request<void>(`/encaminhar/${id}/etapa05${qs}`, { method: 'PUT' });
  }

  /**
   * Lista anexos (wrapper compatibilidade)
   */
  async buscarAnexos(idSolicitacao: number): Promise<AnexoResponse[]> {
    return solicitacaoAnexosClient.listar(idSolicitacao);
  }

  /**
   * Upload de anexos (wrapper compatibilidade)
   */
  async uploadAnexos(idSolicitacao: number, anexos: ArquivoDTO[]): Promise<void> {
    return solicitacaoAnexosClient.upload(idSolicitacao, anexos);
  }

  /**
   * Remover anexo específico (wrapper compatibilidade)
   */
  async removerAnexo(idSolicitacao: number, idAnexo: number): Promise<void> {
    return solicitacaoAnexosClient.deletar(idSolicitacao, idAnexo);
  }

  /**
   * Download de anexos (wrapper compatibilidade)
   */
  async downloadAnexo(idSolicitacao: number, nmArquivo?: string): Promise<ArquivoDTO[]> {
    return solicitacaoAnexosClient.download(idSolicitacao, nmArquivo);
  }

  enviarDevolutiva(idSolicitacao: number, arg1: { mensagem: string; }) {
    console.log('Método enviarDevolutiva chamado com:', idSolicitacao, arg1);
  }
  
}

export const solicitacoesClient = new SolicitacoesClient();
export default solicitacoesClient;
