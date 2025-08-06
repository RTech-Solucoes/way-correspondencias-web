'use client';

import React, {useState, useCallback, useMemo, useEffect} from 'react';
import {Archive, Paperclip, RotateCw, Star, Trash2, Loader2, Mail} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {cn} from '@/lib/utils';
import {LayoutMode} from "@/components/email/EmailClient";
import {useEmails} from '@/lib/api/hooks';
import {Email as ApiEmail} from '@/lib/api/types';
import {useToast} from '@/hooks/use-toast';
import {apiClient} from '@/lib/api/client';

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
  labels: string[];
  content?: string;
}

// Mock emails data
const MOCK_EMAILS = [
  {
    id: 'mock-1',
    from: 'João Silva <joao@empresa.com>',
    subject: 'Relatório mensal de vendas - Novembro 2024',
    preview: 'Segue em anexo o relatório mensal de vendas referente ao mês de novembro. Os resultados mostram um crescimento de 15% em relação ao mês anterior...',
    date: new Date().toISOString(),
    isRead: false,
    isStarred: true,
    hasAttachment: true,
    labels: ['importante', 'trabalho'],
    content: `Prezado(a),

Segue em anexo o relatório mensal de vendas referente ao mês de novembro de 2024.

Os principais destaques são:
• Crescimento de 15% em relação ao mês anterior
• Aumento de 8% no número de novos clientes
• Melhoria na taxa de conversão para 12%

Principais produtos vendidos:
1. Produto A - R$ 45.000
2. Produto B - R$ 32.000  
3. Produto C - R$ 28.500

Gostaria de agendar uma reunião para discutir estes resultados e planejar as estratégias para dezembro.

Atenciosamente,
João Silva
Gerente Comercial
(11) 9999-8888`
  },
  {
    id: 'mock-2',
    from: 'Maria Santos <maria@consultoria.com>',
    subject: 'Proposta de consultoria em marketing digital',
    preview: 'Espero que esteja bem! Gostaria de apresentar nossa proposta de consultoria em marketing digital para sua empresa...',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isRead: false,
    isStarred: false,
    hasAttachment: true,
    labels: ['proposta'],
    content: `Olá!

Espero que esteja bem!

Gostaria de apresentar nossa proposta de consultoria em marketing digital para sua empresa.

Nossa experiência inclui:
• Gestão de redes sociais
• Campanhas no Google Ads
• SEO e marketing de conteúdo
• E-mail marketing
• Análise de métricas e ROI

Temos cases de sucesso com empresas do seu segmento e gostaríamos de agendar uma conversa para entender melhor suas necessidades.

Quando seria um bom momento para conversarmos?

Abraços,
Maria Santos
Consultora em Marketing Digital
maria@consultoria.com
(11) 8888-7777`
  },
  {
    id: 'mock-3',
    from: 'Carlos Oliveira <carlos@fornecedor.com>',
    subject: 'Confirmação do pedido #2024-1156',
    preview: 'Confirmamos o recebimento do seu pedido #2024-1156. Prazo de entrega estimado: 5 dias úteis...',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    labels: ['pedido'],
    content: `Prezado Cliente,

Confirmamos o recebimento do seu pedido #2024-1156.

Detalhes do pedido:
• Data do pedido: ${new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
• Valor total: R$ 2.850,00
• Prazo de entrega: 5 dias úteis
• Forma de pagamento: Boleto banceiro

Itens do pedido:
1. Item A - Qtd: 10 - R$ 150,00 cada
2. Item B - Qtd: 5 - R$ 300,00 cada

Você receberá o código de rastreamento assim que o pedido for despachado.

Em caso de dúvidas, entre em contato conosco.

Atenciosamente,
Carlos Oliveira
Departamento de Vendas
carlos@fornecedor.com
(11) 7777-6666`
  },
  {
    id: 'mock-4',
    from: 'Ana Costa <ana@juridico.com>',
    subject: 'Revisão do contrato de prestação de serviços',
    preview: 'Conforme solicitado, segue a revisão do contrato de prestação de serviços. Identifiquei alguns pontos que precisam de atenção...',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    isRead: true,
    isStarred: true,
    hasAttachment: true,
    labels: ['jurídico', 'urgente'],
    content: `Prezado(a),

Conforme solicitado, realizei a revisão do contrato de prestação de serviços.

Pontos que precisam de atenção:
1. Cláusula 5.2 - Prazo de pagamento
2. Cláusula 8.1 - Rescisão contratual  
3. Cláusula 12 - Foro de eleição

Recomendações:
• Incluir cláusula de reajuste anual
• Especificar melhor as penalidades por atraso
• Definir critérios objetivos para avaliação de performance

O documento revisado está em anexo com todas as sugestões destacadas.

Podemos agendar uma reunião para discutir estas alterações?

Cordialmente,
Ana Costa
Advogada
OAB/SP 123.456
ana@juridico.com
(11) 6666-5555`
  },
  {
    id: 'mock-5',
    from: 'Ricardo Ferreira <ricardo@ti.com>',
    subject: 'Manutenção programada do sistema - Sábado 09/12',
    preview: 'Informamos que será realizada manutenção programada no sistema no sábado, 09/12, das 02h às 06h...',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    labels: ['sistema', 'manutenção'],
    content: `Prezados usuários,

Informamos que será realizada manutenção programada no sistema no sábado, 09/12/2024, das 02h às 06h.

Durante este período:
• O sistema ficará indisponível
• Não será possível acessar dados
• Funcionalidades estarão offline

Melhorias que serão implementadas:
• Otimização da performance
• Correção de bugs reportados
• Atualização de segurança
• Nova funcionalidade de relatórios

Recomendamos que finalizem suas atividades até sexta-feira às 18h.

Em caso de emergência durante a manutenção, entrar em contato pelo telefone (11) 5555-4444.

Obrigado pela compreensão.

Equipe de TI
Ricardo Ferreira
Coordenador de Sistemas
ricardo@ti.com`
  }
];

