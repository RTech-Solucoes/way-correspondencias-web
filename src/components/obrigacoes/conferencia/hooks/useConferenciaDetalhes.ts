import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import obrigacaoClient from '@/api/obrigacao/client';
import { ObrigacaoDetalheResponse } from '@/api/obrigacao/types';
import { authClient } from '@/api/auth/client';
import { responsaveisClient } from '@/api/responsaveis/client';
import { ResponsavelResponse } from '@/api/responsaveis/types';

interface UseConferenciaDetalhesProps {
  id: string | null;
}

export function useConferenciaDetalhes({ id }: UseConferenciaDetalhesProps) {
  const router = useRouter();
  const [detalhe, setDetalhe] = useState<ObrigacaoDetalheResponse | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [userResponsavel, setUserResponsavel] = useState<ResponsavelResponse | null>(null);

  const parsedId = useMemo(() => {
    if (!id) return null;
    const numId = Number(id);
    return Number.isNaN(numId) || numId <= 0 ? null : numId;
  }, [id]);

  const carregarDetalhe = useCallback(async () => {
    if (!parsedId) {
      toast.error('Identificador da obrigação inválido.');
      router.push('/obrigacao');
      return;
    }

    try {
      setPageLoading(true);
      const response = await obrigacaoClient.buscarDetalhePorId(parsedId);
      setDetalhe(response);
    } catch (error) {
      console.error('Erro ao carregar a obrigação:', error);
      toast.error('Não foi possível carregar a obrigação.');
      router.push('/obrigacao');
    } finally {
      setPageLoading(false);
    }
  }, [parsedId, router]);

  const reloadDetalhe = useCallback(async () => {
    if (!parsedId) {
      return;
    }
    try {
      const response = await obrigacaoClient.buscarDetalhePorId(parsedId);
      setDetalhe(response);
    } catch (error) {
      console.error('Erro ao recarregar detalhes da obrigação:', error);
      toast.error('Erro ao recarregar detalhes da obrigação.');
    }
  }, [parsedId]);

  useEffect(() => {
    carregarDetalhe();
  }, [carregarDetalhe]);

  useEffect(() => {
    const carregarUserResponsavel = async () => {
      try {
        const idFromToken = authClient.getUserIdResponsavelFromToken();
        const userName = authClient.getUserName();
        
        if (!(idFromToken || userName)) {
          return;
        }

        const responsavel = idFromToken
          ? await responsaveisClient.buscarPorId(idFromToken)
          : await responsaveisClient.buscarPorNmUsuarioLogin(userName!);
        
        setUserResponsavel(responsavel);
      } catch (error) {
        console.error('Erro ao carregar responsável logado:', error);
      }
    };

    carregarUserResponsavel();
  }, []);

  return {
    detalhe,
    setDetalhe,
    pageLoading,
    userResponsavel,
    reloadDetalhe,
    parsedId,
  };
}

