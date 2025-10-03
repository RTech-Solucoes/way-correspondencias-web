import { AnexoResponse } from "../anexos/type";
import { AreaResponse } from "../areas/types";
import { ResponsavelResponse } from "../responsaveis/types";
import { SolicitacaoParecerResponse } from "../solicitacao-parecer/types";
import { TramitacaoAcao } from "../tramitacoes/types";

export interface AreaSolicitacao {
  idArea: number;
  nmArea: string;
  cdArea?: string | null;
  dsArea?: string | null;
  flAtivo: string;
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
}

export interface Email {
  idEmail: number;
  dsRemetente: string;
  dsDestinatario: string;
  dsAssunto: string;
  dsCorpo: string;
  dtRecebimento: string;
  flAtivo: string;
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
  statusCodigo?: number;
  flStatus?: string;
  cdIdentificacao?: string;
  dsAssunto?: string;
  dsSolicitacao?: string;
  dsObservacao?: string;
  nrPrazo?: number;
  nrOficio?: string;
  flExcepcional?: string;
  nrProcesso?: string;
  tpPrazo?: string;
  dtPrazo?: string;
  flAnaliseGerenteDiretor?: string;
  nmResponsavel?: string;
  nmTema?: string;
  areas?: AreaSolicitacao[];
  nmUsuarioCriacao?: string;
  email?: Email;
  statusSolicitacao?: StatusSolicitacao;
  area?: AreaSolicitacao[];
  tema?: AreaTema;
  dtPrazoLimite?: string;
  dtPrimeiraTramitacao?: string;
  dtConclusaoTramitacao?: string;
}

export interface SolicitacaoRequest {
  idEmail?: number;
  idTema?: number;
  idResponsavel?: number;
  idStatusSolicitacao?: number;
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
  idsAreas?: number[];
  flExcepcional?: string;
  flAnaliseGerenteDiretor?: string;
  idsResponsaveisAssinates?: number[];
}

export interface SolicitacaoTemaRequest {
  idTema?: number;
}

export interface SolicitacaoIdentificacaoRequest {
  cdIdentificacao?: string;
  dsAssunto?: string;
  dsObservacao?: string;
  nrOficio?: string;
  nrProcesso?: string;
  flAnaliseGerenteDiretor?: string;
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

export interface SolicitacaoFilterParams {
  filtro?: string;
  idSolicitacao?: number;
  idStatusSolicitacao?: number;
  idArea?: number;
  cdIdentificacao?: string;
  idTema?: number;
  nomeResponsavel?: string;
  dtCriacaoInicio?: string;
  dtCriacaoFim?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface SolicitacaoPrazoItemRequest {
  idStatusSolicitacao: number;
  nrPrazoInterno?: number;
  tpPrazo?: string;
  flExcepcional?: string;
}

export interface SolicitacaoEtapaPrazoRequest {
  idTema?: number;
  nrPrazoInterno?: number;
  nrPrazoExterno?: number;
  flExcepcional?: string;
  solicitacoesPrazos: SolicitacaoPrazoItemRequest[];
}

export interface SolicitacaoTemaEtapaRequest {
  idTema: number;
  tpPrazo?: string;
  nrPrazoInterno?: number;
  nrPrazoExterno?: number;
  flExcepcional?: string;
  idsAreas?: number[];
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

export enum TipoHistoricoResposta {
  TRAMITACAO = 'TRAMITACAO',
  PARECER = 'PARECER'
}

export interface HistoricoRespostaItemResponse {
  tipo: TipoHistoricoResposta;
  id: number;
  dsDescricao: string;
  nmStatus: string;
  dtCriacao: string;
  responsavel: ResponsavelResponse;
  areaOrigem: AreaResponse;
  areaDestino: AreaResponse;
  nrTempoGasto: number;
}