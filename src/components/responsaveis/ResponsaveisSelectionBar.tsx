'use client';

import { getLayoutClient, ClienteEnum } from '@/lib/layout/layout-client';
import { Button } from '@/components/ui/button';
import { SpinnerIcon, TrashIcon } from '@phosphor-icons/react';
import { cn } from '@/utils/utils';

interface ResponsaveisSelectionBarProps {
  selectedCount: number;
  canDeletarResponsavel: boolean;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  isDeleting?: boolean;
  isSelectingAll?: boolean;
  totalElements?: number;
  className?: string;
}

export function ResponsaveisSelectionBar({
  selectedCount,
  canDeletarResponsavel,
  onClearSelection,
  onDeleteSelected,
  isDeleting = false,
  isSelectingAll = false,
  totalElements,
  className,
}: ResponsaveisSelectionBarProps) {
  if (getLayoutClient() !== ClienteEnum.RTECH || selectedCount === 0) return null;

  return (
    <div
      className={cn(
        'bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between',
        className
      )}
    >
      <span className="text-sm font-medium text-blue-900 flex items-center gap-2">
        {isSelectingAll && <SpinnerIcon className="h-4 w-4 animate-spin" />}
        {isSelectingAll
          ? `Selecionando todos os itens... ${selectedCount}${totalElements ? ` de ${totalElements}` : ''}`
          : `${selectedCount} ${selectedCount === 1 ? 'item selecionado' : 'itens selecionados'}`}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onClearSelection} disabled={isDeleting || isSelectingAll}>
          Limpar seleção
        </Button>
        {canDeletarResponsavel && (
          <Button variant="destructive" size="sm" onClick={onDeleteSelected} disabled={isDeleting || isSelectingAll}>
            <TrashIcon className="h-4 w-4 mr-2" />
            {isDeleting ? 'Excluindo...' : 'Excluir selecionados'}
          </Button>
        )}
      </div>
    </div>
  );
}
