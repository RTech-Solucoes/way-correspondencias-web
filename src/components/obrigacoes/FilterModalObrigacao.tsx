'use client';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useObrigacoes } from '@/context/obrigacoes/ObrigacoesContext';
import { useState, useEffect } from 'react';
import { statusObrigacaoList, statusObrigacaoLabels, StatusObrigacao } from '@/api/status-obrigacao/types';
import areasClient from '@/api/areas/client';
import temasClient from '@/api/temas/client';
import tiposClient from '@/api/tipos/client';
import { AreaResponse } from '@/api/areas/types';
import { TemaResponse } from '@/api/temas/types';
import { TipoResponse, CategoriaEnum } from '@/api/tipos/types';

interface FilterState {
  idStatusObrigacao: string;
  idAreaAtribuida: string;
  dtLimiteInicio: string;
  dtLimiteFim: string;
  dtInicioInicio: string;
  dtInicioFim: string;
  idTema: string;
  idTipoClassificacao: string;
  idTipoPeriodicidade: string;
}

export function FilterModalObrigacao() {
  const { showFilterModal, setShowFilterModal, filters, setFilters } = useObrigacoes();
  
  const [localFilters, setLocalFilters] = useState<FilterState>({
    idStatusObrigacao: '',
    idAreaAtribuida: '',
    dtLimiteInicio: '',
    dtLimiteFim: '',
    dtInicioInicio: '',
    dtInicioFim: '',
    idTema: '',
    idTipoClassificacao: '',
    idTipoPeriodicidade: '',
  });

  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [temas, setTemas] = useState<TemaResponse[]>([]);
  const [classificacoes, setClassificacoes] = useState<TipoResponse[]>([]);
  const [periodicidades, setPeriodicidades] = useState<TipoResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showFilterModal) {
      setLocalFilters({
        idStatusObrigacao: filters.idStatusObrigacao || '',
        idAreaAtribuida: filters.idAreaAtribuida || '',
        dtLimiteInicio: filters.dtLimiteInicio || '',
        dtLimiteFim: filters.dtLimiteFim || '',
        dtInicioInicio: filters.dtInicioInicio || '',
        dtInicioFim: filters.dtInicioFim || '',
        idTema: filters.idTema || '',
        idTipoClassificacao: filters.idTipoClassificacao || '',
        idTipoPeriodicidade: filters.idTipoPeriodicidade || '',
      });
    }
  }, [showFilterModal, filters]);

  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      try {
        const [areasResponse, temasResponse, tiposResponse] = await Promise.all([
          areasClient.buscarPorFiltro({ size: 1000 }),
          temasClient.buscarPorFiltro({ size: 1000 }),
          tiposClient.buscarPorCategorias([CategoriaEnum.OBRIG_CLASSIFICACAO, CategoriaEnum.OBRIG_PERIODICIDADE])
        ]);

        setAreas(areasResponse.content || []);
        setTemas(temasResponse.content || []);
        
        const classif = tiposResponse.filter(t => t.nmCategoria === CategoriaEnum.OBRIG_CLASSIFICACAO);
        const periodic = tiposResponse.filter(t => t.nmCategoria === CategoriaEnum.OBRIG_PERIODICIDADE);
        
        setClassificacoes(classif);
        setPeriodicidades(periodic);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    if (showFilterModal) {
      carregarDados();
    }
  }, [showFilterModal]);

  const handleClose = () => {
    setShowFilterModal(false);
  };

  const handleApplyFilters = () => {
    setFilters({
      ...filters,
      ...localFilters
    });
    handleClose();
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterState = {
      idStatusObrigacao: '',
      idAreaAtribuida: '',
      dtLimiteInicio: '',
      dtLimiteFim: '',
      dtInicioInicio: '',
      dtInicioFim: '',
      idTema: '',
      idTipoClassificacao: '',
      idTipoPeriodicidade: '',
    };
    setLocalFilters(clearedFilters);
    setFilters({
      ...filters,
      ...clearedFilters
    });
  };

  return (
    <Dialog open={showFilterModal} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filtrar Obrigações</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="idStatusObrigacao">Status</Label>
            <Select
              value={localFilters.idStatusObrigacao || 'all'}
              onValueChange={(value) => setLocalFilters({ ...localFilters, idStatusObrigacao: value === 'all' ? '' : value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {statusObrigacaoList.map((status) => (
                  <SelectItem key={status.id} value={status.id.toString()}>
                    {statusObrigacaoLabels[status.nmStatus as StatusObrigacao]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idAreaAtribuida">Área Atribuída</Label>
            <Select
              value={localFilters.idAreaAtribuida || 'all'}
              onValueChange={(value) => setLocalFilters({ ...localFilters, idAreaAtribuida: value === 'all' ? '' : value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {areas.filter(area => area.flAtivo === 'S').map((area) => (
                  <SelectItem key={area.idArea} value={area.idArea.toString()}>
                    {area.nmArea}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data Limite (Range)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dtLimiteInicio" className="text-sm text-gray-600">Data Início</Label>
                <Input
                  id="dtLimiteInicio"
                  type="date"
                  value={localFilters.dtLimiteInicio}
                  onChange={(e) => setLocalFilters({ ...localFilters, dtLimiteInicio: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="dtLimiteFim" className="text-sm text-gray-600">Data Fim</Label>
                <Input
                  id="dtLimiteFim"
                  type="date"
                  value={localFilters.dtLimiteFim}
                  onChange={(e) => setLocalFilters({ ...localFilters, dtLimiteFim: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Data de Início (Range)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dtInicioInicio" className="text-sm text-gray-600">Data Início</Label>
                <Input
                  id="dtInicioInicio"
                  type="date"
                  value={localFilters.dtInicioInicio}
                  onChange={(e) => setLocalFilters({ ...localFilters, dtInicioInicio: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="dtInicioFim" className="text-sm text-gray-600">Data Fim</Label>
                <Input
                  id="dtInicioFim"
                  type="date"
                  value={localFilters.dtInicioFim}
                  onChange={(e) => setLocalFilters({ ...localFilters, dtInicioFim: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idTema">Tema</Label>
            <Select
              value={localFilters.idTema || 'all'}
              onValueChange={(value) => setLocalFilters({ ...localFilters, idTema: value === 'all' ? '' : value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {temas.map((tema) => (
                  <SelectItem key={tema.idTema} value={tema.idTema.toString()}>
                    {tema.nmTema}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idTipoClassificacao">Classificação</Label>
            <Select
              value={localFilters.idTipoClassificacao || 'all'}
              onValueChange={(value) => setLocalFilters({ ...localFilters, idTipoClassificacao: value === 'all' ? '' : value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a classificação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {classificacoes.map((tipo) => (
                  <SelectItem key={tipo.idTipo} value={tipo.idTipo.toString()}>
                    {tipo.dsTipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idTipoPeriodicidade">Periodicidade</Label>
            <Select
              value={localFilters.idTipoPeriodicidade || 'all'}
              onValueChange={(value) => setLocalFilters({ ...localFilters, idTipoPeriodicidade: value === 'all' ? '' : value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a periodicidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {periodicidades.map((tipo) => (
                  <SelectItem key={tipo.idTipo} value={tipo.idTipo.toString()}>
                    {tipo.dsTipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
