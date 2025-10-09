import {StatusAtivo} from "@/types/misc/types";

export interface AreaResponse {
  idArea: number;
  cdArea: string;
  nmArea: string;
  dsArea: string;
  flAtivo: StatusAtivo;
}

export interface AreaRequest {
  cdArea: string;
  nmArea: string;
  dsArea: string;
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

export interface AreaFilterParams {
  filtro?: string;
  cdArea?: string;
  nmArea?: string;
  dsArea?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface AreaExecutorAvancadoResponse {
  idArea: number;
  cdArea: string;
  nmArea: string;
  totalExecutores: number;
  nmResponsavel: string;
  nmCargos: string;
}

export const areaUtil = {
  OPERACAO: 1,
  CONSERVA: 2,
  SINALIZACAO: 3,
  REGULATORIO: 4,
  JURIDICO: 5,
  MEIO_AMBIENTE: 6,
  SEGURANCA_DO_TRABALHO: 7,
  ADMINISTRATIVO: 8,
  OUVIDORIA: 9,
  COMUNICACAO: 10,
  ENGENHARIA: 11,
  TECNOLOGIA_DA_INFORMACAO: 12,
  DIRETORIA: 13,
  RECURSOS_HUMANOS: 14
};