'use client';

import { SpinnerIcon } from '@phosphor-icons/react';
import {
  ConfiguracaoConcessionariaRequest,
  ConfiguracaoConcessionariaResponse,
} from '@/api/concessionaria/types';
import { cn } from '@/utils/utils';
import { getConfiguracaoProgress } from './configuracao-progress';

interface ConfiguracaoProgressProps {
  configuracao?: ConfiguracaoConcessionariaRequest | ConfiguracaoConcessionariaResponse | null;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function ConfiguracaoProgress({
  configuracao,
  loading = false,
  className,
  onClick,
}: ConfiguracaoProgressProps) {
  const progress = getConfiguracaoProgress(configuracao);
  const isPending = !loading && progress.percent < 100;
  const isClickable = Boolean(onClick);
  const barColor = progress.percent >= 100
    ? 'bg-green-600'
    : progress.percent >= 60
      ? 'bg-blue-600'
      : progress.percent > 0
        ? 'bg-amber-500'
        : 'bg-gray-300';

  const title = loading
    ? 'Calculando progresso da configuração'
    : isClickable
      ? `Abrir configurações — ${progress.filled} de ${progress.total} campos preenchidos`
      : `${progress.filled} de ${progress.total} campos preenchidos`;

  const content = (
    <>
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="font-medium text-gray-700">Configuração</span>
        <span className="inline-flex min-w-10 items-center justify-end font-semibold text-gray-700">
          {loading ? <SpinnerIcon className="h-3.5 w-3.5 animate-spin text-gray-400" /> : `${progress.percent}%`}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className={cn('h-full rounded-full transition-all', barColor)}
          style={{ width: `${loading ? 0 : progress.percent}%` }}
        />
      </div>
      {isPending ? (
        <span className="inline-flex w-fit rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
          Configuração pendente
        </span>
      ) : (
        <span className="text-[10px] text-gray-500">
          {loading ? 'Calculando...' : `${progress.filled}/${progress.total} campos preenchidos`}
        </span>
      )}
    </>
  );

  if (isClickable) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        className={cn(
          'flex w-full flex-col gap-1 rounded-md p-1 text-left transition-colors',
          'hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
          className,
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={cn('flex w-full flex-col gap-1', className)} title={title}>
      {content}
    </div>
  );
}
