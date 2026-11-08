import { useMutation, useQueryClient } from '@tanstack/react-query';
import obrigacaoClient from '@/api/obrigacao/client';
import type { ConclusaoAdministrativaRequest } from '@/api/obrigacao/types';
import { obrigacoesKeys } from '@/components/obrigacoes/hooks/use-obrigacoes-query';

interface RegistrarConclusaoVariables {
  idObrigacao: number;
  request: ConclusaoAdministrativaRequest;
}

/** Registra a conclusão administrativa e atualiza a listagem e o detalhe da obrigação. */
export function useRegistrarConclusao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ idObrigacao, request }: RegistrarConclusaoVariables) =>
      obrigacaoClient.registrarConclusaoAdministrativa(idObrigacao, request),
    onSettled: (_data, _error, { idObrigacao }) => {
      queryClient.invalidateQueries({ queryKey: obrigacoesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: obrigacoesKeys.detail(idObrigacao) });
    },
  });
}
