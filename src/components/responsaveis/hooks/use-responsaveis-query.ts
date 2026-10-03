import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ResponsavelFilterParams } from '@/api/responsaveis/types';
import { responsaveisClient } from '@/api/responsaveis/client';

// Query Keys
export const responsaveisKeys = {
  all: ['responsaveis'] as const,
  lists: () => [...responsaveisKeys.all, 'list'] as const,
  list: (filters: ResponsavelFilterParams) => [...responsaveisKeys.lists(), filters] as const,
  detail: (id: number) => [...responsaveisKeys.all, 'detail', id] as const,
};

// Hook para buscar responsáveis
export function useResponsaveisQuery(params: ResponsavelFilterParams) {
  return useQuery({
    queryKey: responsaveisKeys.list(params),
    queryFn: () => responsaveisClient.buscarPorFiltro(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    placeholderData: (previousData) => previousData, // Mantém dados anteriores durante refetch
  });
}

// Hook para deletar responsável
export function useDeleteResponsavel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => responsaveisClient.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: responsaveisKeys.lists() });
      toast.success('Responsável excluído com sucesso');
    },
    onError: () => {
      toast.error('Erro ao excluir responsável');
    },
  });
}

export function useDeleteResponsaveis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => responsaveisClient.deletarVarias(ids),
    onSuccess: (_data, ids) => {
      queryClient.invalidateQueries({ queryKey: responsaveisKeys.lists() });
      toast.success(
        ids.length === 1
          ? 'Responsável excluído com sucesso'
          : 'Responsáveis excluídos com sucesso'
      );
    },
    onError: () => {
      toast.error('Erro ao excluir responsáveis selecionados');
    },
  });
}

// Hook para gerar senha
function getGerarSenhaErrorMessage(error: Error): string {
  const message = error.message?.trim();

  if (!message) {
    return 'Não foi possível enviar o e-mail com a senha de acesso. Tente novamente.';
  }

  if (/smtp|e-mail|email|mail/i.test(message)) {
    return message;
  }

  if (/ldap/i.test(message)) {
    return message;
  }

  return message;
}

export function useGerarSenhaResponsavel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => responsaveisClient.gerarSenhaEEnviarEmail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: responsaveisKeys.lists() });
      toast.success('Senha gerada e enviada por e-mail com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(getGerarSenhaErrorMessage(error));
    },
  });
}
