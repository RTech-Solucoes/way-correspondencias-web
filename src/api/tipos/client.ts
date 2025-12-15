import ApiClient from "../client";
import { TipoResponse, CategoriaEnum } from "./types";

class TiposClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/tipos');
  }

  async buscarPorCategorias(categorias: CategoriaEnum[]): Promise<TipoResponse[]> {
    const params = new URLSearchParams();
    categorias.forEach(categoria => {
      params.append('categorias', categoria);
    });
    
    const queryString = params.toString();
    return this.client.request<TipoResponse[]>(`/categorias${queryString ? `?${queryString}` : ''}`, {
      method: 'GET'
    });
  }
}

const tiposClient = new TiposClient();
export default tiposClient;



