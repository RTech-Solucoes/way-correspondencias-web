import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'sonner';
import mencoesClient from '@/api/obrigacao/mencoes-client';
import { extrairIdsMencionados } from './mencoes';

const CINCO_MINUTOS = 5 * 60 * 1000;
const INTERVALO_NOTIFICACOES = 15_000;

const mencionaveisKey = (idObrigacao: number) => ['obrigacao-mencionaveis', idObrigacao] as const;
const naoLidasKey = (idConcessionaria?: number) => ['mencoes-nao-lidas', idConcessionaria] as const;

/** A lista só é buscada quando o usuário digita "@". */
export function useMencionaveis(idObrigacao: number, habilitado: boolean) {
  return useQuery({
    queryKey: mencionaveisKey(idObrigacao),
    queryFn: () => mencoesClient.listarMencionaveis(idObrigacao),
    enabled: habilitado && idObrigacao > 0,
    staleTime: CINCO_MINUTOS,
  });
}

/** Notifica as pessoas citadas no comentário já salvo; uma falha aqui não desfaz o comentário. */
export function useNotificarMencoes(idObrigacao?: number) {
  const queryClient = useQueryClient();

  return useCallback(async (texto: string) => {
    if (!idObrigacao || !texto.includes('@')) return;

    try {
      const mencionaveis = await queryClient.fetchQuery({
        queryKey: mencionaveisKey(idObrigacao),
        queryFn: () => mencoesClient.listarMencionaveis(idObrigacao),
        staleTime: CINCO_MINUTOS,
      });
      const ids = extrairIdsMencionados(texto, mencionaveis);
      if (ids.length > 0) {
        await mencoesClient.registrar(idObrigacao, ids, texto);
      }
    } catch (error) {
      console.error('Erro ao notificar menções:', error);
      toast.warning('Comentário salvo, mas não foi possível notificar as pessoas mencionadas.');
    }
  }, [idObrigacao, queryClient]);
}

export function useMencoesNaoLidas(idConcessionaria?: number) {
  return useQuery({
    queryKey: naoLidasKey(idConcessionaria),
    queryFn: () => mencoesClient.listarNaoLidas(),
    enabled: !!idConcessionaria,
    refetchInterval: INTERVALO_NOTIFICACOES,
    refetchOnWindowFocus: true,
  });
}

export function useAtualizarMencoesNaoLidas(idConcessionaria?: number) {
  const queryClient = useQueryClient();
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: naoLidasKey(idConcessionaria) }),
    [idConcessionaria, queryClient],
  );
}
