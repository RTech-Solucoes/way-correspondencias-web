import ApiClient from '../client';
import { StatusSolicPrazoTemaRequest, StatusSolicPrazoTemaResponse, StatusSolicPrazoTemaForUI, StatusPrazoPadraoResponse } from './types';

class StatusSolicPrazoTemaClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('');
  }

  /**
   * Criar ou atualizar status-prazo para um tema
   */
  async upsert(idTema: number, request: StatusSolicPrazoTemaRequest): Promise<StatusSolicPrazoTemaResponse> {
    return this.client.request<StatusSolicPrazoTemaResponse>(`/temas/${idTema}/status`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Listar status-prazos de um tema (raw backend response)
   */
  async listarPorTema(idTema: number): Promise<StatusSolicPrazoTemaResponse[]> {
    return this.client.request<StatusSolicPrazoTemaResponse[]>(`/temas/${idTema}/status`, {
      method: 'GET',
    });
  }

  /**
   * Listar status-prazos de um tema (mapped for UI usage)
   */
  async listar(idTema: number): Promise<StatusSolicPrazoTemaForUI[]> {
    const backendResponse = await this.listarPorTema(idTema);

    return backendResponse.map(item => ({
      idStatusSolicPrazoTema: item.idStatusSolicPrazoTema,
      idStatusSolicitacao: item.statusCodigo,
      idTema: item.idTema,
      nrPrazoInterno: item.nrPrazoInterno,
      nrPrazoExterno: item.nrPrazoExterno,
      flAtivo: item.flAtivo,
      tema: {
        idTema: item.idTema,
        nmTema: ''
      }
    }));
  }

  async buscarPrazosPadrao(idTema: number): Promise<StatusPrazoPadraoResponse[]> {
    return this.client.request<StatusPrazoPadraoResponse[]>(`/temas/${idTema}/status`, {
      method: 'GET',
    });
  }

  async buscarPrazosPadraoParaUI(idTema: number): Promise<StatusSolicPrazoTemaForUI[]> {
    const backendResponse = await this.buscarPrazosPadrao(idTema);

    return backendResponse.map(item => ({
      idStatusSolicPrazoTema: item.idStatusSolicPrazoTema,
      idStatusSolicitacao: item.statusCodigo.idStatusSolicitacao,
      idTema: item.tema.idTema,
      nrPrazoInterno: item.nrPrazoInterno,
      nrPrazoExterno: item.tema.nrPrazoExterno,
      flAtivo: item.flAtivo,
      tema: {
        idTema: item.tema.idTema,
        nmTema: item.tema.nmTema
      }
    }));
  }
}

export const statusSolicPrazoTemaClient = new StatusSolicPrazoTemaClient();
export default statusSolicPrazoTemaClient;
