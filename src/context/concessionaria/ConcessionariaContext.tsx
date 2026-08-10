'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/api/auth/client';
import concessionariaClient from '@/api/concessionaria/client';
import { ConcessionariaResponse } from '@/api/concessionaria/types';
import { setCookie, getCookie, removeCookie } from '@/utils/cookies';

const STORAGE_KEY = 'concessionaria-selecionada';
const AUTH_TOKEN_SAVED_DELAY = 400;
export const CONCESSIONARIAS_UPDATED_EVENT = 'concessionariasUpdated';

export function notifyConcessionariasUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CONCESSIONARIAS_UPDATED_EVENT));
  }
}

interface ConcessionariaContextProps {
  concessionariaSelecionada: ConcessionariaResponse | null;
  concessionarias: ConcessionariaResponse[];
  loading: boolean;
  concessionariaChangeKey: number;
  setConcessionariaSelecionada: (concessionaria: ConcessionariaResponse | null) => void;
  refreshConcessionarias: () => Promise<void>;
}

const ConcessionariaContext = createContext<ConcessionariaContextProps>({} as ConcessionariaContextProps);

export function ConcessionariaProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [concessionariaSelecionada, setConcessionariaSelecionadaState] = useState<ConcessionariaResponse | null>(null);
  const [concessionarias, setConcessionarias] = useState<ConcessionariaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [concessionariaChangeKey, setConcessionariaChangeKey] = useState(0);
  const isMountedRef = useRef(true);
  const hasLoadedRef = useRef(false);

  const setConcessionariaSelecionada = useCallback((concessionaria: ConcessionariaResponse | null) => {
    const idAnterior = concessionariaSelecionada?.idConcessionaria;
    const idNovo = concessionaria?.idConcessionaria;

    setConcessionariaSelecionadaState(concessionaria);
    if (concessionaria) {
      setCookie(STORAGE_KEY, concessionaria.idConcessionaria.toString());
    } else {
      removeCookie(STORAGE_KEY);
    }

    if (idAnterior != null && idAnterior !== idNovo && idNovo !== undefined) {
      setConcessionariaChangeKey(prev => prev + 1);
      window.dispatchEvent(new CustomEvent('concessionariaChanged', {
        detail: { idConcessionaria: idNovo },
      }));
    }
  }, [concessionariaSelecionada?.idConcessionaria]);

  const carregarConcessionarias = useCallback(async (options?: { silent?: boolean; logoutIfEmpty?: boolean }) => {
    const silent = options?.silent ?? false;
    const logoutIfEmpty = options?.logoutIfEmpty ?? true;

    if (!authClient.isAuthenticated()) {
      if (isMountedRef.current) {
        setConcessionarias([]);
        setConcessionariaSelecionadaState(null);
        setLoading(false);
      }
      return;
    }

    try {
      if (isMountedRef.current && !silent) setLoading(true);

      let concessionariasDoResponsavel: ConcessionariaResponse[] = [];
      try {
        concessionariasDoResponsavel = await concessionariaClient.buscarPorIdResponsavelLogado();
      } catch (error) {
        const apiError = error as { status?: number };
        if (apiError?.status === 401) {
          if (isMountedRef.current) {
            setConcessionarias([]);
            setConcessionariaSelecionadaState(null);
            setLoading(false);
          }
          return;
        }
        console.error('Erro ao buscar concessionárias do responsável:', error);
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
          if (isMountedRef.current) {
            setConcessionarias([]);
            setConcessionariaSelecionadaState(null);
            setLoading(false);
          }
          return;
        }
      }

      if (!isMountedRef.current) return;

      if (concessionariasDoResponsavel.length === 0) {
        setConcessionarias([]);
        setConcessionariaSelecionadaState(null);
        setLoading(false);
        if (logoutIfEmpty) {
          authClient.logout();
          router.push('/');
        }
        return;
      }

      setConcessionarias(concessionariasDoResponsavel);
      hasLoadedRef.current = true;

      const idSalvo = getCookie(STORAGE_KEY);
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

      if (concessionariasDoResponsavel.length > 0) {
        setConcessionariaSelecionada(concessionariasDoResponsavel[0]);
      } else {
        setConcessionariaSelecionadaState(null);
      }
    } catch (error) {
      console.error('Erro ao carregar concessionárias:', error);
      if (isMountedRef.current) {
        setConcessionarias([]);
        setConcessionariaSelecionadaState(null);
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [router, setConcessionariaSelecionada]);

  const refreshConcessionarias = useCallback(async () => {
    await carregarConcessionarias({
      silent: hasLoadedRef.current,
      logoutIfEmpty: !hasLoadedRef.current,
    });
  }, [carregarConcessionarias]);

  useEffect(() => {
    isMountedRef.current = true;
    void carregarConcessionarias();

    const handleAuthTokenSaved = () => {
      if (!isMountedRef.current) return;

      hasLoadedRef.current = false;
      setConcessionarias([]);
      setConcessionariaSelecionadaState(null);
      setLoading(true);

      setTimeout(() => {
        if (isMountedRef.current) void carregarConcessionarias();
      }, AUTH_TOKEN_SAVED_DELAY);
    };

    const handleAuthTokenRemoved = () => {
      if (!isMountedRef.current) return;

      hasLoadedRef.current = false;
      setConcessionarias([]);
      setConcessionariaSelecionadaState(null);
      removeCookie(STORAGE_KEY);
      setLoading(false);
    };

    const handleConcessionariasUpdated = () => {
      if (!isMountedRef.current) return;
      void refreshConcessionarias();
    };

    window.addEventListener('authTokenSaved', handleAuthTokenSaved);
    window.addEventListener('authTokenRemoved', handleAuthTokenRemoved);
    window.addEventListener(CONCESSIONARIAS_UPDATED_EVENT, handleConcessionariasUpdated);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('authTokenSaved', handleAuthTokenSaved);
      window.removeEventListener('authTokenRemoved', handleAuthTokenRemoved);
      window.removeEventListener(CONCESSIONARIAS_UPDATED_EVENT, handleConcessionariasUpdated);
    };
  }, [carregarConcessionarias, refreshConcessionarias]);

  return (
    <ConcessionariaContext.Provider
      value={{
        concessionariaSelecionada,
        concessionarias,
        loading,
        concessionariaChangeKey,
        setConcessionariaSelecionada,
        refreshConcessionarias,
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
