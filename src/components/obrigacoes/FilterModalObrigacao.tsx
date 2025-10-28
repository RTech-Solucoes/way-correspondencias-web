'use client';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useObrigacoes } from '@/context/obrigacoes/ObrigacoesContext';

export function FilterModalObrigacao() {
  const { showFilterModal, setShowFilterModal } = useObrigacoes();

  const handleClose = () => {
    setShowFilterModal(false);
  };

  const handleApplyFilters = () => {

      handleClose();
  };

  const handleClearFilters = () => {

  };

  return (
    <Dialog open={showFilterModal} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Filtrar Obrigações</DialogTitle>
        </DialogHeader>

        <div className="py-8">


        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClearFilters}>
            Limpar Filtros
          </Button>
          <Button onClick={handleApplyFilters}>
            Aplicar Filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

