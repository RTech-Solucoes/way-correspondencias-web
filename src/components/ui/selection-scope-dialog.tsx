'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SelectionScopeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageSelected: boolean;
  allFilteredSelected: boolean;
  selectedCount: number;
  pageItemCount: number;
  totalElements: number;
  isSelectingAll?: boolean;
  onSelectPage: () => void;
  onSelectAll: () => void | Promise<void>;
  onClearAll: () => void;
}

export function SelectionScopeDialog({
  open,
  onOpenChange,
  pageSelected,
  allFilteredSelected,
  selectedCount,
  pageItemCount,
  totalElements,
  isSelectingAll = false,
  onSelectPage,
  onSelectAll,
  onClearAll,
}: SelectionScopeDialogProps) {
  const closeAfter = async (action: () => void | Promise<void>) => {
    await action();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {allFilteredSelected ? 'Desmarcar seleção' : 'Escolher escopo da seleção'}
          </DialogTitle>
          <DialogDescription>
            {allFilteredSelected
              ? `Todos os ${totalElements} resultados filtrados estão selecionados.`
              : 'Escolha se deseja selecionar somente a página atual ou todos os resultados do filtro.'}
          </DialogDescription>
        </DialogHeader>

        {!allFilteredSelected && (
          <div className="grid gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-auto justify-start px-4 py-3 text-left"
              disabled={isSelectingAll || pageItemCount === 0}
              onClick={() => closeAfter(onSelectPage)}
            >
              <span className="flex flex-col items-start gap-1">
                <span className="font-semibold">
                  {pageSelected ? 'Desmarcar página atual' : 'Selecionar página atual'}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {pageSelected
                    ? `Remover a seleção dos ${pageItemCount} itens desta página.`
                    : `Marcar somente os ${pageItemCount} itens desta página.`}
                </span>
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-auto justify-start px-4 py-3 text-left"
              disabled={isSelectingAll || totalElements === 0}
              onClick={() => closeAfter(onSelectAll)}
            >
              <span className="flex flex-col items-start gap-1">
                <span className="font-semibold">Selecionar todos os resultados</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Marcar os {totalElements} itens encontrados pelo filtro, incluindo outras páginas.
                </span>
              </span>
            </Button>
          </div>
        )}

        <DialogFooter className="border-t pt-4">
          <Button
            type="button"
            variant="ghost"
            disabled={isSelectingAll}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          {selectedCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground"
              disabled={isSelectingAll}
              onClick={() => closeAfter(onClearAll)}
            >
              Desmarcar todos os {selectedCount} selecionados
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
