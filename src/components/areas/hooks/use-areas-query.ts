import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AreaFilterParams, AreaRequest } from '@/api/areas/types';
import { areasClient } from '@/api/areas/client';

// Query Keys - centralizados para fácil gerenciamento
export const areasKeys = {
  all: ['areas'] as const,
  lists: () => [...areasKeys.all, 'list'] as const,
  list: (filters: AreaFilterParams) => [...areasKeys.lists(), filters] as const,
  detail: (id: number) => [...areasKeys.all, 'detail', id] as const,
};

// Hook para buscar áreas com filtros e paginação
export function useAreasQuery(params: AreaFilterParams) {
  return useQuery({
    queryKey: areasKeys.list(params),
    queryFn: () => areasClient.buscarPorFiltro(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos no cache
    placeholderData: (previousData) => previousData, // Mantém dados anteriores durante refetch
  });
}

// Hook para criar área
export function useCreateArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AreaRequest) => areasClient.criar(data),
    onSuccess: () => {
      // Invalida todas as listagens de áreas para recarregar
      queryClient.invalidateQueries({ queryKey: areasKeys.lists() });
      toast.success('Área criada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar área');
    },
  });
}

// Hook para atualizar área
export function useUpdateArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AreaRequest }) =>
      areasClient.atualizar(id, data),
    onSuccess: (_data, variables) => {
      // Invalida listagens e detalhe específico
      queryClient.invalidateQueries({ queryKey: areasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: areasKeys.detail(variables.id) });
      toast.success('Área atualizada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar área');
    },
  });
}

// Hook para deletar área
export function useDeleteArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => areasClient.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: areasKeys.lists() });
      toast.success('Área excluída com sucesso');
    },
    onError: () => {
      toast.error('Erro ao excluir área');
    },
  });
}
