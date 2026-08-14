'use client';

import { Button } from '@/components/ui/button';
import { TrashIcon } from '@phosphor-icons/react';
import { cn } from '@/utils/utils';

interface ResponsaveisSelectionBarProps {
  selectedCount: number;
  canDeletarResponsavel: boolean;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  isDeleting?: boolean;
  className?: string;
}

export function ResponsaveisSelectionBar({
  selectedCount,
  canDeletarResponsavel,
  onClearSelection,
  onDeleteSelected,
  isDeleting = false,
  className,
}: ResponsaveisSelectionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        'bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between',
        className
      )}
    >
      <span className="text-sm font-medium text-blue-900">
        {selectedCount} {selectedCount === 1 ? 'item selecionado' : 'itens selecionados'}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onClearSelection} disabled={isDeleting}>
          Limpar seleção
        </Button>
        {canDeletarResponsavel && (
          <Button variant="destructive" size="sm" onClick={onDeleteSelected} disabled={isDeleting}>
            <TrashIcon className="h-4 w-4 mr-2" />
            {isDeleting ? 'Excluindo...' : 'Excluir selecionados'}
          </Button>
        )}
      </div>
    </div>
  );
}
