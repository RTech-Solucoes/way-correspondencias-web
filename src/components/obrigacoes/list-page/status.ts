'use client';

import { statusList } from '@/api/status-solicitacao/types';

export type ObrigacaoBadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export interface ObrigacaoStatusStyle {
  variant: ObrigacaoBadgeVariant;
  backgroundColor: string;
  textColor: string;
}

const DEFAULT_STYLE: ObrigacaoStatusStyle = {
  variant: 'default',
  backgroundColor: '#1447e6',
  textColor: '#ffffff',
};

const PRE_ANALISE_STYLE: ObrigacaoStatusStyle = {
  variant: 'secondary',
  backgroundColor: '#b68500',
  textColor: '#ffffff',
};

const NAO_INICIADO_STYLE: ObrigacaoStatusStyle = {
  variant: 'secondary',
  backgroundColor: '#b68500',
  textColor: '#ffffff',
};

const CONCLUIDO_STYLE: ObrigacaoStatusStyle = {
  variant: 'outline',
  backgroundColor: '#008000',
  textColor: '#ffffff',
};

const PENDENTE_STYLE: ObrigacaoStatusStyle = {
  variant: 'destructive',
  backgroundColor: '#dc2626',
  textColor: '#ffffff',
};

const ATRASADA_STYLE: ObrigacaoStatusStyle = {
  variant: 'destructive',
  backgroundColor: '#dc2626',
  textColor: '#ffffff',
};

const NAO_APLICAVEL_SUSPENSA_STYLE: ObrigacaoStatusStyle = {
  variant: 'secondary',
  backgroundColor: '#ea580c',
  textColor: '#ffffff',
};

export const getObrigacaoStatusStyle = (
  statusId?: string | number | null,
  statusName?: string | null,
): ObrigacaoStatusStyle => {
  if (!statusId && !statusName) {
    return DEFAULT_STYLE;
  }

  const parsedStatusId = statusId != null ? parseInt(statusId.toString(), 10) : undefined;
  const normalizedName = statusName?.toUpperCase() ?? '';

  if (
    parsedStatusId === 1 ||
    normalizedName.includes('PRE_ANALISE') ||
    normalizedName.includes('PRE-ANALISE')
  ) {
    return PRE_ANALISE_STYLE;
  }

  if (
    parsedStatusId === statusList.NAO_INICIADO.id ||
    normalizedName.includes('NAO_INICIADO') ||
    normalizedName.includes('NÃO INICIADO')
  ) {
    return NAO_INICIADO_STYLE;
  }

  if (
    parsedStatusId === statusList.PENDENTE.id ||
    normalizedName.includes('PENDENTE')
  ) {
    return PENDENTE_STYLE;
  }

  if (
    parsedStatusId === statusList.ATRASADA.id ||
    normalizedName.includes('ATRASADA')
  ) {
    return ATRASADA_STYLE;
  }

  if (
    parsedStatusId === statusList.CONCLUIDO.id ||
    normalizedName.includes('CONCLUIDO')
  ) {
    return CONCLUIDO_STYLE;
  }

  if (
    parsedStatusId === statusList.NAO_APLICAVEL_SUSPENSA.id ||
    normalizedName.includes('NAO_APLICAVEL_SUSPENSA') ||
    normalizedName.includes('NAO APLICAVEL/SUSPENSA')
  ) {
    return NAO_APLICAVEL_SUSPENSA_STYLE;
  }

  return DEFAULT_STYLE;
};