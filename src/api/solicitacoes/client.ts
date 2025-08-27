import ApiClient from '../client';
import {
  SolicitacaoResponse,
  SolicitacaoRequest,
  SolicitacaoTemaRequest,
  SolicitacaoIdentificacaoRequest
} from './types';

class SolicitacoesClient {

  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/solicitacoes');
  }

  /**
   * Lista todas as solicitações ou filtra por critério
   */
  async listar(filtro?: string): Promise<SolicitacaoResponse[]> {
    const queryParams = new URLSearchParams();
    if (filtro) queryParams.append('filtro', filtro);

    const queryString = queryParams.toString();
    const url = queryString ? `?${queryString}` : '';

    return this.client.request<SolicitacaoResponse[]>(url, {
      method: 'GET',
    });
  }

  /**
   * Busca uma solicitação por ID
   */
  async buscarPorId(id: number): Promise<SolicitacaoResponse> {
    return this.client.request<SolicitacaoResponse>(`/${id}`, {
      method: 'GET',
    });
  }

  /**
   * Cria uma nova solicitação
   */
  async criar(solicitacao: SolicitacaoRequest): Promise<SolicitacaoResponse> {
    return this.client.request<SolicitacaoResponse>('', {
      method: 'POST',
      body: JSON.stringify(solicitacao),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Atualiza uma solicitação existente
   */
  async atualizar(id: number, solicitacao: SolicitacaoRequest): Promise<SolicitacaoResponse> {
    return this.client.request<SolicitacaoResponse>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(solicitacao),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Deleta uma solicitação
   */
  async deletar(id: number): Promise<void> {
    return this.client.request<void>(`/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Lista prazos de uma solicitação
   */
  async listarPrazos(idSolicitacao: number): Promise<any[]> {
    return this.client.request<any[]>(`/${idSolicitacao}/prazos`, {
      method: 'GET',
    });
  }

  /**
   * Preview do SLA para uma solicitação
   */
  async previewSla(idSolicitacao: number, statusCodigo: number): Promise<number> {
    return this.client.request<number>(`/${idSolicitacao}/sla?statusCodigo=${statusCodigo}`, {
      method: 'GET',
    });
  }

  // Métodos placeholder para compatibilidade (podem não existir no backend ainda)
  /**
   * Busca anexos de uma solicitação
   */
  async buscarAnexos(idSolicitacao: number): Promise<any[]> {
    try {
      return this.client.request<any[]>(`/${idSolicitacao}/anexos`, {
        method: 'GET',
      });
    } catch (error) {
      console.warn('Endpoint de anexos não implementado ainda');
      return [];
    }
  }

  /**
   * Upload de anexo para uma solicitação
   */
  async uploadAnexo(idSolicitacao: number, file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      return this.client.request<any>(`/${idSolicitacao}/anexos`, {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.warn('Endpoint de upload de anexos não implementado ainda');
      throw error;
    }
  }

  /**
   * Remove anexo de uma solicitação
   */
  async removerAnexo(idSolicitacao: number, idAnexo: number): Promise<void> {
    try {
      return this.client.request<void>(`/${idSolicitacao}/anexos/${idAnexo}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('Endpoint de remoção de anexos não implementado ainda');
      throw error;
    }
  }

  /**
   * Download de anexo
   */
  async downloadAnexo(idSolicitacao: number, idAnexo: number): Promise<Blob> {
    try {
      return this.client.request<Blob>(`/${idSolicitacao}/anexos/${idAnexo}/download`, {
        method: 'GET',
      });
    } catch (error) {
      console.warn('Endpoint de download de anexos não implementado ainda');
      throw error;
    }
  }

  /**
   * Upload múltiplos anexos
   */
  async uploadAnexos(formData: FormData): Promise<any> {
    try {
      return this.client.request<any>('/anexos/upload', {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.warn('Endpoint de upload múltiplo de anexos não implementado ainda');
      throw error;
    }
  }

  enviarDevolutiva(idSolicitacao: number, arg1: { mensagem: string; }) {
    console.log('Método enviarDevolutiva chamado com:', idSolicitacao, arg1);
  }
  
}

export const solicitacoesClient = new SolicitacoesClient();
export default solicitacoesClient;
