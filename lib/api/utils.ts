import { TipoPerfil, StatusEmail, StatusObrigacao, TipoItem } from './types';

// Utility functions for API data transformation and validation

export const PERFIL_LABELS: Record<TipoPerfil, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  analyst: 'Analista',
  auditor: 'Auditor',
  consultant: 'Consultor',
};

export const STATUS_EMAIL_LABELS: Record<StatusEmail, string> = {
  NOVO: 'Novo',
  LIDO: 'Lido',
  RESPONDIDO: 'Respondido',
  ARQUIVADO: 'Arquivado',
};

export const STATUS_OBRIGACAO_LABELS: Record<StatusObrigacao, string> = {
  PENDENTE: 'Pendente',
  EM_ANDAMENTO: 'Em Andamento',
  CONCLUIDO: 'Concluído',
  ATRASADO: 'Atrasado',
};

export const TIPO_ITEM_LABELS: Record<TipoItem, string> = {
  CONTRATO: 'Contrato',
  LICENCA: 'Licença',
  AUDITORIA: 'Auditoria',
  COMPLIANCE: 'Compliance',
};

// Color mappings for status badges
export const STATUS_EMAIL_COLORS: Record<StatusEmail, string> = {
  NOVO: 'bg-blue-100 text-blue-800',
  LIDO: 'bg-gray-100 text-gray-800',
  RESPONDIDO: 'bg-green-100 text-green-800',
  ARQUIVADO: 'bg-yellow-100 text-yellow-800',
};

export const STATUS_OBRIGACAO_COLORS: Record<StatusObrigacao, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-800',
  EM_ANDAMENTO: 'bg-blue-100 text-blue-800',
  CONCLUIDO: 'bg-green-100 text-green-800',
  ATRASADO: 'bg-red-100 text-red-800',
};

// Date formatting utilities
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('pt-BR');
}

export function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('pt-BR');
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

// Data transformation utilities
export function transformApiError(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'Erro desconhecido';
}

export function createDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function parseDateString(dateString: string): Date | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

// Pagination utilities
export function calculateTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}

export function getPageRange(currentPage: number, totalPages: number, maxVisible: number = 5): number[] {
  const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);
  
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// Search and filter utilities
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function createSearchFilter<T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] {
  if (!searchTerm.trim()) return items;
  
  const lowercaseSearch = searchTerm.toLowerCase();
  
  return items.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowercaseSearch);
      }
      return false;
    })
  );
}

// Export all utilities
export default {
  PERFIL_LABELS,
  STATUS_EMAIL_LABELS,
  STATUS_OBRIGACAO_LABELS,
  TIPO_ITEM_LABELS,
  STATUS_EMAIL_COLORS,
  STATUS_OBRIGACAO_COLORS,
  formatDate,
  formatDateTime,
  isValidEmail,
  isValidDate,
  transformApiError,
  createDateString,
  parseDateString,
  calculateTotalPages,
  getPageRange,
  debounce,
  createSearchFilter,
};