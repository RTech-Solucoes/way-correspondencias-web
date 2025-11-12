'use client';

import type { ReactNode } from 'react';
import { cn } from '@/utils/utils';

interface ConferenciaInfoRowProps {
  label: string;
  value: ReactNode;
  border?: boolean;
}

export function ConferenciaInfoRow({ label, value, border = true }: ConferenciaInfoRowProps) {
  return (
    <div
      className={cn(
        'grid items-start gap-6 px-8 py-5 text-sm sm:grid-cols-[160px_1fr]',
        border ? 'border-b border-gray-100' : '',
      )}
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</span>
      <div className="text-sm leading-relaxed text-gray-800">{value ?? '-'}</div>
    </div>
  );
}

