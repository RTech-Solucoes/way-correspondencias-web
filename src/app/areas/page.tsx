'use client';

import React from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
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
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import AreaModal from '../../components/areas/AreaModal';
import {ConfirmationDialog} from '@/components/ui/confirmation-dialog';
import PageTitle from '@/components/ui/page-title';
import { Pagination } from '@/components/ui/pagination';
import {getStatusText} from "@/utils/utils";
import useAreas from '@/context/areas/AreasContext';

export default function AreasPage() {
  const {
    areas,
    loading,
    searchQuery,
    setSearchQuery,
    selectedArea,
    setSelectedArea,
    showAreaModal,
    setShowAreaModal,
    showFilterModal,
    setShowFilterModal,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    filters,
    setFilters,
    showDeleteDialog,
    setShowDeleteDialog,
    hasActiveFilters,
    handleSort,
    handleEdit,
    handleDelete,
    confirmDelete,
    handleAreaSave,
    applyFilters,
    clearFilters
  } = useAreas();

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <PageTitle />
          <Button onClick={() => {
            setSelectedArea(null);
            setShowAreaModal(true);
          }} className="bg-primary hover:bg-blue-700">
            <PlusIcon className="h-4 w-4 mr-2" />
            Nova Área
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar áreas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              className="h-10 px-4"
              onClick={clearFilters}
            >
              <XIcon className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          )}
          <Button
            variant="secondary"
            className="h-10 px-4"
            onClick={() => setShowFilterModal(true)}
          >
            <FunnelSimpleIcon className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-auto bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('cdArea')}>
                <div className="flex items-center">
                  Código
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('nmArea')}>
                <div className="flex items-center">
                  Nome
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('flAtivo')}>
                <div className="flex items-center">
                  Status
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-1 items-center justify-center py-8">
                    <SpinnerIcon className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Buscando áreas...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : areas?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <BuildingIcon className="h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-500">Nenhuma área encontrada</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              areas.map((area) => (
                <TableRow key={area.idArea}>
                  <TableCell className="font-medium">{area.cdArea}</TableCell>
                  <TableCell>{area.nmArea}</TableCell>
                  <TableCell>{area.dsArea}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      area.flAtivo === 'S' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusText(area.flAtivo)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(area)}
                      >
                        <PencilSimpleIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(area.idArea)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={50}
        onPageChange={setCurrentPage}
        loading={loading}
      />

      {showFilterModal && (
        <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filtrar Áreas</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={filters.codigo}
                  onChange={(e) => setFilters({...filters, codigo: e.target.value})}
                  placeholder="Filtrar por código"
                />
              </div>
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