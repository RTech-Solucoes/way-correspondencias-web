// Arquivo corrigido: definição apenas de tipos sem lógica de cliente

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

// Interface de resposta mais flexível usada no front
export interface StatusSolicPrazoTemaResponse extends Partial<StatusSolicitacaoPrazoTema> {
  idStatusSolicPrazoTema?: number; // id alternativo vindo do backend
  tema?: { idTema: number; nmTema: string };
  flAtivo?: string;
}
