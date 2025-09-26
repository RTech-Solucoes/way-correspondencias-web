import { buildQueryParams } from "@/utils/utils";
import ApiClient from "../client";
import { EmailResponse, PagedResponse, EmailFilterParams } from "./types";

class EmailClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/emails');
  }

  async buscarPorId(id: number): Promise<EmailResponse> {
    return this.client.request<EmailResponse>(`/${id}`, {
      method: 'GET',
    });
  }

  async buscarPorFiltro(params: EmailFilterParams = {}): Promise<PagedResponse<EmailResponse>> {

    const allowedKeys = [
      "filtro",
      "dsRemetente",
      "dsDestinatario",
      "dtRecebimentoInicio",
      "dtRecebimentoFim",
      "page",
      "size",
      "sort"
    ] as const;

    const qs = buildQueryParams(params, allowedKeys).toString();

    return this.client.request<PagedResponse<EmailResponse>>(qs ? `?${qs}` : '', {
      method: 'GET',
    });
  }
}

export const emailClient = new EmailClient();
export default emailClient;