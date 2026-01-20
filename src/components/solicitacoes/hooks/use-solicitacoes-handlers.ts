import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import correspondenciaClient from '@/api/correspondencia/client';
import { CorrespondenciaDetalheResponse, CorrespondenciaResponse } from '@/api/correspondencia/types';
import tramitacoesClient from '@/api/tramitacoes/client';
import { ArquivoDTO } from '@/api/anexos/type';
import { AreaSolicitacao } from '@/api/solicitacoes/types';
import { statusList } from '@/api/status-solicitacao/types';
import { FlAprovadoTramitacaoEnum } from '@/api/tramitacoes/types';

interface UseSolicitacoesHandlersDeps {
  loadSolicitacoes: () => Promise<void>;
  setSelectedSolicitacao: (s: CorrespondenciaResponse | null) => void;
  setShowSolicitacaoModal: (show: boolean) => void;
  setSolicitacaoToDelete: (s: CorrespondenciaResponse | null) => void;
  setShowDeleteDialog: (show: boolean) => void;
  solicitacaoToDelete: CorrespondenciaResponse | null;
  detalhesCorrespondencia: CorrespondenciaDetalheResponse | null;
  setCurrentPage: (page: number) => void;
}

export function useSolicitacoesHandlers(deps: UseSolicitacoesHandlersDeps) {
  const {
    loadSolicitacoes,
    setSelectedSolicitacao,
    setShowSolicitacaoModal,
    setSolicitacaoToDelete,
    setShowDeleteDialog,
    solicitacaoToDelete,
    detalhesCorrespondencia,
    setCurrentPage,
  } = deps;

  // Estado de ordenação
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Handler de ordenação
  const handleSort = useCallback((field: string) => {
    let newSortDirection: 'asc' | 'desc' = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      newSortDirection = 'desc';
    }
    setSortField(field);
    setSortDirection(newSortDirection);
    setCurrentPage(0);
  }, [sortField, sortDirection, setCurrentPage]);

  // Handler de edição
  const handleEdit = useCallback((solicitacao: CorrespondenciaResponse) => {
    setSelectedSolicitacao(solicitacao);
    setShowSolicitacaoModal(true);
  }, [setSelectedSolicitacao, setShowSolicitacaoModal]);

  // Handler de exclusão
  const handleDelete = useCallback((solicitacao: CorrespondenciaResponse) => {
    setSolicitacaoToDelete(solicitacao);
    setShowDeleteDialog(true);
  }, [setSolicitacaoToDelete, setShowDeleteDialog]);

  const confirmDelete = useCallback(async () => {
    if (solicitacaoToDelete) {
      try {
        await correspondenciaClient.deletar(solicitacaoToDelete.idSolicitacao);
        toast.success('Solicitação excluída com sucesso');
        loadSolicitacoes();
      } catch {
        toast.error('Erro ao excluir solicitação');
      } finally {
        setShowDeleteDialog(false);
        setSolicitacaoToDelete(null);
      }
    }
  }, [solicitacaoToDelete, loadSolicitacoes, setShowDeleteDialog, setSolicitacaoToDelete]);

  // Handler de enviar devolutiva
  const enviarDevolutiva = useCallback(async (
    mensagem: string,
    arquivos: ArquivoDTO[],
    flAprovado?: FlAprovadoTramitacaoEnum,
    idAreaOrigem?: number | null
  ) => {
    const alvo = detalhesCorrespondencia;
    if (!alvo) return;
    try {
      const data = {
        dsObservacao: mensagem || '',
        idSolicitacao: alvo.correspondencia.idSolicitacao,
        flAprovado: flAprovado,
        arquivos: arquivos,
        idAreaOrigem: idAreaOrigem ?? undefined,
      };
      await tramitacoesClient.tramitarViaFluxo(data);
      await loadSolicitacoes();
    } catch (err) {
      throw err;
    }
  }, [detalhesCorrespondencia, loadSolicitacoes]);

  // Status helpers
  const getStatusBadgeVariant = useCallback((status: string | number): "default" | "secondary" | "destructive" | "outline" => {
    const statusStr = status?.toString()?.toUpperCase();

    if (statusStr?.includes('VENCIDO') || statusStr === 'T' || statusStr === '2' || statusStr === '4') {
      return 'destructive';
    }

    if (statusStr?.includes('CONCLUÍDO') || statusStr?.includes('ARQUIVADO') || statusStr === 'C' || statusStr === 'X' || statusStr === '8' || statusStr === '9') {
      return 'outline';
    }

    if (statusStr?.includes('PRÉ') || statusStr === 'P' || statusStr === '1') {
      return 'secondary';
    }

    return 'default';
  }, []);

  const getStatusBadgeBg = useCallback((status: string | number): string => {
    const statusStr = status?.toString()?.toUpperCase();

    if (statusStr?.includes('VENCIDO') || statusStr === 'T' || statusStr === '2' || statusStr === '4') {
      return '#a80000';
    }

    if (statusStr?.includes('CONCLUÍDO') || statusStr?.includes('ARQUIVADO') || statusStr === 'C' || statusStr === 'X' || statusStr === '8' || statusStr === '9') {
      return '#008000';
    }

    if (statusStr?.includes('PRÉ') || statusStr === 'P' || statusStr === '1') {
      return '#b68500';
    }

    return '#1447e6';
  }, []);

  const getStatusText = useCallback((status: string | number) => {
    const statusStr = status?.toString()?.toUpperCase();
    switch (statusStr) {
      case 'P':
      case '1':
        return statusList.PRE_ANALISE.label;
      case 'V':
      case '2':
        return statusList.VENCIDO_REGULATORIO.label;
      case 'A':
      case '3':
        return statusList.EM_ANALISE_AREA_TECNICA.label;
      case 'T':
      case '4':
        return statusList.VENCIDO_AREA_TECNICA.label;
      case 'R':
      case '5':
        return statusList.ANALISE_REGULATORIA.label;
      case 'O':
      case '6':
        return statusList.EM_APROVACAO.label;
      case 'S':
      case '7':
        return statusList.EM_ASSINATURA_DIRETORIA.label;
      case 'C':
      case '8':
        return statusList.CONCLUIDO.label;
      case 'X':
      case '9':
        return statusList.ARQUIVADO.label;
      default:
        return status?.toString() || 'N/A';
    }
  }, []);

  // Helper para path de objetos
  const getByPath = useCallback((obj: unknown, path: string): unknown => {
    return path
      .split('.')
      .reduce<unknown>((acc, key) => {
        if (acc !== null && typeof acc === 'object' && acc !== undefined && key in (acc as Record<string, unknown>)) {
          return (acc as Record<string, unknown>)[key];
        }
        return undefined;
      }, obj) ?? null;
  }, []);

  // Helper para juntar áreas
  const getJoinedNmAreas = useCallback((areas: AreaSolicitacao[] | undefined) => {
    if (areas && areas.length > 0) {
      return areas.map(a => a.nmArea).join(', ');
    }
    return '-';
  }, []);

  return {
    // Ordenação
    sortField,
    sortDirection,
    handleSort,

    // Handlers CRUD
    handleEdit,
    handleDelete,
    confirmDelete,
    enviarDevolutiva,

    // Status helpers
    getStatusBadgeVariant,
    getStatusBadgeBg,
    getStatusText,

    // Helpers
    getByPath,
    getJoinedNmAreas,
  };
}
