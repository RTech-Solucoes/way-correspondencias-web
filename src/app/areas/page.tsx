'use client';

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowsDownUpIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
  BuildingIcon, SpinnerIcon,
} from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AreaResponse, AreaRequest } from '@/api/areas/types';
import { areasClient } from '@/api/areas/client';
import AreaModal from '../../components/areas/AreaModal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import PageTitle from '@/components/ui/page-title';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';
import { Pagination } from '@/components/ui/pagination';
import { getStatusText } from "@/utils/utils";
import HeaderArea from '@/components/areas/HeaderArea';
import SearchArea from '@/components/areas/SearchArea';
import TableArea from '@/components/areas/TableArea';
import FilterModalArea from '@/components/areas/FilterModalArea';

export default function AreasPage() {
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<AreaResponse | null>(null);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortField, setSortField] = useState<keyof AreaResponse | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    ativo: ''
  });
  const [activeFilters, setActiveFilters] = useState(filters);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<number | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    loadAreas();
  }, [currentPage, activeFilters, debouncedSearchQuery]);

  const loadAreas = async () => {
    try {
      setLoading(true);

      const filterParts = [];
      if (debouncedSearchQuery) filterParts.push(debouncedSearchQuery);
      if (activeFilters.codigo) filterParts.push(activeFilters.codigo);
      if (activeFilters.nome) filterParts.push(activeFilters.nome);
      if (activeFilters.descricao) filterParts.push(activeFilters.descricao);

      const filtro = filterParts.join(' ');

      const response = await areasClient.buscarPorFiltro({
        filtro: filtro || undefined,
        page: currentPage,
        size: 50,
        sort: sortField ? `${sortField},${sortDirection}` : undefined
      });

      setAreas(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      toast.error("Erro ao carregar áreas");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof AreaResponse) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(0);
  };

  const handleEdit = (area: AreaResponse) => {
    setSelectedArea(area);
    setShowAreaModal(true);
  };

  const handleDelete = async (areaId: number) => {
    setAreaToDelete(areaId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (areaToDelete) {
      try {
        await areasClient.deletar(areaToDelete);
        toast.success("Área excluída com sucesso");
        loadAreas();
      } catch (error) {
        toast.error("Erro ao excluir área");
      } finally {
        setShowDeleteDialog(false);
        setAreaToDelete(null);
      }
    }
  };

  const handleAreaSave = async (area: AreaRequest) => {
    try {
      if (selectedArea) {
        await areasClient.atualizar(selectedArea.idArea, area);
        toast.success("Área atualizada com sucesso");
      } else {
        await areasClient.criar(area);
        toast.success("Área criada com sucesso");
      }
      setShowAreaModal(false);
      setSelectedArea(null);
      loadAreas();
    } catch (error) {
      toast.error("Erro ao salvar área");
    }
  };

  const handleAreaSaved = () => {
    setShowAreaModal(false);
    setSelectedArea(null);
    loadAreas();
  };

  const applyFilters = () => {
    setActiveFilters(filters);
    setCurrentPage(0);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      codigo: '',
      nome: '',
      descricao: '',
      ativo: ''
    };
    setFilters(clearedFilters);
    setActiveFilters(clearedFilters);
    setCurrentPage(0);
    setShowFilterModal(false);
  };

  const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="bg-white border-b border-gray-200 p-6">
        <HeaderArea setSelectedArea={setSelectedArea} setShowAreaModal={setShowAreaModal} />

        <SearchArea
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setShowFilterModal={setShowFilterModal}
        />
      </div>

      <TableArea
        areas={areas}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        handleSort={handleSort}
        loading={loading}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={50}
        onPageChange={setCurrentPage}
        loading={loading}
      />

      {showFilterModal && (
        <FilterModalArea
          applyFilters={applyFilters}
          showFilterModal={showFilterModal}
          filters={filters}
          setFilters={setFilters}
          clearFilters={clearFilters}
          setShowFilterModal={setShowFilterModal}
        />
      )}

      {showAreaModal && (
        <AreaModal
          area={selectedArea}
          open={showAreaModal}
          onClose={() => {
            setShowAreaModal(false);
            setSelectedArea(null);
          }}
          onSave={handleAreaSave}
        />
      )}

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        title="Excluir Área"
        description="Tem certeza que deseja excluir esta área? Esta ação não pode ser desfeita."
      />
    </div>
  );
}