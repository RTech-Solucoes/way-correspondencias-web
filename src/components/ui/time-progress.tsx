'use client';

import React from 'react';
import { cn, formatDateTime, normalizeText } from '@/utils/utils';

type TimeProgressProps = {
  start?: string | null;
  end?: string | null;
  now?: string | Date | null;
  finishedAt?: string | Date | null;
  className?: string;
  showLabels?: boolean;
  statusLabel?: string;
};

export enum TimeProgressStatus {
  EM_ANDAMENTO = 'Em andamento',
  PRAZO_CONCLUIDO = 'Prazo concluído',
  CONCLUIDO_COM_ATRASO = 'Concluído com atraso',
}
function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function parseDate(input?: string | Date | null): Date | null {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  const d = new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

export function getTimeProgressPercent(start?: string | null, end?: string | null, now?: string | Date | null): number | null {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  const nowDate = parseDate(now ?? new Date());

  if (!startDate || !endDate || !nowDate) return null;
  const totalMs = endDate.getTime() - startDate.getTime();
  if (totalMs <= 0) return null;
  const elapsedMs = nowDate.getTime() - startDate.getTime();
  const raw = (elapsedMs / totalMs) * 100;
  return clamp(raw);
}

const TimeProgress: React.FC<TimeProgressProps> = ({ start, end, now, finishedAt, className, showLabels = true, statusLabel }) => {
 

  if (!start && !end) {
    return (
      <div className={cn('flex flex-col gap-1 min-w-[200px]', className)}>
        <span className="text-gray-400 text-sm ">Aguardando início da tramitação</span>
      </div>
    );
  }
  const porcentagem = getTimeProgressPercent(start, end, now);

  const ConcluidoComAtraso = (() => {
    const endDate = parseDate(end);
    const doneDate = parseDate(finishedAt);
    if (!endDate || !doneDate) return false;
    return doneDate.getTime() > endDate.getTime();
  })();

  const AtrasadoAtual = (() => {
    const endDate = parseDate(end);
    const nowDate = parseDate(now ?? new Date());
    if (!endDate || !nowDate) return false;
    return nowDate.getTime() > endDate.getTime();
  })();

  const normalizedStatus = normalizeText(statusLabel || '');
  const isConcluido = normalizedStatus.includes('concluido') || normalizedStatus.includes('arquivado');

  const barColor = (() => {
    if (porcentagem == null) return 'bg-gray-300';
    if (isConcluido) {
      if (ConcluidoComAtraso) return 'bg-red-600';
      return 'bg-blue-600';
    }
    if (AtrasadoAtual) return 'bg-red-600';
    if (porcentagem >= 40) return 'bg-yellow-500';
    return 'bg-green-600';
  })();
  const wrapperTitle = start && end ? `Início: ${new Date(start).toLocaleString('pt-BR')}\nFim: ${new Date(end).toLocaleString('pt-BR')}` : 'Sem prazo';

  const bottom = (() => {
    if (isConcluido && ConcluidoComAtraso) return { text: 'Concluído com atraso', color: 'text-red-600' } as const;
    if (isConcluido) return { text: 'Concluído', color: 'text-blue-600' } as const;
    if (AtrasadoAtual) return { text: 'Em atraso', color: 'text-red-600' } as const;
    return { text: 'Em andamento', color: 'text-green-600' } as const;
  })();

  const displayPercent = (() => {
    if (porcentagem == null) return null;
    if (isConcluido) return 100;
    return Math.round(porcentagem);
  })();

  return (
    <div className={cn('flex flex-col gap-1 min-w-[200px]', className)} title={wrapperTitle}>
      {showLabels && start && end && (
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>{start ? formatDateTime(start) : '-'}</span>
          <span>{end ? formatDateTime(end) : '-'} </span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className={cn('h-full transition-all transition-colors', barColor)}
          style={{ width: `${displayPercent ?? 0}%` }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-[10px]">
        <span className={cn(bottom.color)}>
          {bottom.text}
        </span>
        <span className="text-gray-600">{displayPercent !== null ? `${displayPercent}%` : '-'}</span>
      </div>
    </div>
  );
};

export default TimeProgress;


