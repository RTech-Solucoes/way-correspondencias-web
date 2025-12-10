'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/api/auth/client';
import concessionariaClient from '@/api/concessionaria/client';
import { ConcessionariaResponse } from '@/api/concessionaria/types';

// Constantes de configuração
const STORAGE_KEY = 'concessionaria-selecionada';
const AUTH_TOKEN_SAVED_DELAY = 400; // ms

interface ConcessionariaContextProps {
  concessionariaSelecionada: ConcessionariaResponse | null;
  concessionarias: ConcessionariaResponse[];
  loading: boolean;
  concessionariaChangeKey: number;
  setConcessionariaSelecionada: (concessionaria: ConcessionariaResponse | null) => void;
}

const ConcessionariaContext = createContext<ConcessionariaContextProps>({} as ConcessionariaContextProps);

export function ConcessionariaProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
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
    let isMounted = true;
    
    const carregarConcessionarias = async () => {
      // Verificar se o usuário está autenticado antes de buscar concessionárias
      if (!authClient.isAuthenticated()) {
        if (isMounted) {
          setConcessionarias([]);
          setConcessionariaSelecionadaState(null);
          setLoading(false);
        }
        return;
      }

      try {
        if (isMounted) setLoading(true);
        
        let concessionariasDoResponsavel: ConcessionariaResponse[] = [];
        try {
          concessionariasDoResponsavel = await concessionariaClient.buscarPorIdResponsavelLogado();
        } catch (error) {
          const apiError = error as { status?: number };
          if (apiError?.status === 401) {
            if (isMounted) {
              setConcessionarias([]);
              setConcessionariaSelecionadaState(null);
              setLoading(false);
            }
            return;
          }
          console.error('Erro ao buscar concessionárias do responsável:', error);
          // Fallback: usar concessionárias do token se o endpoint falhar
          try {
            const idsConcessionarias = authClient.getIdsConcessionariasFromToken();
            if (idsConcessionarias.length > 0) {
              const todasConcessionarias = await concessionariaClient.buscarTodas();
              concessionariasDoResponsavel = todasConcessionarias.filter(
                c => idsConcessionarias.includes(c.idConcessionaria)
              );
            }
          } catch (fallbackError) {
            console.error('Erro no fallback de concessionárias:', fallbackError);
            if (isMounted) {
              setConcessionarias([]);
              setConcessionariaSelecionadaState(null);
              setLoading(false);
            }
            return;
          }
        }
        
        if (!isMounted) return;
        
        if (concessionariasDoResponsavel.length === 0) {
          setConcessionarias([]);
          setConcessionariaSelecionadaState(null);
          setLoading(false);
          // Se não houver concessionárias, deslogar e redirecionar
          authClient.logout();
          router.push('/');
          return;
        }

        setConcessionarias(concessionariasDoResponsavel);

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
        if (isMounted) {
          setConcessionarias([]);
          setConcessionariaSelecionadaState(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    carregarConcessionarias();

    // Listener para quando o token for salvo (após login)
    const handleAuthTokenSaved = () => {
      if (!isMounted) return;
      
      console.log('[ConcessionariaContext] Token salvo, recarregando concessionárias...');
      setConcessionarias([]);
      setConcessionariaSelecionadaState(null);
      setLoading(true);
      
      setTimeout(() => {
        if (isMounted) carregarConcessionarias();
      }, AUTH_TOKEN_SAVED_DELAY);
    };

    // Listener para quando o token for salvo em outra aba
    const handleStorageChange = (e: StorageEvent) => {
      if (!isMounted) return;
      if (e.key === 'authToken' && e.newValue) {
        carregarConcessionarias();
      }
    };

    // Listener para quando o token for removido (logout)
    const handleAuthTokenRemoved = () => {
      if (!isMounted) return;
      
      console.log('[ConcessionariaContext] Token removido, limpando dados...');
      setConcessionarias([]);
      setConcessionariaSelecionadaState(null);
      localStorage.removeItem(STORAGE_KEY);
      setLoading(false);
    };

    window.addEventListener('authTokenSaved', handleAuthTokenSaved);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authTokenRemoved', handleAuthTokenRemoved);

    return () => {
      isMounted = false;
      window.removeEventListener('authTokenSaved', handleAuthTokenSaved);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authTokenRemoved', handleAuthTokenRemoved);
    };
  }, [setConcessionariaSelecionada, router]);

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

