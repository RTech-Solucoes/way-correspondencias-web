import { buildQueryParams } from '@/utils/utils';
import ApiClient from '../client';
import { CorrespondenciaDetalheResponse, CorrespondenciaEtapaPrazoRequest, CorrespondenciaFilterParams, CorrespondenciaIdentificacaoRequest, CorrespondenciaRequest, CorrespondenciaResponse, CorrespondenciaResumoComHistoricoResponse, CorrespondenciaTemaEtapaRequest } from './types';
import { PagedResponse } from '../solicitacoes';

class CorrespondenciaClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/correspondencias');
  }

  async buscarPorFiltro(params: CorrespondenciaFilterParams = {}): Promise<PagedResponse<CorrespondenciaResponse> | CorrespondenciaResponse[]> {

    const allowedKeys = [
      'filtro',
      'page',
      'size',
      'idSolicitacao',
      'idStatusSolicitacao',
      'idArea',
      'cdIdentificacao',
      'idTema',
      'nmResponsavel',
      'dtCriacaoInicio',
      'dtCriacaoFim',
      'flExigeCienciaGerenteRegul',
      'sort',
    ] as const;

    const qs = buildQueryParams(params, allowedKeys).toString();
    return this.client.request<PagedResponse<CorrespondenciaResponse> | CorrespondenciaResponse[]>(qs ? `?${qs}` : '', { method: 'GET' });
  }

  async buscarPorId(id: number): Promise<CorrespondenciaResponse> {
    return this.client.request<CorrespondenciaResponse>(`/${id}`, {
      method: 'GET',
    });
  }

  async buscarDetalhesPorId(id: number): Promise<CorrespondenciaDetalheResponse> {
    return this.client.request<CorrespondenciaDetalheResponse>(`/detalhe/${id}`, {
      method: 'GET',
    });
  }

  async etapaTema(id: number, req: CorrespondenciaTemaEtapaRequest) {
    return this.client.request<CorrespondenciaResponse>(`/encaminhar/${id}/etapa02`, {
      method: 'PUT',
      body: JSON.stringify(req),
    });
  }

  async etapaPrazo(id: number, req: CorrespondenciaEtapaPrazoRequest) {
    return this.client.request<CorrespondenciaResponse>(`/encaminhar/${id}/etapa03`, {
      method: 'PUT',
      body: JSON.stringify(req),
    });
  }

  async etapaStatus(id: number, idStatusSolicitacao?: number) {
    const qs = idStatusSolicitacao ? `?idStatusSolicitacao=${idStatusSolicitacao}` : '';
    return this.client.request<void>(`/encaminhar/${id}/etapa06${qs}`, { method: 'PUT' });
  }

  async etapaIdentificacao(id: number, req: CorrespondenciaIdentificacaoRequest) {
    return this.client.request<CorrespondenciaResponse>(`/encaminhar/${id}/etapa01`, {
      method: 'PUT',
      body: JSON.stringify(req),
    });
  }

  async criar(solicitacao: CorrespondenciaRequest): Promise<CorrespondenciaResponse> {
    return this.client.request<CorrespondenciaResponse>('', {
      method: 'POST',
      body: JSON.stringify(solicitacao),
    });
  }

  async deletar(id: number): Promise<void> {
    return this.client.request<void>(`/${id}`, {
      method: 'DELETE',
    });
  }
  async listarHistoricoRespostas(idSolicitacao: number): Promise<CorrespondenciaResumoComHistoricoResponse> {
    return this.client.request<CorrespondenciaResumoComHistoricoResponse>(`/${idSolicitacao}/historico-respostas`, {
      method: 'GET',
    });
  }
}

const correspondenciaClient = new CorrespondenciaClient();
export default correspondenciaClient;
