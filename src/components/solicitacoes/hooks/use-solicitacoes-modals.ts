import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import correspondenciaClient from '@/api/correspondencia/client';
import { CorrespondenciaDetalheResponse, CorrespondenciaResponse } from '@/api/correspondencia/types';
import anexosClient from '@/api/anexos/client';
import { AnexoResponse, TipoObjetoAnexoEnum } from '@/api/anexos/type';

interface UseSolicitacoesModalsDeps {
  loadSolicitacoes: () => Promise<void>;
}

export function useSolicitacoesModals(deps: UseSolicitacoesModalsDeps) {
  const { loadSolicitacoes } = deps;

  // Estado do modal de solicitação (criar/editar)
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<CorrespondenciaResponse | null>(null);
  const [showSolicitacaoModal, setShowSolicitacaoModal] = useState(false);

  // Estado do modal de delete
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [solicitacaoToDelete, setSolicitacaoToDelete] = useState<CorrespondenciaResponse | null>(null);

  // Estado do modal de detalhes
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [detalhesCorrespondencia, setDetalhesCorrespondencia] = useState<CorrespondenciaDetalheResponse | null>(null);
  const [detalhesAnexos, setDetalhesAnexos] = useState<AnexoResponse[]>([]);

  // Estado do modal de tramitação/histórico
  const [showTramitacaoModal, setShowTramitacaoModal] = useState(false);
  const [tramitacaoSolicitacaoId, setTramitacaoSolicitacaoId] = useState<number | null>(null);

  // Handlers do modal de solicitação
  const handleOpenCreateSolicitacao = useCallback(() => {
    setSelectedSolicitacao(null);
    setShowSolicitacaoModal(true);
  }, []);

  const handleCloseSolicitacaoModal = useCallback(() => {
    setShowSolicitacaoModal(false);
    setSelectedSolicitacao(null);
    loadSolicitacoes();
  }, [loadSolicitacoes]);

  const onSolicitacaoSave = useCallback(() => {
    setShowSolicitacaoModal(false);
    setSelectedSolicitacao(null);
    loadSolicitacoes();
  }, [loadSolicitacoes]);

  // Handlers do modal de detalhes
  const openDetalhes = useCallback(async (s: CorrespondenciaResponse) => {
    setSelectedSolicitacao(s);
    setShowDetalhesModal(true);
    setDetalhesCorrespondencia(null);

    try {
      const detalhes = await correspondenciaClient.buscarDetalhesPorId(s.idSolicitacao);
      setDetalhesCorrespondencia(detalhes);
      const anexos = await anexosClient.buscarPorIdObjetoETipoObjeto(s.idSolicitacao, TipoObjetoAnexoEnum.S);
      setDetalhesAnexos(anexos || []);
    } catch {
      toast.error('Erro ao carregar os detalhes da solicitação');
      setDetalhesCorrespondencia(null);
    }
  }, []);

  const handleCloseDetalhesModal = useCallback(() => {
    setShowDetalhesModal(false);
    setSelectedSolicitacao(null);
    setDetalhesCorrespondencia(null);
    loadSolicitacoes();
  }, [loadSolicitacoes]);

  // Handlers do modal de tramitação
  const handleTramitacoes = useCallback((solicitacao: CorrespondenciaResponse) => {
    setTramitacaoSolicitacaoId(solicitacao.idSolicitacao);
    setShowTramitacaoModal(true);
  }, []);

  const handleCloseTramitacaoModal = useCallback(() => {
    setShowTramitacaoModal(false);
    setTramitacaoSolicitacaoId(null);
    loadSolicitacoes();
  }, [loadSolicitacoes]);

  return {
    // Modal Solicitação
    selectedSolicitacao,
    setSelectedSolicitacao,
    showSolicitacaoModal,
    setShowSolicitacaoModal,
    handleOpenCreateSolicitacao,
    handleCloseSolicitacaoModal,
    onSolicitacaoSave,

    // Modal Delete
    showDeleteDialog,
    setShowDeleteDialog,
    solicitacaoToDelete,
    setSolicitacaoToDelete,

    // Modal Detalhes
    showDetalhesModal,
    detalhesCorrespondencia,
    detalhesAnexos,
    openDetalhes,
    handleCloseDetalhesModal,

    // Modal Tramitação
    showTramitacaoModal,
    tramitacaoSolicitacaoId,
    handleTramitacoes,
    handleCloseTramitacaoModal,
  };
}
