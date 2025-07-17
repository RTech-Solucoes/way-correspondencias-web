import { useState, useEffect, useCallback } from 'react';
import { apiClient } from './client';
import {
  Responsavel,
  Setor,
  Email,
  Obrigacao,
  Correspondencia,
  SincronizacaoStatus,
  PaginatedResponse,
  ListResponsaveisParams,
  ListEmailsParams,
  ListObrigacoesParams,
  CreateResponsavelRequest,
  UpdateResponsavelRequest,
  CreateSetorRequest,
  UpdateSetorRequest,
  CreateEmailRequest,
  UpdateEmailRequest,
  CreateObrigacaoRequest,
  UpdateObrigacaoRequest,
} from './types';

// Generic hook for API calls
export function useApiCall<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

// Responsáveis hooks
export function useResponsaveis(params?: ListResponsaveisParams) {
  return useApiCall(
    () => apiClient.listarResponsaveis(params),
    [params?.perfil, params?.nome_like, params?.page, params?.size]
  );
}

export function useResponsavel(id: number) {
  return useApiCall(
    () => apiClient.obterResponsavel(id),
    [id]
  );
}

export function useCreateResponsavel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: CreateResponsavelRequest) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.criarResponsavel(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar responsável';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}

export function useUpdateResponsavel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: UpdateResponsavelRequest) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.atualizarResponsavel(id, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar responsável';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}

// Setores hooks
export function useSetores() {
  return useApiCall(() => apiClient.listarSetores());
}

export function useSetor(id: number) {
  return useApiCall(
    () => apiClient.obterSetor(id),
    [id]
  );
}

export function useCreateSetor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: CreateSetorRequest) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.criarSetor(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar setor';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}

// Emails hooks
export function useEmails(params?: ListEmailsParams) {
  return useApiCall(
    () => apiClient.listarEmails(params),
    [params?.status, params?.responsavel]
  );
}

export function useEmail(id: number) {
  return useApiCall(
    () => apiClient.obterEmail(id),
    [id]
  );
}

export function useCreateEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: CreateEmailRequest) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.criarEmail(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar email';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}

export function useResponderEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const responder = async (id: number, resposta: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.responderEmail(id, { resposta });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao responder email';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { responder, loading, error };
}

// Obrigações hooks
export function useObrigacoes(params?: ListObrigacoesParams) {
  return useApiCall(
    () => apiClient.listarObrigacoes(params),
    [params?.status, params?.setor]
  );
}

export function useObrigacao(id: number) {
  return useApiCall(
    () => apiClient.obterObrigacao(id),
    [id]
  );
}

export function useCreateObrigacao() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: CreateObrigacaoRequest) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.criarObrigacao(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar obrigação';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}

export function useUpdateObrigacao() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: UpdateObrigacaoRequest) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.atualizarObrigacao(id, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar obrigação';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}

// Correspondências hooks
export function useCorrespondencias(obrigacaoId: number) {
  return useApiCall(
    () => apiClient.listarCorrespondencias(obrigacaoId),
    [obrigacaoId]
  );
}

export function useVincularCorrespondencias() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vincular = async (obrigacaoId: number, emailIds: number[]) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.vincularCorrespondencias(obrigacaoId, { emails: emailIds });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao vincular correspondências';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { vincular, loading, error };
}

// Sincronização hooks
export function useSincronizacaoStatus() {
  return useApiCall(() => apiClient.statusSincronizacao());
}

export function useSincronizarEmails() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sincronizar = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.sincronizarEmails();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao sincronizar emails';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { sincronizar, loading, error };
}

// SEI hooks
export function usePesquisarSEIInteressado() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pesquisar = async (nome: string, orgao?: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.pesquisarSEIInteressado({ nome, orgao });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao pesquisar no SEI';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { pesquisar, loading, error };
}