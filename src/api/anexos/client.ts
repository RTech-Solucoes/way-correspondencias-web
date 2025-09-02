import ApiClient from '../client';
import { TipoObjetoAnexoRequest } from '../interfaces/request/TipoObjetoAnexoRequest';
import { AnexoResponse } from '../interfaces/response/AnexoResponse';
import { ArquivoResponse } from '../interfaces/response/ArquivoResponse';

class AnexosClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/anexos');
  }

  async buscarPorIdObjetoETipoObjeto(idObjeto: number, tpObjeto: TipoObjetoAnexoRequest): Promise<AnexoResponse[]> {
    return this.client.request<AnexoResponse[]>(
      `/idObjeto/${idObjeto}/tpObjeto/${tpObjeto}`,
      { method: 'GET' }
    );
  }
  
  async download(idObjeto: number, tpObjeto: TipoObjetoAnexoRequest, nmArquivo?: string): Promise<ArquivoResponse[]> {
    const queryParams = new URLSearchParams();
    if (nmArquivo) queryParams.append('nmArquivo', nmArquivo);

    const queryString = queryParams.toString();
    const url = `/idObjeto/${idObjeto}/tpObjeto/${tpObjeto}/download${queryString ? `?${queryString}` : ''}`;
    return this.client.request<ArquivoResponse[]>(url, { method: 'GET' });
  }

  async deletar(idAnexo: number): Promise<void> {
    return this.client.request<void>(`/${idAnexo}`, { method: 'DELETE' });
  }
}

export const anexosClient = new AnexosClient();
export default anexosClient;
