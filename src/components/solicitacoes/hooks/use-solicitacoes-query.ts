import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import correspondenciaClient from '@/api/correspondencia/client';

interface SolicitacaoQueryParams {
  filtro?: string;
  idStatusSolicitacao?: number;
  idArea?: number;
  cdIdentificacao?: string;
  idTema?: number;
  nmResponsavel?: string;
  dtCriacaoInicio?: string;
  dtCriacaoFim?: string;
  flExigeCienciaGerenteRegul?: string;
  idSolicitacao?: number;
  page: number;
  size: number;
  sort?: string;
}

// Query Keys
export const solicitacoesKeys = {
  all: ['solicitacoes'] as const,
  lists: () => [...solicitacoesKeys.all, 'list'] as const,
  list: (filters: SolicitacaoQueryParams) => [...solicitacoesKeys.lists(), filters] as const,
  detail: (id: number) => [...solicitacoesKeys.all, 'detail', id] as const,
};

// Hook para buscar solicitações
export function useSolicitacoesQuery(params: SolicitacaoQueryParams) {
  return useQuery({
    queryKey: solicitacoesKeys.list(params),
    queryFn: () => correspondenciaClient.buscarPorFiltro(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    placeholderData: (previousData) => previousData, // Mantém dados anteriores durante refetch
  });
}

// Hook para deletar solicitação
export function useDeleteSolicitacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => correspondenciaClient.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: solicitacoesKeys.lists() });
      toast.success('Solicitação excluída com sucesso');
    },
    onError: () => {
      toast.error('Erro ao excluir solicitação');
    },
  });
}
