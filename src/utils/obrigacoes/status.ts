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

  const naoIniciadoStatus = statusObrigacaoList.find((s) => s.nmStatus === StatusObrigacao.NAO_INICIADO);
  if (
    (parsedStatusId && naoIniciadoStatus && parsedStatusId === naoIniciadoStatus.id) ||
    normalizedName.includes(StatusObrigacao.NAO_INICIADO)
  ) {
    return NAO_INICIADO_STYLE;
  }

  const pendenteStatus = statusObrigacaoList.find((s) => s.nmStatus === StatusObrigacao.PENDENTE);
  if (
    (parsedStatusId && pendenteStatus && parsedStatusId === pendenteStatus.id) ||
    normalizedName.includes(StatusObrigacao.PENDENTE)
  ) {
    return PENDENTE_STYLE;
  }

  const atrasadaStatus = statusObrigacaoList.find((s) => s.nmStatus === StatusObrigacao.ATRASADA);
  if (
    (parsedStatusId && atrasadaStatus && parsedStatusId === atrasadaStatus.id) ||
    normalizedName.includes(StatusObrigacao.ATRASADA)
  ) {
    return ATRASADA_STYLE;
  }

  const concluidoStatus = statusObrigacaoList.find((s) => s.nmStatus === StatusObrigacao.CONCLUIDO);
  if (
    (parsedStatusId && concluidoStatus && parsedStatusId === concluidoStatus.id) ||
    normalizedName.includes(StatusObrigacao.CONCLUIDO)
  ) {
    return CONCLUIDO_STYLE;
  }

  const naoAplicavelSuspensaStatus = statusObrigacaoList.find((s) => s.nmStatus === StatusObrigacao.NAO_APLICAVEL_SUSPENSA);
  if (
    (parsedStatusId && naoAplicavelSuspensaStatus && parsedStatusId === naoAplicavelSuspensaStatus.id) ||
    normalizedName.includes(StatusObrigacao.NAO_APLICAVEL_SUSPENSA) ||
    normalizedName.includes('NÃO APLICÁVEL') ||
    normalizedName.includes('NAO APLICAVEL') ||
    normalizedName.includes('SUSPENSA')
  ) {
    return NAO_APLICAVEL_SUSPENSA_STYLE;
  }

  return DEFAULT_STYLE;
};

