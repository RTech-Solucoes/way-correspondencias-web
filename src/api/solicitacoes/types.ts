export interface SolicitacaoResponse {
  id: number;
  cdIdentificacao: string;
  dsAssunto: string;
  txConteudo: string;
  flStatus: string;
  dtCriacao: string;
  dtPrazoResposta?: string;
  dtResposta?: string;
  txResposta?: string;
  responsavel: {
    id: number;
    nmResponsavel: string;
    dsEmail: string;
  };
  tema: {
    id: number;
    nmTema: string;
    dsTema: string;
  };
  area: {
    id: number;
    nmArea: string;
    cdArea: string;
  };
}

export interface SolicitacaoRequest {
  dsAssunto: string;
  txConteudo: string;
  flStatus: string;
  dtPrazoResposta?: string;
  txResposta?: string;
  idResponsavel: number;
  idTema: number;
  idArea: number;
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
