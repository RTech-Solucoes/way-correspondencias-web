import ApiClient from '../client';
import { buildQueryParams } from '@/utils/utils';
import {
  SolicitacaoResponse,
  SolicitacaoRequest,
  SolicitacaoIdentificacaoRequest,
  SolicitacaoTemaEtapaRequest,
  SolicitacaoEtapaPrazoRequest,
  SolicitacaoPrazoResponse,
  PagedResponse,
  SolicitacaoDetalheResponse,
  SolicitacaoFilterParams,
} from './types';
import { solicitacaoAnexosClient } from './anexos-client';
import { AnexoResponse, ArquivoDTO } from '../anexos/type';

class SolicitacoesClient {

  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/solicitacoes');
  }

  async buscarPorFiltro(params: SolicitacaoFilterParams = {}): Promise<PagedResponse<SolicitacaoResponse> | SolicitacaoResponse[]> {

    const allowedKeys = [
      'filtro',
      'page',
      'size',
      'idStatusSolicitacao',
      'idArea',
      'cdIdentificacao',
      'idTema',
      'nomeResponsavel',
      'dtCriacaoInicio',
      'dtCriacaoFim',
      'sort',
    ] as const;

    const qs = buildQueryParams(params, allowedKeys).toString();
    return this.client.request<PagedResponse<SolicitacaoResponse> | SolicitacaoResponse[]>(qs ? `?${qs}` : '', { method: 'GET' });
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

  async deletar(id: number): Promise<void> {
    return this.client.request<void>(`/${id}`, {
      method: 'DELETE',
    });
  }

  async listarPrazos(idSolicitacao: number): Promise<SolicitacaoPrazoResponse[]> {
    return this.client.request<SolicitacaoPrazoResponse[]>(`/${idSolicitacao}/prazos`, { method: 'GET' });
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

  async buscarAnexos(idSolicitacao: number): Promise<AnexoResponse[]> {
    return solicitacaoAnexosClient.listar(idSolicitacao);
  }

  async uploadAnexos(idSolicitacao: number, anexos: ArquivoDTO[]): Promise<void> {
    return solicitacaoAnexosClient.upload(idSolicitacao, anexos);
  }

  async removerAnexo(idSolicitacao: number, idAnexo: number): Promise<void> {
    return solicitacaoAnexosClient.deletar(idSolicitacao, idAnexo);
  }

  async downloadAnexo(idSolicitacao: number, nmArquivo?: string): Promise<ArquivoDTO[]> {
    return solicitacaoAnexosClient.download(idSolicitacao, nmArquivo);
  }

  async buscarDetalhesPorId(id: number): Promise<SolicitacaoDetalheResponse> {
    return this.client.request<SolicitacaoDetalheResponse>(`/detalhe/${id}`, {
      method: 'GET',
    });
  }
}

export const solicitacoesClient = new SolicitacoesClient();
export default solicitacoesClient;
