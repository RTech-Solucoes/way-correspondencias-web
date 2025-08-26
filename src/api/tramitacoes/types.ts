export interface TramitacaoResponse {
  idTramitacao: number;
  idSolicitacao: number;
  idAreaOrigem?: number;
  idAreaDestino?: number;
  dsObservacao?: string;
}

export interface TramitacaoRequest {
  idSolicitacao: number;
  idAreaOrigem?: number;
  idAreaDestino?: number;
  dsObservacao?: string;
}
