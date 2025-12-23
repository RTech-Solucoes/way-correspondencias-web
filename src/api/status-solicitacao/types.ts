import { TipoEnum } from "../tipos/types";

export type StatusKey =
  | 'PRE_ANALISE'
  | 'VENCIDO_REGULATORIO'
  | 'EM_ANALISE_AREA_TECNICA'
  | 'VENCIDO_AREA_TECNICA'
  | 'ANALISE_REGULATORIA'
  | 'EM_APROVACAO'
  | 'EM_CHANCELA'
  | 'EM_ASSINATURA_DIRETORIA'
  | 'CONCLUIDO'
  | 'ARQUIVADO'
  | 'EM_ANALISE_GERENTE_REGULATORIO'
  | 'NAO_INICIADO'
  | 'PENDENTE'
  | 'EM_ANDAMENTO'
  | 'EM_VALIDACAO_REGULATORIO'
  | 'ATRASADA'
  | 'NAO_APLICAVEL_SUSPENSA'
  | 'APROVACAO_TRAMITACAO';

export interface StatusMeta {
  id: number;
  key: StatusKey;
  label: string; 
  tipo: TipoEnum;
}

export const STATUS_LIST: StatusMeta[] = [
  { id: 1, key: 'PRE_ANALISE', label: 'Pré-análise', tipo: TipoEnum.TODOS },
  { id: 2, key: 'VENCIDO_REGULATORIO', label: 'Vencido regulatório', tipo: TipoEnum.CORRESPONDENCIA },
  { id: 3, key: 'EM_ANALISE_AREA_TECNICA', label: 'Em análise da área técnica', tipo: TipoEnum.CORRESPONDENCIA },
  { id: 4, key: 'VENCIDO_AREA_TECNICA',  label: 'Vencido área técnica', tipo: TipoEnum.CORRESPONDENCIA },
  { id: 5, key: 'ANALISE_REGULATORIA', label: 'Análise regulatória', tipo: TipoEnum.TODOS },
  { id: 6, key: 'EM_APROVACAO', label: 'Em aprovação', tipo: TipoEnum.TODOS },
  { id: 7, key: 'EM_CHANCELA', label: 'Em chancela', tipo: TipoEnum.TODOS },
  { id: 8, key: 'EM_ASSINATURA_DIRETORIA', label: 'Em assinatura Diretoria', tipo: TipoEnum.TODOS },
  { id: 9, key: 'CONCLUIDO', label: 'Concluído', tipo: TipoEnum.TODOS },
  { id: 10, key: 'ARQUIVADO', label: 'Arquivado', tipo: TipoEnum.CORRESPONDENCIA },
  { id: 11, key: 'EM_ANALISE_GERENTE_REGULATORIO', label: 'Em análise Gerente do Regulatório', tipo: TipoEnum.TODOS },
  { id: 12, key: 'NAO_INICIADO', label: 'Não Iniciado', tipo: TipoEnum.OBRIGACAO },
  { id: 13, key: 'PENDENTE', label: 'Pendente', tipo: TipoEnum.OBRIGACAO },
  { id: 14, key: 'EM_ANDAMENTO', label: 'Em andamento', tipo: TipoEnum.OBRIGACAO },
  { id: 15, key: 'EM_VALIDACAO_REGULATORIO', label: 'Em validação regulatória', tipo: TipoEnum.OBRIGACAO },
  { id: 16, key: 'ATRASADA', label: 'Atrasada', tipo: TipoEnum.OBRIGACAO },
  { id: 17, key: 'NAO_APLICAVEL_SUSPENSA', label: 'Não aplicável/suspensa', tipo: TipoEnum.OBRIGACAO },
  { id: 18, key: 'APROVACAO_TRAMITACAO', label: 'Aprovação tramitação', tipo: TipoEnum.OBRIGACAO },
];

export const statusList: Record<StatusKey, StatusMeta> = {
  PRE_ANALISE: STATUS_LIST[0],
  VENCIDO_REGULATORIO: STATUS_LIST[1],
  EM_ANALISE_AREA_TECNICA: STATUS_LIST[2],
  VENCIDO_AREA_TECNICA: STATUS_LIST[3],
  ANALISE_REGULATORIA: STATUS_LIST[4],
  EM_APROVACAO: STATUS_LIST[5],
  EM_CHANCELA: STATUS_LIST[6],
  EM_ASSINATURA_DIRETORIA: STATUS_LIST[7],
  CONCLUIDO: STATUS_LIST[8],
  ARQUIVADO: STATUS_LIST[9],
  EM_ANALISE_GERENTE_REGULATORIO: STATUS_LIST[10],
  NAO_INICIADO: STATUS_LIST[11],
  PENDENTE: STATUS_LIST[12],
  EM_ANDAMENTO: STATUS_LIST[13],
  EM_VALIDACAO_REGULATORIO: STATUS_LIST[14],
  ATRASADA: STATUS_LIST[15],
  NAO_APLICAVEL_SUSPENSA: STATUS_LIST[16],
  APROVACAO_TRAMITACAO: STATUS_LIST[17],
};