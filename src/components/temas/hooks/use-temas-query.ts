import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TemaFilterParams, TemaRequest } from '@/api/temas/types';
import { temasClient } from '@/api/temas/client';

// Query Keys
export const temasKeys = {
  all: ['temas'] as const,
  lists: () => [...temasKeys.all, 'list'] as const,
  list: (filters: TemaFilterParams) => [...temasKeys.lists(), filters] as const,
  detail: (id: number) => [...temasKeys.all, 'detail', id] as const,
};

// Hook para buscar temas
export function useTemasQuery(params: TemaFilterParams) {
  return useQuery({
    queryKey: temasKeys.list(params),
    queryFn: () => temasClient.buscarPorFiltro(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    placeholderData: (previousData) => previousData, // Mantém dados anteriores durante refetch
  });
}

// Hook para criar tema
export function useCreateTema() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TemaRequest) => temasClient.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: temasKeys.lists() });
      toast.success('Tema criado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar tema');
    },
  });
}

// Hook para atualizar tema
export function useUpdateTema() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TemaRequest }) =>
      temasClient.atualizar(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: temasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: temasKeys.detail(variables.id) });
      toast.success('Tema atualizado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar tema');
    },
  });
}

// Hook para deletar tema
export function useDeleteTema() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => temasClient.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: temasKeys.lists() });
      toast.success('Tema excluído com sucesso');
    },
    onError: () => {
      toast.error('Erro ao excluir tema');
    },
  });
}
