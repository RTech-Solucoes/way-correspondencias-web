import type { StatusAtivoResponse } from "./StatusAtivoResponse";
import type { AreaResponse } from "./AreaResponse";

export interface TemaResponse {
  idTema: number;
  nmTema: string;
  dsTema: string;
  nrPrazo: number;
  nrPrazoExterno?: number;
  tpPrazo: string;
  flAtivo: StatusAtivoResponse;
  areas: AreaResponse[];
}