// Helper function to format date
const formatDate = (dateString?: string): string => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  // Today
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
  }

  // Yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Ontem';
  }

  // This year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('pt-BR', {month: 'short', day: 'numeric'});
  }

  // Other years
  return date.toLocaleDateString('pt-BR', {year: 'numeric', month: 'short', day: 'numeric'});
};

interface SentEmail {
  id: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  content: string;
  date: string;
  from: string;
}

interface EmailListProps {
  folder: string;
  searchQuery: string;
  selectedEmail: string | null;
  onEmailSelect: (emailId: string) => void;
  layoutMode: LayoutMode;
  onLayoutChange: (mode: LayoutMode) => void;
  sentEmails?: SentEmail[];
  onUnreadCountChange?: (count: number) => void;
}

function EmailList({
                     folder,
                     searchQuery,
                     selectedEmail,
                     onEmailSelect,
                     layoutMode,
                     onLayoutChange,
                     sentEmails = [],
                     onUnreadCountChange
                   }: EmailListProps) {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [syncLoading, setSyncLoading] = useState(false);
  const {toast} = useToast();

  // Fetch emails from API
  const {data, error, loading, refetch} = useEmails({
    // We'll handle filtering on the client side for now
    // In a real app, you might want to pass these as API parameters
    // status: folder === 'inbox' ? 'NOVO' : undefined
  });

  // Function to sync emails before fetching
  const syncAndFetchEmails = async () => {
    try {
      setSyncLoading(true);

      // Call the sincronizar-emails endpoint first
      await apiClient.sincronizarEmails();

      // Then refetch the emails
      await refetch();

      toast({
        title: "Emails sincronizados",
        description: "Seus emails foram sincronizados com sucesso.",
      });
    } catch (err) {
      console.error('Error syncing emails:', err);
      toast({
        title: "Erro ao sincronizar emails",
        description: "Não foi possível sincronizar seus emails. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setSyncLoading(false);
    }
  };

  // Show error toast if API call fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar emails",
        description: "Não foi possível carregar os emails. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    syncAndFetchEmails().then(r => {
    })
  }, []);

  // Map API emails to the format expected by the component
  const apiEmails: Email[] = useMemo(() => {
    return data?.items?.map((apiEmail: ApiEmail) => ({
      id: apiEmail.id_email.toString(),
      from: apiEmail.remetente,
      subject: apiEmail.assunto,
      preview: apiEmail.conteudo,
      date: formatDate(apiEmail.prazo_resposta),
      isRead: apiEmail.tp_status !== 'NOVO',
      isStarred: false,
      hasAttachment: false,
      labels: [],
    })) || [];
  }, [data]);

  // Combine API emails with mock emails for inbox
  const emails: Email[] = useMemo(() => {
    if (folder === 'inbox') {
      return [...MOCK_EMAILS, ...apiEmails];
    }
    return apiEmails;
  }, [apiEmails, folder]);

  // Calculate and report unread emails count for inbox
  useEffect(() => {
    if (onUnreadCountChange && folder === 'inbox') {
      const allEmails = [...MOCK_EMAILS, ...apiEmails];
      const unreadCount = allEmails.filter(email => !email.isRead).length;
      const safeCount = Math.max(0, unreadCount);
      onUnreadCountChange(safeCount);
    }
  }, [apiEmails, onUnreadCountChange, folder]);

  // Convert sent emails to the Email format
  const sentEmailsFormatted: Email[] = useMemo(() => {
    return sentEmails.map(email => ({
      id: email.id,
      from: 'Você', // Since these are sent by the current user
      subject: email.subject,
      preview: email.content.replace(/<[^>]*>/g, ''), // Strip HTML tags for preview
      date: formatDate(email.date),
      isRead: true, // Sent emails are always read
      isStarred: false,
      hasAttachment: false,
      labels: [],
    }));
  }, [sentEmails]);

  // Filter emails based on search query and folder
  const filteredEmails = useMemo(() => {
    // For sent folder, use sent emails
    if (folder === 'sent') {
      return sentEmailsFormatted.filter(email => {
        if (searchQuery) {
          return email?.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            email?.preview?.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
      });
    }

    // For other folders, use API emails
    return emails.filter(email => {
      if (searchQuery) {
        return email?.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          email?.from?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          email?.preview?.toLowerCase().includes(searchQuery.toLowerCase());
      }

      switch (folder) {
        case 'inbox':
          return true;
        case 'starred':
          return email.isStarred;
        case 'drafts':
          return false; // API doesn't include drafts yet
        default:
          return true;
      }
    });
  }, [emails, sentEmailsFormatted, searchQuery, folder]);

  const toggleEmailSelection = useCallback((emailId: string) => {
    setSelectedEmails(prev =>
      prev.includes(emailId)
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  }, []);

  const selectAllEmails = useCallback(() => {
    setSelectedEmails(
      selectedEmails.length === filteredEmails.length
        ? []
        : filteredEmails.map(email => email.id)
    );
  }, [selectedEmails.length, filteredEmails]);

  return (
    <div
      className={`${selectedEmail && layoutMode === 'split' ? 'w-96' : 'flex-1'} bg-white ${selectedEmail && layoutMode === 'split' ? 'border-r border-gray-200' : ''} flex flex-col`}>
      {/* Email Actions */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between min-h-[2rem]">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectedEmails.length === filteredEmails.length && filteredEmails.length > 0}
              onCheckedChange={selectAllEmails}
              disabled={loading || filteredEmails.length === 0}
            />
            <span className="text-sm text-gray-600 whitespace-nowrap">
              {loading ? (
                "Carregando..."
              ) : selectedEmails.length > 0 ? (
                `${selectedEmails.length} selecionados`
              ) : (
                `${filteredEmails.length} emails`
              )}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            {selectedEmails.length > 0 ? (
              <>
                <Button variant="ghost" size="sm">
                  <Archive className="h-4 w-4"/>
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4"/>
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => syncAndFetchEmails()}
                disabled={loading || syncLoading}
              >
                {loading || syncLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin"/>
                ) : (
                  <RotateCw className="h-4 w-4"/>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className="flex flex-col-reverse overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4"/>
            <p className="text-gray-500">Carregando emails...</p>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <Mail className="h-12 w-12 text-gray-300 mb-4"/>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum email encontrado</h3>
            <p className="text-gray-500 text-center">
              {searchQuery ?
                "Não encontramos emails correspondentes à sua pesquisa." :
                "Não há emails nesta pasta no momento."}
            </p>
          </div>
        ) : (
          filteredEmails.map((email) => (
            <div
              key={email.id}
              className={cn(
                "p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors",
                selectedEmail === email.id && "bg-blue-100",
                !email.isRead && "bg-blue-50/30"
              )}
              onClick={() => {
                if (selectedEmail === email.id) {
                  onEmailSelect(''); // Close if already selected
                } else {
                  onEmailSelect(email.id);
                }
              }}
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={selectedEmails.includes(email.id)}
                  onCheckedChange={() => toggleEmailSelection(email.id)}
                  onClick={(e) => e.stopPropagation()}
                />

                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-5 w-5 text-gray-400 hover:text-yellow-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Toggle star logic here
                  }}
                >
                  <Star className={cn("h-4 w-4", email.isStarred && "fill-yellow-500 text-yellow-500")}/>
                </Button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className={cn(
                        "text-sm truncate",
                        "font-semibold text-gray-700"
                      )}>
                        {email.from}
                      </span>
                      {email.hasAttachment && (
                        <Paperclip className="h-3 w-3 text-gray-400"/>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{email.date}</span>
                  </div>

                  <h3 className={cn(
                    "text-sm mb-1 truncate",
                    "font-bold text-gray-900"
                  )}>
                    {email.subject}
                  </h3>

                  <p className="text-xs text-gray-500 line-clamp-2">
                    {email.preview}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Export the memoized component to prevent unnecessary rerenders
export default React.memo(EmailList);