import type { BaseResponse } from "./BaseResponse";

export interface TramitacaoResponse extends BaseResponse {
  idTramitacao: number;
  idSolicitacao: number;
  dsTramitacao?: string;
  dtTramitacao?: string;
}
