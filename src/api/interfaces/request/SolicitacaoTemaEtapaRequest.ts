export interface SolicitacaoTemaEtapaRequest {
  idTema: number;
  tpPrazo?: string;
  nrPrazoInterno?: number;
  nrPrazoExterno?: number;
  flExcepcional?: string;
  idsAreas?: number[];
}
