import ApiClient from '../client';
import { buildQueryParams } from '@/utils/utils';
import {
  AnoConcessaoConcessionariaResponse,
  ConfiguracaoConcessionariaRequest,
  ConfiguracaoConcessionariaResponse,
  ConcessionariaCadastroCompletoRequest,
  ConcessionariaFilterParams,
  ConcessionariaRequest,
  ConcessionariaResponse,
  PagedResponse,
} from './types';

class ConcessionariaClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/concessionarias');
  }

  async buscarTodas(): Promise<ConcessionariaResponse[]> {
    return this.client.request<ConcessionariaResponse[]>('', {
      method: 'GET',
    });
  }

  async buscarPorIdResponsavelLogado(): Promise<ConcessionariaResponse[]> {
    return this.client.request<ConcessionariaResponse[]>('/responsavel', {
      method: 'GET',
      skipConcessionariaParam: true
    });
  }

  async buscarParaAdministracao(params: ConcessionariaFilterParams = {}): Promise<PagedResponse<ConcessionariaResponse>> {
    const allowedKeys = [
      'filtro', 'cdConcessionaria', 'nmConcessionaria', 'dsConcessionaria',
      'flAtivo', 'page', 'size', 'sort',
    ] as const;
    const qs = buildQueryParams(params, allowedKeys).toString();
    return this.client.request<PagedResponse<ConcessionariaResponse>>(
      `/administracao${qs ? `?${qs}` : ''}`,
      { method: 'GET', skipConcessionariaParam: true },
    );
  }

  async buscarPorId(id: number): Promise<ConcessionariaResponse> {
    return this.client.request<ConcessionariaResponse>(`/${id}`, {
      method: 'GET',
      skipConcessionariaParam: true,
    });
  }

  async criar(data: ConcessionariaRequest): Promise<ConcessionariaResponse> {
    return this.client.request<ConcessionariaResponse>('', {
      method: 'POST',
      body: JSON.stringify(data),
      skipConcessionariaParam: true,
    });
  }

  async criarCadastroCompleto(data: ConcessionariaCadastroCompletoRequest): Promise<ConcessionariaResponse> {
    return this.client.request<ConcessionariaResponse>('/cadastro-completo', {
      method: 'POST',
      body: JSON.stringify(data),
      skipConcessionariaParam: true,
    });
  }

  async atualizar(id: number, data: ConcessionariaRequest): Promise<ConcessionariaResponse> {
    return this.client.request<ConcessionariaResponse>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      skipConcessionariaParam: true,
    });
  }

  async atualizarCadastroCompleto(id: number, data: ConcessionariaCadastroCompletoRequest): Promise<ConcessionariaResponse> {
    return this.client.request<ConcessionariaResponse>(`/${id}/cadastro-completo`, {
      method: 'PUT',
      body: JSON.stringify(data),
      skipConcessionariaParam: true,
    });
  }

  async alterarStatus(id: number, flAtivo: ConcessionariaResponse['flAtivo']): Promise<ConcessionariaResponse> {
    const action = flAtivo === 'S' ? 'ativar' : 'desativar';
    return this.client.request<ConcessionariaResponse>(`/${id}/${action}`, {
      method: 'PATCH',
      skipConcessionariaParam: true,
    });
  }

  async deletar(id: number): Promise<void> {
    return this.client.request<void>(`/${id}`, {
      method: 'DELETE',
      skipConcessionariaParam: true,
    });
  }

  async buscarConfiguracao(idConcessionaria: number): Promise<ConfiguracaoConcessionariaResponse> {
    return this.client.request<ConfiguracaoConcessionariaResponse>(`/${idConcessionaria}/configuracao`, {
      method: 'GET',
      skipConcessionariaParam: true,
    });
  }

  async criarConfiguracao(idConcessionaria: number, data: ConfiguracaoConcessionariaRequest): Promise<ConfiguracaoConcessionariaResponse> {
    return this.client.request<ConfiguracaoConcessionariaResponse>(`/${idConcessionaria}/configuracao`, {
      method: 'POST',
      body: JSON.stringify(data),
      skipConcessionariaParam: true,
    });
  }

  async atualizarConfiguracao(idConcessionaria: number, data: ConfiguracaoConcessionariaRequest): Promise<ConfiguracaoConcessionariaResponse> {
    return this.client.request<ConfiguracaoConcessionariaResponse>(`/${idConcessionaria}/configuracao`, {
      method: 'PUT',
      body: JSON.stringify(data),
      skipConcessionariaParam: true,
    });
  }

  async sincronizarStatusConfiguracao(idConcessionaria: number, flAtivo: ConcessionariaRequest['flAtivo']): Promise<void> {
    if (!flAtivo) return;

    try {
      const configuracao = await this.buscarConfiguracao(idConcessionaria);
      await this.atualizarConfiguracao(idConcessionaria, {
        dtInboxInicio: configuracao.dtInboxInicio,
        dsInboxEmail: configuracao.dsInboxEmail,
        dsInboxClientId: configuracao.dsInboxClientId,
        dsInboxTenantKeyId: configuracao.dsInboxTenantKeyId,
        dsInboxSecret: null,
        dsSmtpMailHost: configuracao.dsSmtpMailHost,
        dsSmtpPort: configuracao.dsSmtpPort,
        dsSmtpUsername: configuracao.dsSmtpUsername,
        dsSmtpPassword: null,
        dtBaseInicioConcessao: configuracao.dtBaseInicioConcessao,
        dtLimiteConcessao: configuracao.dtLimiteConcessao,
        nrCodigoIdentificacao: configuracao.nrCodigoIdentificacao ?? null,
        flAtivo,
      });
    } catch (error) {
      if ((error as { status?: number }).status === 404) {
        return;
      }
      throw error;
    }
  }

  async deletarConfiguracao(idConcessionaria: number): Promise<void> {
    return this.client.request<void>(`/${idConcessionaria}/configuracao`, {
      method: 'DELETE',
      skipConcessionariaParam: true,
    });
  }

  async buscarAnoConcessaoConcessionariaPorIdConcessionaria() : Promise<AnoConcessaoConcessionariaResponse> {
    return this.client.request<AnoConcessaoConcessionariaResponse>('/ano-concessao', {
      method: 'GET',
    })
  }
}

export const concessionariaClient = new ConcessionariaClient();
export default concessionariaClient;

