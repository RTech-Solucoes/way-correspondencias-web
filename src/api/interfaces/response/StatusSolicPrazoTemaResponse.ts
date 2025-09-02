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
