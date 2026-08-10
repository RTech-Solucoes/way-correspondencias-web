import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import concessionariaClient from '@/api/concessionaria/client';
import {
  ConfiguracaoConcessionariaRequest,
  ConfiguracaoConcessionariaResponse,
  ConcessionariaFilterParams,
  ConcessionariaRequest,
} from '@/api/concessionaria/types';
import { notifyConcessionariasUpdated } from '@/context/concessionaria/ConcessionariaContext';

export const concessionariasKeys = {
  all: ['concessionarias'] as const,
  lists: () => [...concessionariasKeys.all, 'list'] as const,
  list: (filters: ConcessionariaFilterParams) => [...concessionariasKeys.lists(), filters] as const,
  detail: (id: number) => [...concessionariasKeys.all, 'detail', id] as const,
  config: (id: number) => [...concessionariasKeys.all, 'config', id] as const,
};

export function useConcessionariasQuery(params: ConcessionariaFilterParams) {
  return useQuery({
    queryKey: concessionariasKeys.list(params),
    queryFn: () => concessionariaClient.buscarParaAdministracao(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    placeholderData: (previousData) => previousData,
  });
}

export function useConfiguracaoConcessionariaQuery(idConcessionaria?: number | null) {
  return useQuery({
    queryKey: concessionariasKeys.config(idConcessionaria ?? 0),
    queryFn: () => concessionariaClient.buscarConfiguracao(idConcessionaria!),
    enabled: !!idConcessionaria,
    retry: false,
  });
}

export function useConfiguracoesConcessionariasQueries(idsConcessionarias: number[]) {
  const queries = useQueries({
    queries: idsConcessionarias.map((idConcessionaria) => ({
      queryKey: concessionariasKeys.config(idConcessionaria),
      queryFn: async () => {
        try {
          return await concessionariaClient.buscarConfiguracao(idConcessionaria);
        } catch (error) {
          if ((error as { status?: number }).status === 404) return null;
          throw error;
        }
      },
      retry: false,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnMount: true,
    })),
  });

  const configuracoesById = idsConcessionarias.reduce<Record<number, ConfiguracaoConcessionariaResponse | null>>(
    (acc, idConcessionaria, index) => {
      acc[idConcessionaria] = queries[index]?.data ?? null;
      return acc;
    },
    {},
  );

  const configuracoesLoadingById = idsConcessionarias.reduce<Record<number, boolean>>(
    (acc, idConcessionaria, index) => {
      // isPending/isLoading: só o carregamento inicial. Não usar isFetching —
      // refetch em background mantinha "Calculando..." indevidamente.
      acc[idConcessionaria] = queries[index]?.isPending ?? false;
      return acc;
    },
    {},
  );

  return {
    configuracoesById,
    configuracoesLoadingById,
  };
}

export function useCreateConcessionaria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConcessionariaRequest) => concessionariaClient.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: concessionariasKeys.lists() });
      notifyConcessionariasUpdated();
      toast.success('Concessionária criada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar concessionária');
    },
  });
}

export function useUpdateConcessionaria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ConcessionariaRequest }) => {
      const concessionaria = await concessionariaClient.atualizar(id, data);
      if (data.flAtivo) {
        await concessionariaClient.sincronizarStatusConfiguracao(id, data.flAtivo);
      }
      return concessionaria;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: concessionariasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: concessionariasKeys.detail(variables.id) });
      notifyConcessionariasUpdated();
      toast.success('Concessionária atualizada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar concessionária');
    },
  });
}

export function useToggleConcessionariaStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, flAtivo }: { id: number; flAtivo: 'S' | 'N' }) =>
      concessionariaClient.alterarStatus(id, flAtivo),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: concessionariasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: concessionariasKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: concessionariasKeys.config(variables.id) });
      notifyConcessionariasUpdated();
      toast.success(variables.flAtivo === 'S'
        ? 'Concessionária ativada com sucesso'
        : 'Concessionária desativada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao alterar status da concessionária');
    },
  });
}

export function useDeleteConcessionaria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => concessionariaClient.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: concessionariasKeys.lists() });
      notifyConcessionariasUpdated();
      toast.success('Concessionária excluída com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao excluir concessionária');
    },
  });
}

export function useSaveConfiguracaoConcessionaria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
      hasConfiguracao,
    }: {
      id: number;
      data: ConfiguracaoConcessionariaRequest;
      hasConfiguracao: boolean;
    }) =>
      hasConfiguracao
        ? concessionariaClient.atualizarConfiguracao(id, data)
        : concessionariaClient.criarConfiguracao(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: concessionariasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: concessionariasKeys.config(variables.id) });
      toast.success('Configuração salva com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao salvar configuração');
    },
  });
}
