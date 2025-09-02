import type { SolicitacaoPrazoItemRequest } from "./SolicitacaoPrazoItemRequest";

export interface SolicitacaoEtapaPrazoRequest {
  idTema?: number;
  nrPrazoInterno?: number;
  nrPrazoExterno?: number;
  solicitacoesPrazos: SolicitacaoPrazoItemRequest[];
}
