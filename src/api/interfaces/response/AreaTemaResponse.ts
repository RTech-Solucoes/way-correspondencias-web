import type { AreaSolicitacaoResponse } from "./AreaSolicitacaoResponse";

export interface AreaTemaResponse {
  idTema: number;
  nmTema: string;
  dsTema?: string | null;
  nrPrazo: number;
  nrPrazoExterno: number;
  tpPrazo: string;
  flAtivo: string;
  areas?: AreaSolicitacaoResponse[];
}
