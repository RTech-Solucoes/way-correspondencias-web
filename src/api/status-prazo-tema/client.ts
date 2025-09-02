import ApiClient from '../client';
import { StatusSolicPrazoTemaRequest } from '../interfaces/request/StatusSolicPrazoTemaRequest';
import { StatusPrazoPadraoResponse } from '../interfaces/response/StatusPrazoPadraoResponse';
import { StatusSolicPrazoTemaResponse } from '../interfaces/response/StatusSolicPrazoTemaResponse';

class StatusSolicPrazoTemaClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('');
  }

  
  async upsert(idTema: number, request: StatusSolicPrazoTemaRequest): Promise<StatusSolicPrazoTemaResponse> {
    return this.client.request<StatusSolicPrazoTemaResponse>(`/temas/${idTema}/status`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async listarPorTema(idTema: number): Promise<StatusSolicPrazoTemaResponse[]> {
    return this.client.request<StatusSolicPrazoTemaResponse[]>(`/temas/${idTema}/status`, {
      method: 'GET',
    });
  }

  async listar(idTema: number): Promise<StatusSolicPrazoTemaForUI[]> {
    const backendResponse = await this.listarPorTema(idTema);

    return backendResponse.map(item => ({
      idStatusSolicPrazoTema: item.idStatusSolicPrazoTema,
      idStatusSolicitacao: item.statusCodigo,
      idTema: item.idTema,
      nrPrazoInterno: item.nrPrazoInterno,
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
