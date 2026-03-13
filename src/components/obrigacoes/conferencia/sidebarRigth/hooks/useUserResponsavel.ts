'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/api/auth/client';
import { responsaveisClient } from '@/api/responsaveis/client';
import { ResponsavelResponse } from '@/api/responsaveis/types';

export function useUserResponsavel() {
  const [userResponsavel, setUserResponsavel] = useState<ResponsavelResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarUserResponsavel = async () => {
      try {
        const idFromToken = authClient.getUserIdResponsavelFromToken();
        
        if (idFromToken) {
          const responsavel = await responsaveisClient.buscarPorId(idFromToken);
          setUserResponsavel(responsavel);
        }
      } catch (error) {
        console.error('Erro ao carregar responsável logado:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarUserResponsavel();
  }, []);

  return { userResponsavel, loading };
}

