import type { StatusAtivoResponse } from "./StatusAtivoResponse";
import type { TipoResponsavelAnexoResponse } from "./TipoResponsavelAnexoResponse";

export interface AnexoResponse {
  idAnexo: number;
  idObjeto: number;
  tpObjeto: string;
  nmArquivo: string;
  dsCaminho: string;
  tpResponsavel: TipoResponsavelAnexoResponse;
  flAtivo: StatusAtivoResponse;
}
