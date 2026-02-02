import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { emailClient } from '@/api/email/client';
import { PagedResponse, EmailResponse } from '@/api/email/types';

interface EmailQueryParams {
  filtro?: string;
  dsRemetente?: string;
  dsDestinatario?: string;
  dtRecebimentoInicio?: string;
  dtRecebimentoFim?: string;
  page: number;
  size: number;
}

// Query Keys
export const emailsKeys = {
  all: ['emails'] as const,
  lists: () => [...emailsKeys.all, 'list'] as const,
  list: (filters: EmailQueryParams) => [...emailsKeys.lists(), filters] as const,
  detail: (id: string) => [...emailsKeys.all, 'detail', id] as const,
};

// Hook para buscar emails
export function useEmailsQuery(params: EmailQueryParams) {
  return useQuery<PagedResponse<EmailResponse>>({
    queryKey: emailsKeys.list(params),
    queryFn: async (): Promise<PagedResponse<EmailResponse>> => {
      try {
        // Timeout de 30 segundos
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Tempo limite excedido')), 30000);
        });
        
        const response = await Promise.race([
          emailClient.buscarPorFiltro(params),
          timeoutPromise
        ]);
        
        // Validação da resposta
        if (!response || typeof response !== 'object') {
          throw new Error('Resposta inválida da API');
        }
        
        // Se não tem content, retorna estrutura vazia válida
        if (!('content' in response) || !response.content) {
          return {
            content: [],
            totalPages: 0,
            totalElements: 0,
            size: params.size,
            number: params.page,
            numberOfElements: 0,
            first: true,
            last: true,
            empty: true,
          };
        }
        
        return response as PagedResponse<EmailResponse>;
      } catch (error) {
        console.error('Erro ao buscar emails:', error);
        
        const errorMessage = error instanceof Error && error.message === 'Tempo limite excedido'
          ? 'A busca demorou muito. Tente novamente ou refine seus filtros.'
          : 'Erro ao carregar emails. Verifique sua conexão.';
        
        toast.error(errorMessage);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    placeholderData: (previousData) => previousData, // Mantém dados anteriores durante refetch
    retry: 2, // Tenta 2 vezes antes de falhar
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
