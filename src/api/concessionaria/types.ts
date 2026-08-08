import { StatusAtivo } from "@/utils/misc/status-ativo";

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface ConcessionariaResponse {
  idConcessionaria: number;
  cdConcessionaria: string;
  nmConcessionaria: string;
  dsConcessionaria: string;
  nrCnpj?: string | null;
  dsTelefone?: string | null;
  sgUf?: string | null;
  dsRodoviaTrecho?: string | null;
  nrContratoAntt?: string | null;
  flAtivo: StatusAtivo;
  configuracaoCadastrada: boolean;
}

export interface AnoConcessaoConcessionariaResponse {
  dtBaseInicioConcessao: string;
  dtLimiteConcessao: string;
}

export interface ConcessionariaRequest {
  cdConcessionaria: string;
  nmConcessionaria: string;
  dsConcessionaria?: string | null;
  nrCnpj?: string | null;
  dsTelefone?: string | null;
  sgUf?: string | null;
  dsRodoviaTrecho?: string | null;
  nrContratoAntt?: string | null;
  flAtivo?: StatusAtivo;
}

export interface ConcessionariaCadastroCompletoRequest {
  concessionaria: ConcessionariaRequest;
  configuracao: ConfiguracaoConcessionariaRequest;
}

export interface ConcessionariaFilterParams {
  filtro?: string;
  cdConcessionaria?: string;
  nmConcessionaria?: string;
  dsConcessionaria?: string;
  flAtivo?: StatusAtivo;
  page?: number;
  size?: number;
  sort?: string;
}

export interface ConfiguracaoConcessionariaRequest {
  dtInboxInicio: string | null;
  dsInboxEmail: string | null;
  dsInboxClientId: string | null;
  dsInboxTenantKeyId: string | null;
  dsInboxSecret?: string | null;
  dsSmtpMailHost: string | null;
  dsSmtpPort: number | null;
  dsSmtpUsername: string | null;
  dsSmtpPassword?: string | null;
  dtBaseInicioConcessao: string | null;
  dtLimiteConcessao: string | null;
  nrCodigoIdentificacao?: string | null;
  flAtivo?: StatusAtivo;
}

export interface ConfiguracaoConcessionariaResponse {
  idConfiguracaoConcessionaria: number;
  idConcessionaria: number;
  dtInboxInicio: string | null;
  dsInboxEmail: string | null;
  dsInboxClientId: string | null;
  dsInboxTenantKeyId: string | null;
  inboxSecretConfigurado: boolean;
  dsSmtpMailHost: string | null;
  dsSmtpPort: number | null;
  dsSmtpUsername: string | null;
  smtpPasswordConfigurada: boolean;
  dtBaseInicioConcessao: string | null;
  dtLimiteConcessao: string | null;
  nrCodigoIdentificacao?: string | null;
  flAtivo: StatusAtivo;
}
