import { BaseResponse } from "./BaseResponse";
import type { StatusAtivoResponse } from "./StatusAtivoResponse";

export interface PerfilResponse extends BaseResponse {
  idPerfil: number;
  nmPerfil: string;
  dsPerfil: string;
  flAtivo: StatusAtivoResponse;
}
