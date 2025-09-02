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
