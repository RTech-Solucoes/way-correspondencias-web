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
  areas?: AreaSolicitacao[];
  nmUsuarioCriacao?: string;
  email?: Email;
  statusSolicitacao?: StatusSolicitacao;
  area?: AreaSolicitacao[];
  tema?: AreaTema;
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
}

export interface SolicitacaoPrazoResponse {
  id: number;
  nrPrazoDias: number;
  statusCodigo?: number;
  tpPrazo?: string;
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
  page?: number;
  size?: number;
  sort?: string;
}

export interface BaseResponse {
  dtCriacao: string;
  dtAtualizacao?: string | null;
  nrCpfCriacao?: string | null;
  nrCpfAtualizacao?: string | null;
  flAtivo: string;
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
