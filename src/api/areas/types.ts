import {StatusAtivo} from "@/utils/misc/status-ativo";

export enum CdAreaEnum {
  OPERACAO = "OPE",
  CONSERVA = "CONS",
  SINALIZACAO = "SIN",
  REGULATORIO = "REG",
  JURIDICO = "JUR",
  MEIO_AMBIENTE = "MA",
  SEGURANCA_DO_TRABALHO = "SST",
  ADMINISTRATIVO = "ADM",
  OUVIDORIA = "OUV",
  COMUNICACAO = "COM",
  ENGENHARIA = "ENG",
  TECNOLOGIA_DA_INFORMACAO = "TI",
  DIRETORIA = "DIR",
  RECURSOS_HUMANOS = "RH",
  ARRECADACAO = "ARREC"
}

/** Áreas criadas automaticamente por concessionária e que não podem ser excluídas. */
export const AREAS_OBRIGATORIAS_SISTEMA = [
  CdAreaEnum.DIRETORIA,
  CdAreaEnum.REGULATORIO,
] as const;

export function isAreaObrigatoriaSistema(cdArea?: string | null): boolean {
  if (!cdArea) return false;
  const codigo = cdArea.trim().toUpperCase();
  return AREAS_OBRIGATORIAS_SISTEMA.some((item) => item === codigo);
}

export interface AreaResponse {
  idArea: number;
  cdArea: string;
  nmArea: string;
  dsArea: string;
  flAtivo: StatusAtivo;
  idConcessionaria?: number;
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
