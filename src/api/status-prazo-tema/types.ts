

export interface StatusSolicPrazoTemaRequest {
  idStatusSolicitacao: number;
  nrPrazoInterno?: number;
  tpPrazo?: string;
  flExcepcional?: string;
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

export interface StatusSolicPrazoTemaResponse extends Partial<StatusSolicitacaoPrazoTema> {
  idStatusSolicPrazoTema?: number;
  tema?: { idTema: number; nmTema: string };
  flAtivo?: string;
}
