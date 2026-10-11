'use client';

import { getLayoutClient, ClienteEnum } from '@/lib/layout/layout-client';
import { Button } from '@/components/ui/button';
import { SpinnerIcon, TrashIcon } from '@phosphor-icons/react';
import { cn } from '@/utils/utils';

interface TemasSelectionBarProps {
  selectedCount: number;
  allFilteredSelected: boolean;
  canDeletarTema: boolean;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  isDeleting?: boolean;
  isSelectingAll?: boolean;
  totalElements?: number;
  className?: string;
}

export function TemasSelectionBar({
  selectedCount,
  allFilteredSelected,
  canDeletarTema,
  onClearSelection,
  onDeleteSelected,
  isDeleting = false,
  isSelectingAll = false,
  totalElements,
  className,
}: TemasSelectionBarProps) {
  if (getLayoutClient() !== ClienteEnum.RTECH || (selectedCount === 0 && !isSelectingAll)) return null;

  return (
    <div
      className={cn(
        'bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex flex-wrap gap-3 items-center justify-between',
        className
      )}
    >
      <span className="text-sm font-medium text-blue-900 flex items-center gap-2">
        {isSelectingAll && <SpinnerIcon className="h-4 w-4 animate-spin" />}
        {isSelectingAll
          ? `Selecionando todos os resultados... ${selectedCount}${totalElements ? ` de ${totalElements}` : ''}`
          : allFilteredSelected
            ? `Todos os ${totalElements ?? selectedCount} resultados estão selecionados`
            : `${selectedCount} ${selectedCount === 1 ? 'item selecionado' : 'itens selecionados'} em uma ou mais páginas`}
      </span>
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={onClearSelection}
          disabled={isDeleting || isSelectingAll || selectedCount === 0}
          title="Desmarcar todos os itens selecionados, inclusive em outras páginas"
        >
          Desmarcar todos
        </Button>
        {canDeletarTema && (
          <Button variant="destructive" size="sm" onClick={onDeleteSelected} disabled={selectedCount === 0 || isDeleting || isSelectingAll}>
            <TrashIcon className="h-4 w-4 mr-2" />
            {isDeleting ? 'Excluindo...' : 'Excluir selecionados'}
          </Button>
        )}
      </div>
    </div>
  );
}
