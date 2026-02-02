import { QueryClient } from '@tanstack/react-query';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,      // Dados nunca ficam stale (ideal com SSR)
        gcTime: 1000 * 60 * 10,   // Mantém cache por 10 min
        retry: 0,                // Não tenta novamente (resposta imediata)
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,   // Usa direto o cache hidratado
      },
    },
  });
}
