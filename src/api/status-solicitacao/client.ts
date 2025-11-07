import ApiClient from '../client';
import { buildQueryParams } from '@/utils/utils';
import { CategoriaEnum, TipoEnum, TipoResponse } from '../tipos/types';

export interface StatusSolicitacaoResponse {
  idStatusSolicitacao: number;
  nmStatus: string;
  cdStatus?: string;
  flAtivo?: string;
  tipo?: TipoResponse;
  dsStatus?: string;
}

class StatusSolicitacaoClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/status-solicitacao');
  }

  async listarTodos( nmCategoria?: CategoriaEnum,  cdTipo?: TipoEnum[]): Promise<StatusSolicitacaoResponse[]> {
    const params = {
      nmCategoria,
      cdTipo,
    };
    const allowedKeys = ['nmCategoria', 'cdTipo'] as const;
    const qs = buildQueryParams(params, allowedKeys).toString();

    return this.client.request<StatusSolicitacaoResponse[]>(qs ? `?${qs}` : '', {
      method: 'GET',
    });
  }
}

export const statusSolicitacaoClient = new StatusSolicitacaoClient();
export default statusSolicitacaoClient;
