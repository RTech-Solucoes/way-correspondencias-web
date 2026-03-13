import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ObrigacaoFiltroRequest } from '@/api/obrigacao/types';
import obrigacaoClient from '@/api/obrigacao/client';

export const obrigacoesKeys = {
  all: ['obrigacoes'] as const,
  lists: () => [...obrigacoesKeys.all, 'list'] as const,
  list: (filters: ObrigacaoFiltroRequest) => [...obrigacoesKeys.lists(), filters] as const,
  detail: (id: number) => [...obrigacoesKeys.all, 'detail', id] as const,
  condicionadas: (id: number) => [...obrigacoesKeys.all, 'condicionadas', id] as const,
};

export function useObrigacoesQuery(params: ObrigacaoFiltroRequest) {
  return useQuery({
    queryKey: obrigacoesKeys.list(params),
    queryFn: () => obrigacaoClient.buscarLista(params),
    staleTime: 1000 * 60 * 2, // Considera dados frescos por 2 minutos
    gcTime: 1000 * 60 * 10, // Mantém cache por 10 minutos
    placeholderData: (previousData) => previousData, // Mantém dados anteriores durante refetch
    retry: 1, // Tenta 1 vez antes de falhar
    refetchOnWindowFocus: true, // Refetch ao voltar para a página
    refetchOnMount: 'always', // Sempre refetch quando o componente montar
  });
}

export function useObrigacoesCondicionadasQuery(idObrigacao: number) {
  return useQuery({
    queryKey: obrigacoesKeys.condicionadas(idObrigacao),
    queryFn: () => obrigacaoClient.buscarObrigacoesCondicionadas(idObrigacao),
    staleTime: 1000 * 60 * 2,
    enabled: !!idObrigacao,
  });
}

export function useDeleteObrigacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => obrigacaoClient.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: obrigacoesKeys.lists() });
      toast.success('Obrigação excluída com sucesso');
    },
    onError: () => {
      toast.error('Erro ao excluir obrigação');
    },
  });
}

export function useUpdateStatusNaoAplicavelSuspenso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, justificativa }: { id: number; justificativa: string }) =>
      obrigacaoClient.atualizarStatusNaoAplicavelSusp(id, justificativa),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: obrigacoesKeys.lists() });
      toast.success(response.mensagem);
    },
    onError: () => {
      toast.error('Erro ao atualizar status. Tente novamente.');
    },
  });
}

export function useEnviarParaArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => obrigacaoClient.atualizarFlEnviandoArea(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: obrigacoesKeys.lists() });
      toast.success(response.mensagem);
    },
    onError: () => {
      toast.error('Erro ao enviar obrigação para área. Tente novamente.');
    },
  });
}
