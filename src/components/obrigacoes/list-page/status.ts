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

const VENCIDO_REGULATORIO_STYLE: ObrigacaoStatusStyle = {
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
    parsedStatusId === statusList.VENCIDO_REGULATORIO.id ||
    normalizedName.includes('VENCIDO_REGULATORIO') ||
    normalizedName.includes('VENCIDO REGULATÓRIO') ||
    normalizedName.includes('VENCIDO REGULATORIO')
  ) {
    return VENCIDO_REGULATORIO_STYLE;
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
export const CONCLUIDA_EM_ATRASO_LABEL = 'Concluída em atraso';

const CONCLUIDA_EM_ATRASO_STYLE: ObrigacaoStatusStyle = {
  variant: 'outline',
  backgroundColor: '#b45309',
  textColor: '#ffffff',
};

/** Campos mínimos para determinar como o status de uma obrigação deve ser apresentado. */
export interface ObrigacaoStatusSource {
  statusSolicitacao?: { idStatusSolicitacao?: number | null; nmStatus?: string | null } | null;
  /** Preenchido pela API apenas quando a obrigação foi concluída pelo fluxo administrativo. */
  concluidaEmAtraso?: boolean | null;
}

export const isObrigacaoConcluida = (obrigacao?: ObrigacaoStatusSource | null): boolean =>
  obrigacao?.statusSolicitacao?.idStatusSolicitacao === statusList.CONCLUIDO.id;

/**
 * Concluída pelo fluxo administrativo ("Registrar conclusão"). Obrigações concluídas pela tramitação
 * ou importadas como concluídas não entram aqui e mantêm o comportamento de sempre.
 */
export const isObrigacaoConcluidaAdministrativamente = (obrigacao?: ObrigacaoStatusSource | null): boolean =>
  isObrigacaoConcluida(obrigacao) && obrigacao?.concluidaEmAtraso != null;

/**
 * Concluída em atraso: classificação gravada na auditoria da conclusão administrativa
 * (data efetiva posterior à data limite original no momento da conclusão).
 */
export const isObrigacaoConcluidaEmAtraso = (obrigacao?: ObrigacaoStatusSource | null): boolean =>
  isObrigacaoConcluidaAdministrativamente(obrigacao) && obrigacao?.concluidaEmAtraso === true;

/**
 * Rótulo e cor do status da obrigação, já considerando "Concluída em atraso".
 * `conclusao` (detalhe da obrigação) tem prioridade quando informado.
 */
export const getObrigacaoStatusDisplay = (
  obrigacao?: ObrigacaoStatusSource | null,
  conclusao?: { concluidaEmAtraso: boolean } | null,
): { label: string; style: ObrigacaoStatusStyle } => {
  const emAtraso = isObrigacaoConcluida(obrigacao) && conclusao
    ? conclusao.concluidaEmAtraso
    : isObrigacaoConcluidaEmAtraso(obrigacao);
  if (emAtraso) {
    return { label: CONCLUIDA_EM_ATRASO_LABEL, style: CONCLUIDA_EM_ATRASO_STYLE };
  }
  return {
    label: obrigacao?.statusSolicitacao?.nmStatus || '-',
    style: getObrigacaoStatusStyle(
      obrigacao?.statusSolicitacao?.idStatusSolicitacao?.toString(),
      obrigacao?.statusSolicitacao?.nmStatus,
    ),
  };
};
