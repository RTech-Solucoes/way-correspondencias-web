import { BaseResponse } from "./BaseResponse";
import { StatusSolicitacaoResponse } from "./StatusSolicitacaoResponse";
import { TemaResponse } from "./TemaResponse";

export interface StatusPrazoPadraoResponse extends BaseResponse {
  idStatusSolicPrazoTema: number;
  statusCodigo: StatusSolicitacaoResponse;
  nrPrazoInterno: number;
  tema: TemaResponse
  dtCriacao: string;
  dtAtualizacao?: string;
  nrCpfCriacao: string;
  nrCpfAtualizacao?: string;
  flAtivo: string;
}
