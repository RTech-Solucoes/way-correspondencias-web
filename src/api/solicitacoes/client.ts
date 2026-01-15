import { buildQueryParams } from '@/utils/utils';
import { AnexoResponse, ArquivoDTO } from '../anexos/type';
import ApiClient from '../client';
import { TipoEnum } from '../tipos/types';
import { solicitacaoAnexosClient } from './anexos-client';
import {
  SolicitacaoBuscaSimpleResponse,
  SolicitacaoDetalheResponse,
  SolicitacaoEtapaPrazoRequest,
  SolicitacaoPrazoResponse,
  SolicitacaoResponse,
} from './types';

class SolicitacoesClient {

  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/solicitacoes');
  }

  async buscarPorId(id: number): Promise<SolicitacaoResponse> {
    return this.client.request<SolicitacaoResponse>(`/${id}`, {
      method: 'GET',
    });
  }

  async listarPrazos(idSolicitacao: number): Promise<SolicitacaoPrazoResponse[]> {
    return this.client.request<SolicitacaoPrazoResponse[]>(`/${idSolicitacao}/prazos`, { method: 'GET' });
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

  async buscarSimplesPorFiltro(
    filtro?: string,
    cdTipoFluxo?: TipoEnum,
    cdTipoClassificacao?: TipoEnum
  ): Promise<SolicitacaoBuscaSimpleResponse[]> {
    const params = {
      filtro,
      cdTipoFluxo,
      cdTipoClassificacao,
    };
    
    const allowedKeys = [
      'filtro',
      'cdTipoFluxo',
      'cdTipoClassificacao',
    ] as const;

    const qs = buildQueryParams(params, allowedKeys).toString();
    
    return this.client.request<SolicitacaoBuscaSimpleResponse[]>(
      `/simples${qs ? `?${qs}` : ''}`,
      { method: 'GET' }
    );
  }

  async verificarExisteCdIdentificacaoPorFluxo(cdIdentificacao: string, cdFluxo: TipoEnum): Promise<boolean> {
    return this.client.request<boolean>(`/verificar-cd-identificacao?cdIdentificacao=${cdIdentificacao}&cdFluxo=${cdFluxo}`, {
      method: 'GET',
    });
  } 


  async etapaPrazo(id: number, req: SolicitacaoEtapaPrazoRequest) {
    return this.client.request<SolicitacaoResponse>(`/encaminhar/${id}/etapa03`, {
      method: 'PUT',
      body: JSON.stringify(req),
    });
  }
}

export const solicitacoesClient = new SolicitacoesClient();
export default solicitacoesClient;
