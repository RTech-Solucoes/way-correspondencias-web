'use client';

import { formatDateBr } from '@/utils/utils';

export const getCriticidadeBadgeClasses = (criticidade?: string | null) => {
  if (!criticidade) {
    return 'bg-gray-200 text-gray-700';
  }

  const normalized = criticidade.toLowerCase();

  if (normalized.includes('alta')) {
    return 'bg-red-100 text-red-600';
  }

  if (normalized.includes('média') || normalized.includes('media')) {
    return 'bg-yellow-100 text-yellow-600';
  }

  if (normalized.includes('baixa')) {
    return 'bg-emerald-100 text-emerald-600';
  }

  return 'bg-slate-100 text-slate-600';
};

export const normalizeDate = (value?: string | null) => {
  if (!value) return '-';
  const [datePart] = value.split('T');
  return formatDateBr(datePart);
};

