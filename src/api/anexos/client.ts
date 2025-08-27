import ApiClient from '../client';
import { AnexoResponse, ArquivoDTO, TipoObjetoAnexo } from './type';

class AnexosClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/anexos');
  }

  async buscarPorIdObjetoETipoObjeto(idObjeto: number, tpObjeto: TipoObjetoAnexo): Promise<AnexoResponse[]> {
    return this.client.request<AnexoResponse[]>(
      `/idObjeto/${idObjeto}/tpObjeto/${tpObjeto}`,
      { method: 'GET' }
    );
  }
  
  async download(idObjeto: number, tpObjeto: string, nmArquivo?: string): Promise<ArquivoDTO[]> {
    const queryParams = new URLSearchParams();
    if (nmArquivo) queryParams.append('nmArquivo', nmArquivo);

    const queryString = queryParams.toString();
    const url = `/idObjeto/${idObjeto}/tpObjeto/${tpObjeto}/download${queryString ? `?${queryString}` : ''}`;

    return this.client.request<ArquivoDTO[]>(url, { method: 'GET' });
  }

  async deletar(idAnexo: number): Promise<void> {
    return this.client.request<void>(`/${idAnexo}`, { method: 'DELETE' });
  }
}

export const anexosClient = new AnexosClient();
export default anexosClient;
