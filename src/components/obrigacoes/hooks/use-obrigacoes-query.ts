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

export function useObrigacoesCondicionadasQuery(
  idObrigacao: number,
  options: { enabled?: boolean; staleTime?: number } = {},
) {
  const { enabled = true, staleTime = 1000 * 60 * 2 } = options;
  return useQuery({
    queryKey: obrigacoesKeys.condicionadas(idObrigacao),
    queryFn: () => obrigacaoClient.buscarObrigacoesCondicionadas(idObrigacao),
    staleTime,
    enabled: !!idObrigacao && enabled,
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

export function useDeleteObrigacoes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => obrigacaoClient.deletarVarias(ids),
    onSuccess: (_data, ids) => {
      queryClient.invalidateQueries({ queryKey: obrigacoesKeys.lists() });
      toast.success(
        ids.length === 1
          ? 'Obrigação excluída com sucesso'
          : 'Obrigações excluídas com sucesso'
      );
    },
    onError: () => {
      toast.error('Erro ao excluir obrigações selecionadas');
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
    // A mensagem de sucesso fica com quem chama, pois depende do status antes do envio.
    onSuccess: (_response, id) => {
      queryClient.invalidateQueries({ queryKey: obrigacoesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: obrigacoesKeys.detail(id) });
    },
    onError: (error: Error & { status?: number }) => {
      // 409: a obrigação já havia sido enviada (ex.: outro usuário enviou antes). Atualiza a lista
      // para refletir o estado real e bloquear um novo envio.
      if (error?.status === 409) {
        queryClient.invalidateQueries({ queryKey: obrigacoesKeys.lists() });
        toast.error(error.message || 'Esta obrigação já foi enviada para a área.');
        return;
      }
      // Erros de negócio (4xx) trazem a mensagem da API, ex.: responsável sem área vinculada
      const isErroNegocio = !!error?.status && error.status >= 400 && error.status < 500 && error.status !== 401;
      toast.error(isErroNegocio && error.message ? error.message : 'Erro ao enviar obrigação para área. Tente novamente.');
    },
  });
}
