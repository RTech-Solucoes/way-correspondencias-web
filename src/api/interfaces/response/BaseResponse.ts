export interface BaseResponse {
  dtCriacao: string;
  dtAtualizacao?: string | null;
  nrCpfCriacao?: string | null;
  nrCpfAtualizacao?: string | null;
  flAtivo: string;
}
