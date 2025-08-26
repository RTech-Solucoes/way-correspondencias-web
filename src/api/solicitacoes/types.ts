export enum TipoPrazo {
  DIAS_UTEIS = 'DIAS_UTEIS',
  DIAS_CORRIDOS = 'DIAS_CORRIDOS'
}

export interface AreaSolicitacao {
  idArea: number;
  nmArea: string;
}

export interface SolicitacaoResponse {
  idSolicitacao: number;
  idEmail?: number;
  idTema?: number;
  idResponsavel?: number;
  statusCodigo?: number;
  flStatus?: string; // Status como string (P, A, C, etc.)
  cdIdentificacao?: string;
  dsAssunto?: string;
  dsSolicitacao?: string;
  dsObservacao?: string;
  nrPrazo?: number;
  nrOficio?: string;
  nrProcesso?: string;
  tpPrazo?: TipoPrazo | string;
  dtCriacao?: string;
  dtAtualizacao?: string;
  nmResponsavel?: string; // Nome do responsável para exibição
  nmTema?: string; // Nome do tema para exibição
  areas?: AreaSolicitacao[]; // Áreas associadas
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
  tpPrazo?: TipoPrazo | string;
  idsAreas?: number[]; // IDs das áreas para associar
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
