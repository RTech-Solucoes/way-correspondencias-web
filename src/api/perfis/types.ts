import {StatusAtivo} from "@/types/misc/types";
import { TipoResponsavelAnexo } from "../anexos/type";

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
  TECNICO_SUPORTE: 7
};

export function computeTpResponsavel(perfil: number): TipoResponsavelAnexo {

  if (perfil === perfilUtil.ADMINISTRADOR || perfil === perfilUtil.GESTOR_DO_SISTEMA) {
    return TipoResponsavelAnexo.R;
  }

  if (perfil === perfilUtil.VALIDADOR_ASSINANTE) {
    return TipoResponsavelAnexo.D;
  }

  if (perfil === perfilUtil.EXECUTOR_AVANCADO) {
    return TipoResponsavelAnexo.G;
  }

  if (perfil === perfilUtil.EXECUTOR || perfil === perfilUtil.EXECUTOR_RESTRITO || perfil === perfilUtil.TECNICO_SUPORTE) {
    return TipoResponsavelAnexo.A;
  }
  return TipoResponsavelAnexo.A;
}