import { ResponsavelResponse } from "../responsaveis/types";
import { BaseResponse } from "../solicitacoes";

export interface SolicitacaoParecerRequest {
  idSolicitacao: number;
  idStatusSolicitacao: number;
  dsDarecer: string;
}

export interface SolicitacaoParecerResponse extends BaseResponse {
  idSolicitacaoParecer: number;
  idSolicitacao: number;
  idStatusSolicitacao: number;
  dsDarecer: string;
  nrNivel: number;
  responsavel: ResponsavelResponse;
}


