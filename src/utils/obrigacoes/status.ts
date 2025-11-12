'use client';

import { StatusObrigacao, statusObrigacaoList } from '@/api/status-obrigacao/types';

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

export const getObrigacaoStatusStyle = (
  statusId?: string | number | null,
  statusName?: string | null,
): ObrigacaoStatusStyle => {
  if (!statusId && !statusName) {
    return DEFAULT_STYLE;
  }

  const parsedStatusId = statusId != null ? parseInt(statusId.toString(), 10) : undefined;
  const normalizedName = statusName?.toUpperCase() ?? '';

  const naoIniciadoStatus = statusObrigacaoList.find((s) => s.nmStatus === StatusObrigacao.NAO_INICIADO);
  if (
    (parsedStatusId && naoIniciadoStatus && parsedStatusId === naoIniciadoStatus.id) ||
    normalizedName.includes(StatusObrigacao.NAO_INICIADO)
  ) {
    return NAO_INICIADO_STYLE;
  }

  const concluidoStatus = statusObrigacaoList.find((s) => s.nmStatus === StatusObrigacao.CONCLUIDO);
  if (
    (parsedStatusId && concluidoStatus && parsedStatusId === concluidoStatus.id) ||
    normalizedName.includes(StatusObrigacao.CONCLUIDO)
  ) {
    return CONCLUIDO_STYLE;
  }

  return DEFAULT_STYLE;
};

