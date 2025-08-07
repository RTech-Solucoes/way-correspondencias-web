import {useCallback, useEffect, useState} from 'react';
import {apiClient} from './client';
import {
  CreateEmailRequest,
  CreateObrigacaoRequest,
  CreateResponsavelRequest,
  CreateSetorRequest,
  ListEmailsParams,
  ListObrigacoesParams,
  ListResponsaveisParams,
  RegisterRequest,
  UpdateObrigacaoRequest,
  UpdateResponsavelRequest,
} from './types';

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
      return await apiClient.criarResponsavel(data);
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
      return await apiClient.atualizarResponsavel(id, data);
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
      return await apiClient.criarSetor(data);
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
      return await apiClient.criarEmail(data);
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
      return await apiClient.responderEmail(id, {resposta});
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
      return await apiClient.criarObrigacao(data);
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
      return await apiClient.atualizarObrigacao(id, data);
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
      return await apiClient.vincularCorrespondencias(obrigacaoId, {emails: emailIds});
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
      return await apiClient.sincronizarEmails();
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

export function usePesquisarSEIInteressado() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pesquisar = async (nome: string, orgao?: number) => {
    try {
      setLoading(true);
      setError(null);
      return await apiClient.pesquisarSEIInteressado({nome, orgao});
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

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.login({ email, password });
      
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (data: RegisterRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await apiClient.register(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao registrar usuário';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
}