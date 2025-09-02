import { BaseResponse } from "./BaseResponse";
import type { FlagAtivoResponse } from "./FlagAtivoResponse";
import type { ResponsavelAreaResponse } from "./ResponsavelAreaResponse";

export interface ResponsavelResponse extends BaseResponse {
  idResponsavel: number;
  idPerfil: number;
  nmPerfil: string;
  nmUsuarioLogin: string;
  nmResponsavel: string;
  dsEmail: string;
  nrCpf: string;
  dtNascimento: string;
  flAtivo: FlagAtivoResponse;
  areas?: ResponsavelAreaResponse[];
}
