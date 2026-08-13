import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import tiposClient from '@/api/tipos/client';
import { CategoriaEnum, TipoResponse } from '@/api/tipos/types';

interface FiltersState {
  nome: string;
  descricao: string;
  criticidade: string;
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
  const [criticidades, setCriticidades] = useState<TipoResponse[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(false);

  useEffect(() => {
    if (!showFilterModal) return;

    let cancelado = false;

    const carregarCriticidades = async () => {
      setLoadingTipos(true);
      try {
        const tipos = await tiposClient.buscarPorCategorias([CategoriaEnum.OBRIG_CRITICIDADE]);
        if (!cancelado) {
          setCriticidades(tipos.filter((tipo) => tipo.nmCategoria === CategoriaEnum.OBRIG_CRITICIDADE));
        }
      } catch (error) {
        console.error('Erro ao carregar criticidades:', error);
      } finally {
        if (!cancelado) {
          setLoadingTipos(false);
        }
      }
    };

    carregarCriticidades();

    return () => {
      cancelado = true;
    };
  }, [showFilterModal]);

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
          <div>
            <Label htmlFor="criticidade">Criticidade</Label>
            <Select
              value={filters.criticidade || undefined}
              onValueChange={(value) => setFilters({ ...filters, criticidade: value === 'all' ? '' : value })}
              disabled={loadingTipos}
            >
              <SelectTrigger id="criticidade">
                <SelectValue placeholder={loadingTipos ? 'Carregando...' : 'Todas'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {criticidades.map((tipo) => (
                  <SelectItem key={tipo.idTipo} value={tipo.idTipo.toString()}>
                    {tipo.dsTipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
