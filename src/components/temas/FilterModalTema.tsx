import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FiltersState {
  nome: string;
  descricao: string;
}

interface FilterModalTemaProps {
  applyFilters: () => void;
  showFilterModal: boolean;
  filters: FiltersState;
  setFilters: (filters: FiltersState) => void;
  clearFilters: () => void;
  setShowFilterModal: (show: boolean) => void;
}

export default function FilterModalTema({
  applyFilters,
  showFilterModal,
  filters,
  setFilters,
  clearFilters,
  setShowFilterModal,
}: FilterModalTemaProps) {
  return (
    <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filtrar Temas</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={filters.nome}
              onChange={(e) => setFilters({...filters, nome: e.target.value})}
              placeholder="Filtrar por nome"
            />
          </div>
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={filters.descricao}
              onChange={(e) => setFilters({...filters, descricao: e.target.value})}
              placeholder="Filtrar por descrição"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={clearFilters}>
            Limpar
          </Button>
          <Button onClick={applyFilters}>
            Aplicar Filtros
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
