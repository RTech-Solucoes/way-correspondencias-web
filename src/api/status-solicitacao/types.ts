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
  | 'ARQUIVADO';

export interface StatusMeta {
  id: number;
  key: StatusKey;
  label: string; 
}

export const STATUS_LIST: StatusMeta[] = [
  { id: 1, key: 'PRE_ANALISE', label: 'Pré-análise' },
  { id: 2, key: 'VENCIDO_REGULATORIO', label: 'Vencido regulatório' },
  { id: 3, key: 'EM_ANALISE_AREA_TECNICA', label: 'Em análise da área técnica' },
  { id: 4, key: 'VENCIDO_AREA_TECNICA',  label: 'Vencido área técnica' },
  { id: 5, key: 'ANALISE_REGULATORIA', label: 'Análise regulatória' },
  { id: 6, key: 'EM_APROVACAO', label: 'Em aprovação' },
  { id: 7, key: 'EM_CHANCELA', label: 'Em chancela' },
  { id: 8, key: 'EM_ASSINATURA_DIRETORIA', label: 'Em assinatura Diretoria' },
  { id: 9, key: 'CONCLUIDO', label: 'Concluído' },
  { id: 10, key: 'ARQUIVADO', label: 'Arquivado' },
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
};
