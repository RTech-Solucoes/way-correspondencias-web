import {StatusAtivo} from "@/types/misc/types";

export interface TramitacaoResponse {
  idTramitacao: number;
  idSolicitacao: number;
  idResponsavelAreaOrigem: number;
  idResponsavelAreaDestino: number;
  flAtivo: StatusAtivo;
  solicitacao?: {
    id: number;
    numero: string;
    assunto: string;
  };
  responsavelAreaOrigem?: {
    id: number;
    nome: string;
    area: string;
  };
  responsavelAreaDestino?: {
    id: number;
    nome: string;
    area: string;
  };
}

export interface TramitacaoRequest {
  idSolicitacao: number;
  idResponsavelAreaOrigem: number;
  idResponsavelAreaDestino: number;
}

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

export interface TramitacaoFilterParams {
  filtro?: string;
  page?: number;
  size?: number;
  sort?: string;
}