import { FlagAtivoRequest } from "./FlagAtivoRequest";
import { ResponsavelAreaRequest } from "./ResponsavelAreaRequest";

export interface ResponsavelRequest {
  idResponsavel: number;
  idPerfil: number;
  nmPerfil: string;
  nmUsuarioLogin: string;
  nmResponsavel: string;
  dsEmail: string;
  nrCpf: string;
  dtNascimento: string;
  flAtivo: FlagAtivoRequest;
  areas?: ResponsavelAreaRequest[];
}
