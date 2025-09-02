import { AreaRequest } from "./AreaRequest";
import { StatusAtivoRequest } from "./StatusAtivoRequest";

export interface TemaRequest {
  idTema: number;
  nmTema: string;
  dsTema: string;
  nrPrazo: number;
  nrPrazoExterno?: number;
  tpPrazo: string;
  flAtivo: StatusAtivoRequest;
  areas: AreaRequest[];
}
