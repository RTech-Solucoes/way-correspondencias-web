'use client';

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { FiltrosAplicados } from "@/components/ui/applied-filters";

// Context
import { ObrigacoesUIProvider } from "@/components/obrigacoes/context/ObrigacoesUIContext";

// Modular Components
import { ObrigacoesTable } from "@/components/obrigacoes/list-page/ObrigacoesTable";
import { ObrigacoesHeader } from "@/components/obrigacoes/list-page/ObrigacoesHeader";
import { ObrigacoesFiltersUI } from "@/components/obrigacoes/list-page/ObrigacoesFiltersUI";
import { ObrigacoesModals } from "@/components/obrigacoes/list-page/ObrigacoesModals";

// Hooks
import { useObrigacoes } from "@/components/obrigacoes/hooks/use-obrigacoes";
import { useObrigacoesFilters } from "./hooks/useObrigacoesFilters";

export function ObrigacoesContent() {
  const searchParams = useSearchParams();
  
  const idObrigacaoFromUrl = useMemo(() => {
    const param = searchParams.get('idObrigacao');
    return param ? Number(param) : undefined;
  }, [searchParams]);

  const {
    // Dados
    obrigacoes,
    totalPages,
    totalElements,
    loading,
    
    // UI State
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    
    // Filtros
    filters,
    setFilters,
    
    // Modais principais
    showObrigacaoModal,
    setShowObrigacaoModal,
    showFilterModal,
    setShowFilterModal,
    showDeleteDialog,
    setShowDeleteDialog,
    obrigacaoToDelete,
    setObrigacaoToDelete,
    
    // Modais específicos
    showImportModal,
    setShowImportModal,
    showAnexarProtocoloModal,
    setShowAnexarProtocoloModal,
    obrigacaoParaProtocolo,
    setObrigacaoParaProtocolo,
    showObrigacoesCondicionadasModal,
    setShowObrigacoesCondicionadasModal,
    obrigacoesCondicionadas,
    setObrigacoesCondicionadas,
    showNaoAplicavelSuspensoModal,
    setShowNaoAplicavelSuspensoModal,
    obrigacaoParaNaoAplicavelSuspenso,
    setObrigacaoParaNaoAplicavelSuspenso,
    showTramitacaoModal,
    setShowTramitacaoModal,
    obrigacaoParaTramitacao,
    setObrigacaoParaTramitacao,
    showConfirmTramitacao,
    setShowConfirmTramitacao,
    obrigacaoParaConfirmarTramitacao,
    setObrigacaoParaConfirmarTramitacao,
    
    // Permissões
    canInserirObrigacao,
    canDeletarObrigacao,
    canConcluirObrigacao,
    canEnviarAreasObrigacao,
    canNaoAplicavelSuspensaObrigacao,
    
    // Handlers
    loadObrigacoes,
    handleSort,
    handleVisualize,
    handleEdit,
    handleDelete,
    handleNaoAplicavelSuspenso,
    handleConfirmNaoAplicavelSuspenso,
    handleEnviarArea,
    handleAnexarProtocolo,
    handleEncaminharTramitacao,
    
    // Helpers
    isAdminOrGestor,
    getStatusText,
    idPerfil,
  } = useObrigacoes({ idObrigacaoFromUrl });

  const {
    hasActiveFilters,
    filtrosAplicados,
    handleClearAllFilters,
    filterParamsForExport,
  } = useObrigacoesFilters({
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
  });

  // Context value para modais
  const uiContextValue = useMemo(() => ({
    showObrigacaoModal,
    setShowObrigacaoModal,
    showFilterModal,
    setShowFilterModal,
    showDeleteDialog,
    setShowDeleteDialog,
    obrigacaoToDelete,
    setObrigacaoToDelete,
    filters,
    setFilters,
    loadObrigacoes,
  }), [
    showObrigacaoModal,
    setShowObrigacaoModal,
    showFilterModal,
    setShowFilterModal,
    showDeleteDialog,
    setShowDeleteDialog,
    obrigacaoToDelete,
    setObrigacaoToDelete,
    filters,
    setFilters,
    loadObrigacoes,
  ]);

  return (
    <ObrigacoesUIProvider value={uiContextValue}>
      <div className="flex flex-col min-h-0 flex-1">
        <ObrigacoesModals 
        showImportModal={showImportModal}
        setShowImportModal={setShowImportModal}
        obrigacaoParaProtocolo={obrigacaoParaProtocolo}
        showAnexarProtocoloModal={showAnexarProtocoloModal}
        setShowAnexarProtocoloModal={setShowAnexarProtocoloModal}
        setObrigacaoParaProtocolo={setObrigacaoParaProtocolo}
        idPerfil={idPerfil}
        loadObrigacoes={loadObrigacoes}
        showObrigacoesCondicionadasModal={showObrigacoesCondicionadasModal}
        setShowObrigacoesCondicionadasModal={setShowObrigacoesCondicionadasModal}
        obrigacoesCondicionadas={obrigacoesCondicionadas}
        setObrigacoesCondicionadas={setObrigacoesCondicionadas}
        obrigacaoParaNaoAplicavelSuspenso={obrigacaoParaNaoAplicavelSuspenso}
        showNaoAplicavelSuspensoModal={showNaoAplicavelSuspensoModal}
        setShowNaoAplicavelSuspensoModal={setShowNaoAplicavelSuspensoModal}
        setObrigacaoParaNaoAplicavelSuspenso={setObrigacaoParaNaoAplicavelSuspenso}
        handleConfirmNaoAplicavelSuspenso={handleConfirmNaoAplicavelSuspenso}
        showTramitacaoModal={showTramitacaoModal}
        setShowTramitacaoModal={setShowTramitacaoModal}
        obrigacaoParaTramitacao={obrigacaoParaTramitacao}
        setObrigacaoParaTramitacao={setObrigacaoParaTramitacao}
        showConfirmTramitacao={showConfirmTramitacao}
        setShowConfirmTramitacao={setShowConfirmTramitacao}
        obrigacaoParaConfirmarTramitacao={obrigacaoParaConfirmarTramitacao}
        setObrigacaoParaConfirmarTramitacao={setObrigacaoParaConfirmarTramitacao}
      />

      <ObrigacoesHeader 
        totalElements={totalElements}
        loadObrigacoes={loadObrigacoes}
        loading={loading && obrigacoes.length === 0}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

      <ObrigacoesFiltersUI 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        hasActiveFilters={hasActiveFilters}
        handleClearAllFilters={handleClearAllFilters}
        setShowFilterModal={setShowFilterModal}
        filterParamsForExport={filterParamsForExport}
        getStatusText={getStatusText}
        isAdminOrGestor={isAdminOrGestor}
        canInserirObrigacao={canInserirObrigacao}
        setShowImportModal={setShowImportModal}
        setShowObrigacaoModal={setShowObrigacaoModal}
      />

      {hasActiveFilters && (
        <FiltrosAplicados
          filters={filtrosAplicados}
          onClearAll={handleClearAllFilters}
          className="mb-6"
        />
      )}

      <ObrigacoesTable 
        obrigacoes={obrigacoes}
        loading={loading && obrigacoes.length === 0}
        isAdminOrGestor={isAdminOrGestor}
        handleSort={handleSort}
        canInserirObrigacao={canInserirObrigacao}
        canConcluirObrigacao={canConcluirObrigacao}
        canEnviarAreasObrigacao={canEnviarAreasObrigacao}
        canNaoAplicavelSuspensaObrigacao={canNaoAplicavelSuspensaObrigacao}
        canDeletarObrigacao={canDeletarObrigacao}
        onVisualizar={handleVisualize}
        onEditar={handleEdit}
        onAnexarProtocolo={handleAnexarProtocolo}
        onEncaminharTramitacao={handleEncaminharTramitacao}
        onEnviarArea={handleEnviarArea}
        onNaoAplicavelSuspenso={handleNaoAplicavelSuspenso}
        onExcluir={handleDelete}
      />
      </div>
    </ObrigacoesUIProvider>
  );
}