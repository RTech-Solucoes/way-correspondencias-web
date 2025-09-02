import type { TramitacaoResponse } from "./TramitacaoResponse";
import type { AnexoResponse } from "./AnexoResponse";

export interface TramitacaoComAnexosResponse {
  tramitacao: TramitacaoResponse;
  anexos: AnexoResponse[];
}
