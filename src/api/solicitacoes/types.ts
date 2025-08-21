import {StatusAtivo} from "@/types/misc/types";

export interface SolicitacaoResponse {
  id: number;
  idSolicitacao: number;
  idEmail: number;
  idTema: number;
  nmTema: string;
  tema: {
    idTema: number;
    nmTema: string;
  };
  idResponsavel: number;
  nmResponsavel: string;
  idArea?: number;
  area?: {
    idArea: number;
    nmArea: string;
  };
  cdIdentificacao: string;
  dsAssunto: string;
  dsSolicitacao: string;
  dsObservacao: string;
  nrPrazo: number;
  tpPrazo: string;
  flStatus: 'P' | 'V' | 'A' | 'T' | 'R' | 'O' | 'S' | 'C' | 'X';
  flAtivo: StatusAtivo;
  dtCriacao: string;
}

export interface SolicitacaoRequest {
  idEmail?: number;
  idTema: number;
  idResponsavel: number;
  cdIdentificacao: string;
  dsAssunto?: string;
  dsSolicitacao?: string;
  dsObservacao?: string;
  nrPrazo?: number;
  tpPrazo?: string;
  flStatus: 'P' | 'V' | 'A' | 'T' | 'R' | 'O' | 'S' | 'C' | 'X';
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
