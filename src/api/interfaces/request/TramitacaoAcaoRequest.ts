import { ResponsavelAreaRequest } from "./ResponsavelAreaRequest";
import { TramitacaoRequest } from "./TramitacaoRequest";

export interface TramitacaoAcaoRequest {
  idTramitacaoAcao: number;
  tramitacao: TramitacaoRequest;
  responsavelArea: ResponsavelAreaRequest;
  flAcao: string;
  dtCriacao: string;
  dtAtualizacao?: string;
  nrCpfCriacao?: string;
  nrCpfAtualizacao?: string;
  flAtivo: string;
}
