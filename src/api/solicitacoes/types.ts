import { AnexoResponse } from "../anexos/type";
import { SolicitacaoParecerResponse } from "../solicitacao-parecer/types";
import { TipoResponse } from "../tipos/types";
import { TramitacaoAcao } from "../tramitacoes/types";

export interface AreaSolicitacao {
  idArea: number;
  nmArea: string;
  cdArea?: string | null;
  dsArea?: string | null;
  flAtivo: string;
  tipoArea?: TipoResponse | null;
  idConcessionaria?: number;
}

export interface AreaTema {
  idTema: number;
  nmTema: string;
  dsTema?: string | null;
  nrPrazo: number;
  nrPrazoExterno: number;
  tpPrazo: string;
  flAtivo: string;
  areas?: AreaSolicitacao[];
  idConcessionaria?: number;
}

export interface Email {
  idEmail: number;
  dsRemetente: string;
  dsDestinatario: string;
  dsAssunto: string;
  dsCorpo: string;
  dtRecebimento: string;
  flAtivo: string;
  idConcessionaria?: number;
}

export interface StatusSolicitacao {
  idStatusSolicitacao: number;
  nmStatus: string;
  dsStatus?: string | null;
  flAtiv?: string | null;
  flAtivo?: string | null;
}

export interface BaseResponse {
  dtCriacao: string;
  dtAtualizacao?: string | null;
  nrCpfCriacao?: string | null;
  nrCpfAtualizacao?: string | null;
  flAtivo: string;
}

export interface SolicitacaoResponse extends BaseResponse {
  idSolicitacao: number;
  idEmail?: number;
  idTema?: number;
  idResponsavel?: number;
  idAreaInicial?: number;
  idConcessionaria?: number;
  statusCodigo?: number;
  flStatus?: string;
  cdIdentificacao?: string;
  dsObservacao?: string;
  nrPrazo?: number;
  flExcepcional?: string;
  nrProcesso?: string;
  tpPrazo?: string;
  dtPrazo?: string;
  flAnaliseGerenteDiretor?: string;
  nmResponsavel?: string;
  nmTema?: string;
  areas?: AreaSolicitacao[];
  nmUsuarioCriacao?: string;
  statusSolicitacao?: StatusSolicitacao;
  area?: AreaSolicitacao[];
  tema?: AreaTema;
  dtConclusaoTramitacao?: string;
  flExigeCienciaGerenteRegul?: string;
}

export interface SolicitacaoPrazoItemRequest {
  idStatusSolicitacao: number;
  idTema?: number;
  nrPrazoInterno?: number;
  nrPrazoExterno?: number;
  tpPrazo?: string;
  flExcepcional?: string;
}

export interface SolicitacaoAssinanteItemRequest {
  idSolicitacao?: number;
  idStatusSolicitacao: number;
  idResponsavel: number;
}

export interface SolicitacaoTemaRequest {
  idTema?: number;
}

export interface SolicitacaoPrazoResponse {
  idSolicitacaoPrazo: number;
  idStatusSolicitacao: number;
  idSolicitacao: number;
  nrPrazoInterno: number;
  nrPrazoDias: number;
  statusCodigo?: number;
  tpPrazo?: string;
  flExcepcional?: string;
  dtPrazoLimite?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface EmailComAnexosResponse {
  email: Email;
  anexos: AnexoResponse[];
}

export interface TramitacaoResponse extends BaseResponse {
  idTramitacao: number;
  idSolicitacao: number;
  flAprovado?: string;
  idStatusSolicitacao?: number;
  dsTramitacao?: string;
  dtTramitacao?: string;
  dsObservacao?: string;
  nrNivel?: number;
  solicitacao: SolicitacaoResponse;
  tramitacaoAcao: TramitacaoAcao[];
  areaOrigem: AreaSolicitacao;
  areaDestino: AreaSolicitacao;
  tramitacaoRef?: TramitacaoResponse;
  idTramitacaoRef?: number;
  solicitacaoParecerRef?: SolicitacaoParecerResponse;
  idSolicitacaoParecerRef?: number | null;
}

export interface TramitacaoComAnexosResponse {
  tramitacao: TramitacaoResponse;
  anexos: AnexoResponse[];
}

export interface SolicitacaoDetalheResponse extends BaseResponse {
  solicitacao: SolicitacaoResponse;
  statusSolicitacao: StatusSolicitacao;
  solcitacaoPrazos: SolicitacaoPrazoResponse[];
  solicitacaoPareceres: SolicitacaoParecerResponse[];
  anexosSolicitacao: AnexoResponse[];
  email: EmailComAnexosResponse;
  tramitacoes: TramitacaoComAnexosResponse[];
  solicitacoesAssinantes: SolicitacaoAssinanteResponse[];
}

export interface SolicitacaoAssinanteRequest {
  idSolicitacao: number;
  idStatusSolicitacao: number;
  idResponsavel: number;
}

export interface SolicitacaoAssinanteResponse extends BaseResponse {
  idSolicitacaoAssinantem: number;
  idSolicitacao: number;
  idStatusSolicitacao: number;
  idResponsavel: number;
}

export interface SolicitacaoBuscaSimpleResponse {
  idSolicitacao: number;
  cdIdentificacao: string;
}

export interface SolicitacaoEtapaPrazoRequest {
  idTema?: number;
  nrPrazoInterno?: number;
  nrPrazoExterno?: number;
  flExcepcional?: string;
  solicitacoesPrazos: SolicitacaoPrazoItemRequest[];
}

export enum AnaliseGerenteDiretor {
  D = 'D', // Diretor
  G = 'G', // Gerente
  A = 'A', // Ambos
  N = 'N'  // Não Necessita
}

export const getTipoAprovacaoLabel = (tipoAnalise?: string) => {
  switch (tipoAnalise) {
    case AnaliseGerenteDiretor.G:
      return 'Gerente';
    case AnaliseGerenteDiretor.D:
      return 'Diretor';
    case AnaliseGerenteDiretor.A:
      return 'Ambos';
    case AnaliseGerenteDiretor.N:
      return 'Não Necessita';
    default:
      return '—';
  }
};
