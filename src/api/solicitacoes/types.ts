export interface AreaSolicitacao {
  idArea: number;
  nmArea: string;
}

export interface AreaTema {
  idTema: number;
  nmTema: string;
}

export interface SolicitacaoResponse {
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
  dtCriacao?: string;
  dtAtualizacao?: string;
  nmResponsavel?: string;
  nmTema?: string;
  areas?: AreaSolicitacao[];
  nmUsuarioCriacao: string;
  dtPrazo?: string;
  area: AreaSolicitacao;
  tema: AreaTema;
}

export interface SolicitacaoRequest {
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
  idsAreas?: number[];
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
  // Estrutura a ser definida conforme necessário
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

export interface SolicitacaoPrazoItemRequest {
  idStatusSolicitacao: number;
  nrPrazoInterno?: number;
  tpPrazo?: string; // 'U' ou 'C'
  flExcepcional?: string; // 'S' | 'N'
}

export interface SolicitacaoEtapaPrazoRequest {
  nrPrazoInterno?: number; // prazo geral interno
  nrPrazoExterno?: number; // se vier a ser usado
  solicitacoesPrazos: SolicitacaoPrazoItemRequest[];
}

export interface SolicitacaoTemaEtapaRequest {
  idTema: number;
  tpPrazo?: string; // TipoPrazo
  nrPrazoInterno?: number;
  nrPrazoExterno?: number;
  flExcepcional?: string; // 'S' | 'N'
  idsAreas?: number[];
}
