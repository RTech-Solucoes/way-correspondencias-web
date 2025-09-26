import { BaseResponse } from "../solicitacoes";

export interface SolicitacaoAssinanteRequest {
  idSolicitacao: number;
  idStatusSolicitacao: number;
  idResponsavel: number;
}

export interface SolicitacaoAssinanteResponse extends BaseResponse {
  idSolicitacaoAssinantem: number;
  idSolicitacao: number;
  idStatusSolicitacao: number;
  idResponsavel: number;
}