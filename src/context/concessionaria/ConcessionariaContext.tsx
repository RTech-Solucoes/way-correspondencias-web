'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { authClient } from '@/api/auth/client';
import concessionariaClient from '@/api/concessionaria/client';
import { ConcessionariaResponse } from '@/api/concessionaria/types';
import { responsaveisClient } from '@/api/responsaveis/client';

interface ConcessionariaContextProps {
  concessionariaSelecionada: ConcessionariaResponse | null;
  concessionarias: ConcessionariaResponse[];
  loading: boolean;
  concessionariaChangeKey: number;
  setConcessionariaSelecionada: (concessionaria: ConcessionariaResponse | null) => void;
}

const ConcessionariaContext = createContext<ConcessionariaContextProps>({} as ConcessionariaContextProps);

const STORAGE_KEY = 'concessionaria-selecionada';

export function ConcessionariaProvider({ children }: { children: ReactNode }) {
  const [concessionariaSelecionada, setConcessionariaSelecionadaState] = useState<ConcessionariaResponse | null>(null);
  const [concessionarias, setConcessionarias] = useState<ConcessionariaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [concessionariaChangeKey, setConcessionariaChangeKey] = useState(0);

  const setConcessionariaSelecionada = useCallback((concessionaria: ConcessionariaResponse | null) => {
    const idAnterior = concessionariaSelecionada?.idConcessionaria;
    const idNovo = concessionaria?.idConcessionaria;
    
    setConcessionariaSelecionadaState(concessionaria);
    if (concessionaria) {
      localStorage.setItem(STORAGE_KEY, concessionaria.idConcessionaria.toString());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    
    // Se mudou a concessionária, incrementa a chave para disparar recarregamento
    if (idAnterior !== idNovo && idNovo !== undefined) {
      setConcessionariaChangeKey(prev => prev + 1);
      // Dispara evento customizado para componentes que escutam
      window.dispatchEvent(new CustomEvent('concessionariaChanged', { 
        detail: { idConcessionaria: idNovo } 
      }));
    }
  }, [concessionariaSelecionada?.idConcessionaria]);

  useEffect(() => {
    const carregarConcessionarias = async () => {
      // Verificar se o usuário está autenticado antes de buscar concessionárias
      if (!authClient.isAuthenticated()) {
        setConcessionarias([]);
        setConcessionariaSelecionadaState(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Buscar concessionárias do responsável logado
        let concessionariasDoResponsavel: ConcessionariaResponse[] = [];
        try {
          concessionariasDoResponsavel = await concessionariaClient.buscarPorIdResponsavel();
        } catch (error) {
          // Se der 401, usuário não está autenticado, não fazer nada
          const apiError = error as { status?: number };
          if (apiError?.status === 401) {
            setConcessionarias([]);
            setConcessionariaSelecionadaState(null);
            setLoading(false);
            return;
          }
          console.error('Erro ao buscar concessionárias do responsável:', error);
          // Fallback: usar concessionárias do token se o endpoint falhar
          const idsConcessionarias = authClient.getIdsConcessionariasFromToken();
          if (idsConcessionarias.length > 0) {
            const todasConcessionarias = await concessionariaClient.buscarTodas();
            concessionariasDoResponsavel = todasConcessionarias.filter(
              c => idsConcessionarias.includes(c.idConcessionaria)
            );
          }
        }
        
        if (concessionariasDoResponsavel.length === 0) {
          setConcessionarias([]);
          setConcessionariaSelecionadaState(null);
          setLoading(false);
          return;
        }

        setConcessionarias(concessionariasDoResponsavel);

        // Verificar se há uma concessionária salva no localStorage
        const idSalvo = localStorage.getItem(STORAGE_KEY);
        if (idSalvo) {
          const concessionariaSalva = concessionariasDoResponsavel.find(
            c => c.idConcessionaria.toString() === idSalvo
          );
          if (concessionariaSalva) {
            setConcessionariaSelecionada(concessionariaSalva);
            setLoading(false);
            return;
          }
        }

        // Se não houver salva, selecionar a primeira automaticamente
        if (concessionariasDoResponsavel.length > 0) {
          setConcessionariaSelecionada(concessionariasDoResponsavel[0]);
        } else {
          setConcessionariaSelecionadaState(null);
        }
      } catch (error) {
        console.error('Erro ao carregar concessionárias:', error);
        setConcessionarias([]);
        setConcessionariaSelecionadaState(null);
      } finally {
        setLoading(false);
      }
    };

    carregarConcessionarias();

    // Listener para quando o token for salvo na mesma aba (após login)
    const handleAuthTokenSaved = () => {
      carregarConcessionarias();
    };

    // Listener para quando o token for salvo em outra aba
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' && e.newValue) {
        carregarConcessionarias();
      }
    };

    // Listener para quando o token for removido (logout)
    const handleAuthTokenRemoved = () => {
      setConcessionarias([]);
      setConcessionariaSelecionadaState(null);
      setLoading(false);
    };

    window.addEventListener('authTokenSaved', handleAuthTokenSaved);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authTokenRemoved', handleAuthTokenRemoved);

    return () => {
      window.removeEventListener('authTokenSaved', handleAuthTokenSaved);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authTokenRemoved', handleAuthTokenRemoved);
    };
  }, [setConcessionariaSelecionada]);

  return (
    <ConcessionariaContext.Provider
      value={{
        concessionariaSelecionada,
        concessionarias,
        loading,
        concessionariaChangeKey,
        setConcessionariaSelecionada,
      }}
    >
      {children}
    </ConcessionariaContext.Provider>
  );
}

export const useConcessionaria = () => {
  const context = useContext(ConcessionariaContext);
  if (!context) {
    throw new Error('useConcessionaria must be used within a ConcessionariaProvider');
  }
  return context;
};

