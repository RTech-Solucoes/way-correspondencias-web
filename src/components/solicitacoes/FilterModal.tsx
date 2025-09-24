'use client';

import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusSolicitacaoResponse } from '@/api/status-solicitacao/client';
import { Button } from '@/components/ui/button';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { TemaResponse } from '@/api/temas/types';
import { AreaResponse } from '@/api/areas/types';

interface FilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    identificacao: string;
    status: string;
    responsavel: string;
    tema: string;
    area: string;
    dateFrom: string;
    dateTo: string;
    nomeResponsavel: string;
    dtCriacaoInicio: string;
    dtCriacaoFim: string;
  };
  setFilters: (filters: any) => void;
  responsaveis: ResponsavelResponse[];
  temas: TemaResponse[];
  areas: AreaResponse[];
  statuses: StatusSolicitacaoResponse[];
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export default function FilterModal({
  open,
  onOpenChange,
  filters,
  setFilters,
  responsaveis,
  temas,
  areas,
  statuses,
  onApplyFilters,
  onClearFilters
}: FilterModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Filtrar Solicitações</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="identificacao">Código de Identificação</Label>
              <Input
                id="identificacao"
                value={filters.identificacao}
                onChange={(e) => setFilters({ ...filters, identificacao: e.target.value })}
                placeholder="Código de identificação"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status.idStatusSolicitacao} value={status.idStatusSolicitacao.toString()}>
                      {status.nmStatus}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tema">Tema</Label>
              <Select
                value={filters.tema}
                onValueChange={(value) => setFilters({ ...filters, tema: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {temas.map((tema: TemaResponse) => (
                    <SelectItem
                      key={tema.idTema}
                      value={tema.idTema.toString()}
                    >
                      {tema.nmTema}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="area">Área</Label>
              <Select
                value={filters.area}
                onValueChange={(value) => setFilters({ ...filters, area: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {areas.map((area: AreaResponse) => (
                    <SelectItem
                      key={area.idArea}
                      value={area.idArea.toString()}
                    >
                      {area.nmArea}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dtCriacaoInicio">Data Criação Início</Label>
              <Input
                id="dtCriacaoInicio"
                type="date"
                value={filters.dtCriacaoInicio}
                onChange={(e) => setFilters({ ...filters, dtCriacaoInicio: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="dtCriacaoFim">Data Criação Fim</Label>
              <Input
                id="dtCriacaoFim"
                type="date"
                value={filters.dtCriacaoFim}
                onChange={(e) => setFilters({ ...filters, dtCriacaoFim: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nomeResponsavel">Nome do Responsável</Label>
                <Input
                  id="nomeResponsavel"
                  value={filters.nomeResponsavel}
                  onChange={(e) => setFilters({ ...filters, nomeResponsavel: e.target.value })}
                  placeholder="Nome do responsável"
                />
                <div>  
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClearFilters}>
            Limpar Filtros
          </Button>
          <Button onClick={onApplyFilters}>
            Aplicar Filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
