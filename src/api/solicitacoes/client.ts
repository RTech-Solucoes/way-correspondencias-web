import ApiClient from "../client";

class SolicitacoesClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/solicitacoes');
  }

}

export const solicitacoesClient = new SolicitacoesClient();
export default solicitacoesClient;