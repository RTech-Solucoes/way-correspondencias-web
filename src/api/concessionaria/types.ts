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
  nmRazaoSocial?: string | null;
  nmFantasia?: string | null;
  dsConcessionaria: string;
  nrCnpj?: string | null;
  dsTelefone?: string | null;
  sgUf?: string | null;
  dsEndereco?: string | null;
  dsRodoviaTrecho?: string | null;
  dsSegmentoConcessao?: string | null;
  nrKmInicial?: number | null;
  nrKmFinal?: number | null;
  nrContratoAntt?: string | null;
  dtAssinaturaContrato?: string | null;
  dtAssuncao?: string | null;
  flAtivo: StatusAtivo;
  configuracaoCadastrada: boolean;
  unicaAtiva?: boolean;
  dsMotivoDesativacao?: string | null;
  dtDesativacao?: string | null;
  idResponsavelDesativacao?: number | null;
  nmResponsavelDesativacao?: string | null;
}

export interface ConcessionariaDesativacaoRequest {
  dsMotivoDesativacao: string;
}

export const MOTIVO_DESATIVACAO_MIN_LENGTH = 10;
export const MOTIVO_DESATIVACAO_MAX_LENGTH = 500;

export const MOTIVOS_DESATIVACAO_SUGERIDOS = [
  'Contrato de concessão encerrado',
  'Suspensão temporária das operações',
  'Cadastro duplicado ou incorreto',
  'Solicitação da própria concessionária',
  'Determinação da diretoria',
] as const;

export function temRegistroDesativacao(concessionaria: ConcessionariaResponse): boolean {
  return Boolean(concessionaria.dsMotivoDesativacao);
}

export function estaDesativadaComRegistro(concessionaria: ConcessionariaResponse): boolean {
  return concessionaria.flAtivo === 'N' && temRegistroDesativacao(concessionaria);
}

export const MENSAGEM_UNICA_CONCESSIONARIA_ATIVA =
  'Não é possível desativar a única concessionária ativa. É necessário manter ao menos uma concessionária ativa para que o acesso ao sistema continue disponível.';

export function isUnicaConcessionariaAtiva(concessionaria: ConcessionariaResponse): boolean {
  return concessionaria.flAtivo === 'S' && Boolean(concessionaria.unicaAtiva);
}

export interface AnoConcessaoConcessionariaResponse {
  dtBaseInicioConcessao: string;
  dtLimiteConcessao: string;
}

export interface ConcessionariaRequest {
  cdConcessionaria: string;
  nmConcessionaria: string;
  nmRazaoSocial?: string | null;
  nmFantasia?: string | null;
  dsConcessionaria?: string | null;
  nrCnpj?: string | null;
  dsTelefone?: string | null;
  sgUf?: string | null;
  dsEndereco?: string | null;
  dsRodoviaTrecho?: string | null;
  dsSegmentoConcessao?: string | null;
  nrKmInicial?: number | null;
  nrKmFinal?: number | null;
  nrContratoAntt?: string | null;
  dtAssinaturaContrato?: string | null;
  dtAssuncao?: string | null;
  flAtivo?: StatusAtivo;
  dsMotivoDesativacao?: string | null;
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
