import type { BaseResponse } from "./BaseResponse";
import type { SolicitacaoResponse } from "./SolicitacaoResponse";
import type { AnexoResponse } from "./AnexoResponse";
import type { EmailComAnexosResponse } from "./EmailComAnexosResponse";
import type { TramitacaoComAnexosResponse } from "./TramitacaoComAnexosResponse";

export interface SolicitacaoDetalheResponse extends BaseResponse {
  solicitacao: SolicitacaoResponse;
  anexosSolicitacao: AnexoResponse[];
  email: EmailComAnexosResponse;
  tramitacoes: TramitacaoComAnexosResponse[];
}
