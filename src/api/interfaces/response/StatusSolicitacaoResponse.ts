export interface StatusSolicitacaoResponse {
  idStatusSolicitacao: number;
  nmStatus: string;
  dsStatus?: string | null;
  dtCriacao: string;
  dtAtualizacao?: string | null;
  nrCpfCriacao?: string | null;
  nrCpfAtualizacao?: string | null;
  flAtivo?: string | null;
}
