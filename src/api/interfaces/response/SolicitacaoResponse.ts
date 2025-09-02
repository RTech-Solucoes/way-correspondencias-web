import type { BaseResponse } from "./BaseResponse";
import type { AreaSolicitacaoResponse } from "./AreaSolicitacaoResponse";
import type { AreaTemaResponse } from "./AreaTemaResponse";
import type { EmailResponse } from "./EmailResponse";
import type { StatusSolicitacaoResponse } from "./StatusSolicitacaoResponse";

export interface SolicitacaoResponse extends BaseResponse {
  idSolicitacao: number;
  idEmail?: number;
  idTema?: number;
  idResponsavel?: number;
  statusCodigo?: number;
  flStatus?: string;
  cdIdentificacao?: string;
  dsAssunto?: string;
  dsSolicitacao?: string;
  dsObservacao?: string;
  nrPrazo?: number;
  nrOficio?: string;
  nrProcesso?: string;
  tpPrazo?: string;
  dtPrazo?: string;
  nmResponsavel?: string;
  nmTema?: string;
  areas?: AreaSolicitacaoResponse[];
  nmUsuarioCriacao?: string;
  email?: EmailResponse;
  statusSolicitacao?: StatusSolicitacaoResponse;
  area?: AreaSolicitacaoResponse[];
  tema?: AreaTemaResponse;
}
