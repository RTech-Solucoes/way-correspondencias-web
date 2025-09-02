import type { TramitacaoResponse } from "./TramitacaoResponse";
import type { ResponsavelAreaResponse } from "./ResponsavelAreaResponse";

export interface TramitacaoAcaoResponse {
  idTramitacaoAcao: number;
  tramitacao: TramitacaoResponse;
  responsavelArea: ResponsavelAreaResponse;
  flAcao: string;
  dtCriacao: string;
  dtAtualizacao?: string;
  nrCpfCriacao?: string;
  nrCpfAtualizacao?: string;
  flAtivo: string;
}
