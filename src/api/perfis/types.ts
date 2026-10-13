import {StatusAtivo} from "@/utils/misc/status-ativo";
import { TipoResponsavelAnexoEnum } from "../anexos/type";

export interface PerfilResponse {
  idPerfil: number;
  nmPerfil: string;
  dsPerfil: string;
  flAtivo: StatusAtivo;
}

export interface PerfilRequest {
  nmPerfil: string;
  dsPerfil?: string;
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

export interface PerfilFilterParams {
  filtro?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const perfilUtil = {
  ADMINISTRADOR: 1,
  GESTOR_DO_SISTEMA: 2,
  VALIDADOR_ASSINANTE: 3,
  EXECUTOR_AVANCADO: 4,
  EXECUTOR: 5,
  EXECUTOR_RESTRITO: 6,
  TECNICO_SUPORTE: 7,
  SUPER_ADMIN: 8,
};

export const nivelAcessoPerfil: Record<number, number> = {
  [perfilUtil.SUPER_ADMIN]: 100,
  [perfilUtil.ADMINISTRADOR]: 90,
  [perfilUtil.GESTOR_DO_SISTEMA]: 80,
  [perfilUtil.VALIDADOR_ASSINANTE]: 60,
  [perfilUtil.EXECUTOR_AVANCADO]: 50,
  [perfilUtil.EXECUTOR]: 40,
  [perfilUtil.EXECUTOR_RESTRITO]: 30,
  [perfilUtil.TECNICO_SUPORTE]: 20,
};

export function getNivelAcessoPerfil(idPerfil?: number | null): number {
  if (!idPerfil) return 0;
  return nivelAcessoPerfil[idPerfil] ?? 0;
}

export function isElevacaoDePrivilegio(idPerfilAtual?: number | null, idPerfilNovo?: number | null): boolean {
  if (!idPerfilNovo || idPerfilAtual === idPerfilNovo) return false;
  return getNivelAcessoPerfil(idPerfilNovo) > getNivelAcessoPerfil(idPerfilAtual);
}

export function computeTpResponsavel(perfil: number): TipoResponsavelAnexoEnum {

  if (perfil === perfilUtil.ADMINISTRADOR || perfil === perfilUtil.SUPER_ADMIN || perfil === perfilUtil.GESTOR_DO_SISTEMA) {
    return TipoResponsavelAnexoEnum.R;
  }

  if (perfil === perfilUtil.VALIDADOR_ASSINANTE) {
    return TipoResponsavelAnexoEnum.D;
  }

  if (perfil === perfilUtil.EXECUTOR_AVANCADO) {
    return TipoResponsavelAnexoEnum.G;
  }

  if (perfil === perfilUtil.EXECUTOR || perfil === perfilUtil.EXECUTOR_RESTRITO || perfil === perfilUtil.TECNICO_SUPORTE) {
    return TipoResponsavelAnexoEnum.A;
  }
  return TipoResponsavelAnexoEnum.A;
}