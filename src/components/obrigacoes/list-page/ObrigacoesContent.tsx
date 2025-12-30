'use client';

import { useObrigacoes } from "@/context/obrigacoes/ObrigacoesContext";
import { FiltrosAplicados } from "@/components/ui/applied-filters";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { STATUS_LIST, statusList } from "@/api/status-solicitacao/types";
import obrigacaoClient from "@/api/obrigacao/client";
import { toast } from "sonner";
import { useUserGestao } from "@/hooks/use-user-gestao";
import { ObrigacaoResumoResponse, ObrigacaoResponse } from "@/api/obrigacao/types";
import { usePermissoes } from "@/context/permissoes/PermissoesContext";

// Modular Components
import { ObrigacoesTable } from "@/components/obrigacoes/list-page/ObrigacoesTable";
import { ObrigacoesHeader } from "@/components/obrigacoes/list-page/ObrigacoesHeader";
import { ObrigacoesFiltersUI } from "@/components/obrigacoes/list-page/ObrigacoesFiltersUI";
import { ObrigacoesModals } from "@/components/obrigacoes/list-page/ObrigacoesModals";

// Hooks
import { useObrigacoesFilters } from "./hooks/useObrigacoesFilters";
import { perfilUtil } from "@/api/perfis/types";

export function ObrigacoesContent() {
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
    setShowDeleteDialog,
    setObrigacaoToDelete,
    filters,
    setFilters,
    handleSort,
    loadObrigacoes,
  } = useObrigacoes();

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

  const [showImportModal, setShowImportModal] = useState(false);
  const [showAnexarProtocoloModal, setShowAnexarProtocoloModal] = useState(false);
  const [showObrigacoesCondicionadasModal, setShowObrigacoesCondicionadasModal] = useState(false);
  const [obrigacaoParaProtocolo, setObrigacaoParaProtocolo] = useState<ObrigacaoResponse | null>(null);
  const [obrigacoesCondicionadas, setObrigacoesCondicionadas] = useState<ObrigacaoResumoResponse[]>([]);
  const [showNaoAplicavelSuspensoModal, setShowNaoAplicavelSuspensoModal] = useState(false);
  const [obrigacaoParaNaoAplicavelSuspenso, setObrigacaoParaNaoAplicavelSuspenso] = useState<ObrigacaoResponse | null>(null);
  const [showTramitacaoModal, setShowTramitacaoModal] = useState(false);
  const [obrigacaoParaTramitacao, setObrigacaoParaTramitacao] = useState<ObrigacaoResponse | null>(null);
  const [showConfirmTramitacao, setShowConfirmTramitacao] = useState(false);
  const [obrigacaoParaConfirmarTramitacao, setObrigacaoParaConfirmarTramitacao] = useState<ObrigacaoResponse | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { idPerfil } = useUserGestao();
  const permissions = usePermissoes();
  const canInserirObrigacao = !!permissions.canInserirObrigacao;
  const canDeletarObrigacao = !!permissions.canDeletarObrigacao;
  const canConcluirObrigacao = !!permissions.canConcluirObrigacao;
  const canEnviarAreasObrigacao = !!permissions.canEnviarAreasObrigacao;
  const canNaoAplicavelSuspensaObrigacao = !!permissions.canNaoAplicavelSuspensaObrigacao;

  const idObrigacaoFromUrl = useMemo(() => {
    const param = searchParams.get('idObrigacao');
    return param ? Number(param) : undefined;
  }, [searchParams]);

  const isInitialMount = useRef(true);
  const prevIdObrigacao = useRef(idObrigacaoFromUrl);

  useEffect(() => {
    if (prevIdObrigacao.current !== idObrigacaoFromUrl) {
      prevIdObrigacao.current = idObrigacaoFromUrl;
      if (!isInitialMount.current) {
        setCurrentPage(0);
        return;
      }
    }

    loadObrigacoes(idObrigacaoFromUrl);
    isInitialMount.current = false;
  }, [idObrigacaoFromUrl, filters, currentPage, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps 

  const isAdminOrGestor = useMemo(() => {
    return idPerfil === perfilUtil.ADMINISTRADOR ||
      idPerfil === perfilUtil.GESTOR_DO_SISTEMA ||
      idPerfil === perfilUtil.VALIDADOR_ASSINANTE ||
      idPerfil === perfilUtil.TECNICO_SUPORTE;
  }, [idPerfil]);

  const getStatusText = (statusCode: string): string | null => {
    if (!statusCode) return null;
    const status = STATUS_LIST.find(s => s.id.toString() === statusCode);
    if (status) {
      return status.label;
    }
    return null;
  };

  const handleNaoAplicavelSuspenso = (obrigacao: ObrigacaoResponse) => {
    setObrigacaoParaNaoAplicavelSuspenso(obrigacao);
    setShowNaoAplicavelSuspensoModal(true);
  };

  const handleConfirmNaoAplicavelSuspenso = async (justificativa: string) => {
    if (!obrigacaoParaNaoAplicavelSuspenso?.idSolicitacao) {
      toast.error('ID da obrigação não encontrado.');
      return;
    }

    try {
      const response = await obrigacaoClient.atualizarStatusNaoAplicavelSusp(
        obrigacaoParaNaoAplicavelSuspenso.idSolicitacao,
        justificativa
      );
      toast.success(response.mensagem);
      await loadObrigacoes();
      setShowNaoAplicavelSuspensoModal(false);
      setObrigacaoParaNaoAplicavelSuspenso(null);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status. Tente novamente.');
      throw error;
    }
  };

  return (
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
        loading={loading}
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
        loading={loading}
        isAdminOrGestor={isAdminOrGestor}
        handleSort={handleSort}
        canInserirObrigacao={canInserirObrigacao}
        canConcluirObrigacao={canConcluirObrigacao}
        canEnviarAreasObrigacao={canEnviarAreasObrigacao}
        canNaoAplicavelSuspensaObrigacao={canNaoAplicavelSuspensaObrigacao}
        canDeletarObrigacao={canDeletarObrigacao}
        onVisualizar={(obrigacao) => {
          if (!obrigacao.idSolicitacao) return;
          router.push(`/obrigacao/${obrigacao.idSolicitacao}/conferencia`);
        }}
        onEditar={(obrigacao) => {
          if (!obrigacao.idSolicitacao) return;
          router.push(`/obrigacao/${obrigacao.idSolicitacao}/editar`);
        }}
        onAnexarProtocolo={async (obrigacao) => {
          if (!obrigacao.idSolicitacao) return;
          try {
            const response = await obrigacaoClient.buscarObrigacoesCondicionadas(obrigacao.idSolicitacao);
            const condicionadas = response.obrigacoesCondicionadas || [];
            const condicionadasPendentes = condicionadas.filter(
              (cond) =>
                cond.statusSolicitacao?.idStatusSolicitacao !== statusList.CONCLUIDO.id
            );

            if (condicionadasPendentes.length > 0) {
              setObrigacoesCondicionadas(condicionadasPendentes);
              setShowObrigacoesCondicionadasModal(true);
            } else {
              setObrigacaoParaProtocolo(obrigacao);
              setShowAnexarProtocoloModal(true);
            }
          } catch (error) {
            console.error('Erro ao verificar obrigações condicionadas:', error);
            toast.error('Erro ao verificar obrigações condicionadas. Tente novamente.');
          }
        }}
        onEncaminharTramitacao={(obrigacao) => {
          const isEmValidacao = obrigacao.statusSolicitacao?.idStatusSolicitacao === statusList.EM_VALIDACAO_REGULATORIO.id;                          
          if (isEmValidacao) {
            setObrigacaoParaConfirmarTramitacao(obrigacao);
            setShowConfirmTramitacao(true);
          } else {
            setObrigacaoParaTramitacao(obrigacao);
            setShowTramitacaoModal(true);
          }
        }}
        onEnviarArea={async (obrigacao) => {
          if (!obrigacao.idSolicitacao) return;
          try {
            const response = await obrigacaoClient.atualizarFlEnviandoArea(obrigacao.idSolicitacao);
            toast.success(response.mensagem);
            await loadObrigacoes();
          } catch (error) {
            console.error('Erro ao enviar obrigação para área:', error);
            toast.error('Erro ao enviar obrigação para área. Tente novamente.');
          }
        }}
        onNaoAplicavelSuspenso={handleNaoAplicavelSuspenso}
        onExcluir={(obrigacao) => {
          setObrigacaoToDelete(obrigacao);
          setShowDeleteDialog(true);
        }}
      />
    </div>
  );
}