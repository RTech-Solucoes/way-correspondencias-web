'use client';

import { CalendarBlankIcon, ClockCounterClockwiseIcon, ProhibitIcon, UserIcon } from '@phosphor-icons/react';
import { ConcessionariaResponse, temRegistroDesativacao } from '@/api/concessionaria/types';
import { cn } from '@/utils/utils';

export function formatDataHoraDesativacao(dataIso?: string | null): string {
  if (!dataIso) return '';
  try {
    return new Date(dataIso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

type RegistroDesativacaoVariant = 'danger' | 'neutral' | 'plain';

interface RegistroDesativacaoProps {
  concessionaria?: ConcessionariaResponse | null;
  title?: string;
  variant?: RegistroDesativacaoVariant;
  className?: string;
}

const CONTAINER_BY_VARIANT: Record<RegistroDesativacaoVariant, string> = {
  danger: 'rounded-lg border border-red-200 bg-red-50 px-3 py-2.5',
  neutral: 'rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5',
  plain: '',
};

const TITLE_BY_VARIANT: Record<RegistroDesativacaoVariant, string> = {
  danger: 'text-red-900',
  neutral: 'text-gray-700',
  plain: 'text-xs font-semibold uppercase tracking-wide text-gray-500',
};

const MOTIVO_BY_VARIANT: Record<RegistroDesativacaoVariant, string> = {
  danger: 'text-red-900',
  neutral: 'text-gray-800',
  plain: 'text-gray-800',
};

const META_BY_VARIANT: Record<RegistroDesativacaoVariant, string> = {
  danger: 'text-red-700',
  neutral: 'text-gray-500',
  plain: 'border-t border-gray-100 pt-2 text-gray-600',
};


export default function RegistroDesativacao({
  concessionaria,
  title,
  variant = 'danger',
  className,
}: RegistroDesativacaoProps) {
  if (!concessionaria || !temRegistroDesativacao(concessionaria)) return null;

  const desativada = concessionaria.flAtivo === 'N';
  const tituloPadrao = desativada ? 'Concessionária desativada' : 'Última desativação registrada';
  const Icone = desativada ? ProhibitIcon : ClockCounterClockwiseIcon;

  return (
    <div className={cn(CONTAINER_BY_VARIANT[variant], 'min-w-0 max-w-full space-y-1', className)}>
      <p className={cn('flex items-center gap-1.5 text-sm font-medium', TITLE_BY_VARIANT[variant])}>
        {variant !== 'plain' && <Icone className="h-4 w-4 flex-shrink-0" weight="bold" />}
        {title || tituloPadrao}
      </p>

      <p
        className={cn(
          'whitespace-pre-line text-sm [overflow-wrap:anywhere]',
          MOTIVO_BY_VARIANT[variant],
        )}
      >
        {concessionaria.dsMotivoDesativacao}
      </p>

      <div className={cn('space-y-0.5 text-xs', META_BY_VARIANT[variant])}>
        <p className="flex items-start gap-1.5">
          <UserIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span className="[overflow-wrap:anywhere]">
            {concessionaria.nmResponsavelDesativacao || 'Usuário não identificado'}
          </span>
        </p>
        {concessionaria.dtDesativacao && (
          <p className="flex items-start gap-1.5">
            <CalendarBlankIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            <span>{formatDataHoraDesativacao(concessionaria.dtDesativacao)}</span>
          </p>
        )}
      </div>
    </div>
  );
}
