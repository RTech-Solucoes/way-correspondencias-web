import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dispatch, SetStateAction } from 'react';

interface FiltersState {
  usuario: string;
  email: string;
}

interface ResponsaveisFilterDialogProps {
  showFilterModal: boolean;
  setShowFilterModal: Dispatch<SetStateAction<boolean>>;
  filters: FiltersState;
  setFilters: Dispatch<SetStateAction<FiltersState>>;
  applyFilters: () => void;
  clearFilters: () => void;
}

export default function ResponsaveisFilterDialog({
  showFilterModal,
  setShowFilterModal,
  filters,
  setFilters,
  applyFilters,
  clearFilters,
}: ResponsaveisFilterDialogProps) {
  return (
    <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filtrar Responsáveis</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="usuario">Usuário</Label>
            <Input
              id="usuario"
              value={filters.usuario}
              onChange={(e) => setFilters({...filters, usuario: e.target.value})}
              placeholder="Filtrar por usuário"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={filters.email}
              onChange={(e) => setFilters({...filters, email: e.target.value})}
              placeholder="Filtrar por email"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={clearFilters}>
            Limpar Filtros
          </Button>
          <Button onClick={applyFilters}>
            Aplicar Filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
