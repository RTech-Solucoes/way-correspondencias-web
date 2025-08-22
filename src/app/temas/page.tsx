'use client';

import React, { useEffect } from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
  TagIcon, SpinnerIcon,
} from '@phosphor-icons/react';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import {TemaModal} from '@/components/temas/TemaModal';
import {ConfirmationDialog} from '@/components/ui/confirmation-dialog';
import PageTitle from '@/components/ui/page-title';
import { Pagination } from '@/components/ui/pagination';
import {getStatusText} from "@/utils/utils";
import useTemas from '@/context/temas/TemasContext';

export default function TemasPage() {
  const {
    temas,
    loading,
    searchQuery,
    setSearchQuery,
    selectedTema,
    setSelectedTema,
    showTemaModal,
    setShowTemaModal,
    showFilterModal,
    setShowFilterModal,
    showDeleteDialog,
    setShowDeleteDialog,
    temaToDelete,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    filters,
    setFilters,
    hasActiveFilters,
    handleEdit,
    handleDelete,
    confirmDelete,
    handleTemaSave,
    applyFilters,
    clearFilters,
    loadTemas
  } = useTemas();

  // Load data when page mounts
  useEffect(() => {
    loadTemas();
  }, []);

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <PageTitle />
          <Button onClick={() => {
            setSelectedTema(null);
            setShowTemaModal(true);
          }}>
            <PlusIcon className="h-4 w-4 mr-2"/>
            Novo Tema
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
            <Input
              placeholder="Pesquisar temas..."
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
              <XIcon className="h-4 w-4 mr-2"/>
              Limpar Filtros
            </Button>
          )}
          <Button
            variant="secondary"
            className="h-10 px-4"
            onClick={() => setShowFilterModal(true)}
          >
            <FunnelSimpleIcon className="h-4 w-4 mr-2"/>
            Filtrar
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-auto bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Tipo Prazo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Áreas</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-1 items-center justify-center py-8">
                    <SpinnerIcon className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Buscando temas...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : temas?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <TagIcon className="h-8 w-8 text-gray-400"/>
                    <p className="text-sm text-gray-500">Nenhum tema encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              temas.map((tema) => (
                <TableRow key={tema.idTema}>
                  <TableCell className="font-medium">{tema.nmTema}</TableCell>
                  <TableCell className="max-w-xs truncate" title={tema.dsTema}>
                    {tema.dsTema || '-'}
                  </TableCell>
                  <TableCell>
                    {tema.nrPrazo ? `${tema.nrPrazo}` : '-'}
                  </TableCell>
                  <TableCell>
                    {tema.tpPrazo === 'C' ? 'Dias Corridos' :
                     tema.tpPrazo === 'U' ? 'Dias Úteis' :
                     tema.tpPrazo || '-'}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      tema.flAtivo === 'S' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusText(tema.flAtivo)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {tema.areas && tema.areas?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {tema.areas.slice(0, 2).map((area, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {area.nmArea}
                          </span>
                        ))}
                        {tema.areas?.length > 2 && (
                          <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            +{tema.areas?.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Nenhuma área</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(tema)}
                      >
                        <PencilSimpleIcon className="h-4 w-4"/>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(tema)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4"/>
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
        pageSize={15}
        onPageChange={setCurrentPage}
        loading={loading}
      />

      {showFilterModal && (
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
      )}

      {showTemaModal && (
        <TemaModal
          tema={selectedTema}
          open={showTemaModal}
          onClose={() => {
            setShowTemaModal(false);
            setSelectedTema(null);
          }}
          onSave={handleTemaSave}
        />
      )}

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        title="Excluir Tema"
        description={`Tem certeza que deseja excluir o tema "${temaToDelete?.nmTema}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}