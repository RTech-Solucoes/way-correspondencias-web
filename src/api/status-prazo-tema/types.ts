export interface StatusSolicPrazoTemaRequest {
  IdStatusSolicitacao: number;
  nrPrazoInterno: number;
}

export interface StatusSolicPrazoTemaResponse {
  idStatusSolicPrazoTema: number;
  statusCodigo: number;
  idTema: number;
  nrPrazoInterno: number;
  dtCriacao: string;
  dtAtualizacao?: string;
  nrCpfCriacao: string;
  nrCpfAtualizacao?: string;
  flAtivo: string;
}

export interface StatusSolicitacaoPrazoTema {
  id: number;
  idTema: number;
  idStatusSolicitacao: number;
  nrPrazoInterno?: number;
  tpPrazo?: string;
  flExcepcional?: string;
  dtCriacao: string;
  dtAtualizacao?: string;
}

export interface StatusSolicPrazoTemaForUI {
  idStatusSolicPrazoTema: number;
  idStatusSolicitacao: number;
  idTema: number;
  nrPrazoInterno: number;
  flAtivo: string;
  tema?: { idTema: number; nmTema: string };
}
