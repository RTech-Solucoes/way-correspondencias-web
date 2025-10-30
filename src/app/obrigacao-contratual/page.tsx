'use client';

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { 
  ArrowClockwiseIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelSimpleIcon,
  XIcon,
  PencilSimpleIcon,
  TrashIcon,
  EyeIcon
} from "@phosphor-icons/react";
import { ObrigacoesProvider, useObrigacoes } from "@/context/obrigacoes/ObrigacoesContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarCheckIcon } from "lucide-react";
import { ObrigacaoModal } from "@/components/obrigacoes/ObrigacaoModal";
import { FilterModalObrigacao } from "@/components/obrigacoes/FilterModalObrigacao";
import { DeleteObrigacaoDialog } from "@/components/obrigacoes/DeleteObrigacaoDialog";
import { ObrigacaoContratualResponse } from "@/api/obrigacao-contratual/types";

function ObrigacoesContent() {
  const {
    obrigacoes,
    loading,
    searchQuery,
    setSearchQuery,
    currentPage,
    totalPages,
    totalElements,
    setCurrentPage,
    setShowObrigacaoModal,
    setShowFilterModal,
    setSelectedObrigacao,
    setShowDeleteDialog,
    setObrigacaoToDelete,
  } = useObrigacoes();

  const hasActiveFilters = false; 

  const handleEditObrigacao = (obrigacao: ObrigacaoContratualResponse | null) => {
   // if (obrigacao) {
      setSelectedObrigacao(obrigacao);
      setShowObrigacaoModal(true);
     //}
  };

  const handleDeleteObrigacao = (obrigacao: ObrigacaoContratualResponse) => {
    setObrigacaoToDelete(obrigacao);
    setShowDeleteDialog(true);
  };

  return (
    <>
      <ObrigacaoModal />
      <FilterModalObrigacao />
      <DeleteObrigacaoDialog />
      
      <div className="flex flex-col min-h-0 flex-1">
        <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Obrigações Contratuais</h1>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {}}
          >
            <ArrowClockwiseIcon className="h-4 w-4 mr-1" />
          </Button>

          <span className="text-sm text-gray-500">
            {totalElements} {totalElements !== 1 ? "obrigações" : "obrigação"}
          </span>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={setCurrentPage}
            loading={loading}
            showOnlyPaginationButtons={true}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar obrigações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              className="h-10 px-4"
              onClick={() => {}}
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

          <Button
            className="h-10 px-4"
            onClick={() => setShowObrigacaoModal(true)}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Criar Obrigação
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Tarefa</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Contrato</TableHead>
              <TableHead>Atribuído a</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : obrigacoes.length === 0 ? (
              <TableRow>
                <TableCell>22222</TableCell>
                  <TableCell>2222</TableCell>
                  <TableCell>2222</TableCell>
                  <TableCell>2222</TableCell>
                  <TableCell>2222</TableCell>
                  <TableCell>2222</TableCell>
                  <TableCell>
                  <div className="flex items-center justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        title="Ver detalhes"
                      >
                        <CalendarCheckIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        title="Editar"
                        onClick={() => handleEditObrigacao(null)}
                      >
                        <PencilSimpleIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        title="Excluir"
                        onClick={() => handleDeleteObrigacao({} as ObrigacaoContratualResponse)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
              </TableRow>
            ) : (
              obrigacoes.map((obrigacao) => (
                <TableRow key={obrigacao.idObrigacaoContratual}>
                  <TableCell>{obrigacao.idObrigacaoContratual}</TableCell>
                  <TableCell>{obrigacao.dsTarefa}</TableCell>
                  <TableCell>{obrigacao.dsTarefa}</TableCell>
                  <TableCell>{obrigacao.cdIdentificador}</TableCell>
                  <TableCell>{obrigacao.tpClassificacao}</TableCell>
                  <TableCell>{obrigacao.tpPeriodicidade}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        title="Ver detalhes"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        title="Editar"
                        onClick={() => handleEditObrigacao(obrigacao)}
                      >
                        <PencilSimpleIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        title="Excluir"
                        onClick={() => handleDeleteObrigacao(obrigacao)}
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
    </div>
    </>
  );
}

export default function ObrigacoesPage() {
  return (
    <ObrigacoesProvider>
      <ObrigacoesContent />
    </ObrigacoesProvider>
  );
}
