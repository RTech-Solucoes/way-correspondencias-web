import type { StatusAtivoResponse } from "./StatusAtivoResponse";

export interface AreaResponse {
  idArea: number;
  cdArea: string;
  nmArea: string;
  dsArea: string;
  flAtivo: StatusAtivoResponse;
}
