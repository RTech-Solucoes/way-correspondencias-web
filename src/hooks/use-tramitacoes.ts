import {useMutation} from '@tanstack/react-query';
import {tramitacoesClient} from '@/api/tramitacoes/client';
import {TramitacaoRequest, TramitacaoResponse} from '@/api/tramitacoes/types';

export const useTramitacoesMutation = () => {
  return useMutation<TramitacaoResponse, Error, TramitacaoRequest>({
    mutationFn: (data: TramitacaoRequest) => tramitacoesClient.criar(data),
  });
};
