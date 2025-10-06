import ApiClient from "../client";
import { ArquivoDTO } from "../anexos/type";

class ResponsavelAnexosClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/responsavel');
  }


  async upload(idResponsavel: number, arquivos: ArquivoDTO[]): Promise<void> {
    return this.client.request<void>(`/${idResponsavel}/anexos`, {
      method: 'POST',
      body: JSON.stringify(arquivos),
    });
  }


  async deletar(idResponsavel: number, idAnexo: number): Promise<void> {
    return this.client.request<void>(`/${idResponsavel}/anexos/${idAnexo}`, {
      method: 'DELETE',
    });
  }
}

export const responsavelAnexosClient = new ResponsavelAnexosClient();
export default responsavelAnexosClient;


