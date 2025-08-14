'use client';

import React, {useCallback, useMemo, useState} from 'react';
import {ArrowClockwiseIcon, EnvelopeIcon, PaperclipIcon, SpinnerIcon, TrashIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {cn} from '@/utils/utils';
import {useToast} from '@/hooks/use-toast';

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  hasAttachment: boolean;
  labels: string[];
  content?: string;
}

const MOCK_EMAILS = [
  {
    id: 'mock-1',
    from: 'João Silva <joao@empresa.com>',
    subject: 'Relatório mensal de vendas - Novembro 2024',
    preview: 'Segue em anexo o relatório mensal de vendas referente ao mês de novembro. Os resultados mostram um crescimento de 15% em relação ao mês anterior...',
    date: new Date().toISOString(),
    isRead: false,
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
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
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
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
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
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
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
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
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

const formatDate = (dateString?: string): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return '';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.warn('Invalid date:', dateString);
    return '';
  }
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
  sentEmails?: SentEmail[];
  onUnreadCountChange?: (count: number) => void;
}

const EmailItem = React.memo<{
  email: Email;
  isSelected: boolean;
  isChecked: boolean;
  onSelect(): void;
  onToggleCheck(): void;
}>(({ email, isSelected, isChecked, onSelect, onToggleCheck }) => {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onSelect();
  }, [onSelect]);

  const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleCheck();
  }, [onToggleCheck]);

  return (
    <div
      className={cn(
        "p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors",
        isSelected && "bg-blue-100",
        !email.isRead && "bg-blue-50/30"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <Checkbox
          checked={isChecked}
          onCheckedChange={onToggleCheck}
          onClick={handleCheckboxClick}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm truncate font-semibold text-gray-700">
                {email.from}
              </span>
              {email.hasAttachment && (
                <PaperclipIcon className="h-3 w-3 text-gray-400"/>
              )}
            </div>
            <span className="text-xs text-gray-500">{email.date}</span>
          </div>

          <h3 className="text-sm mb-1 truncate font-bold text-gray-900">
            {email.subject}
          </h3>

          <p className="text-xs text-gray-500 line-clamp-2">
            {email.preview}
          </p>
        </div>
      </div>
    </div>
  );
});

EmailItem.displayName = 'EmailItem';

function EmailList({
  folder,
  searchQuery,
  selectedEmail,
  onEmailSelect,
  sentEmails = [],
  onUnreadCountChange
}: EmailListProps) {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [syncLoading, setSyncLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const {toast} = useToast();

  const formattedMockEmails = useMemo(() => {
    return MOCK_EMAILS.map(email => ({
      ...email,
      date: formatDate(email.date)
    }));
  }, []);

  const toggleEmailSelection = useCallback((emailId: string) => {
    setSelectedEmails(prev => {
      const newSelection = prev.includes(emailId)
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId];
      return newSelection;
    });
  }, []);

  const handleEmailSelect = useCallback((emailId: string) => {
    if (selectedEmail === emailId) {
      onEmailSelect('');
    } else {
      onEmailSelect(emailId);
    }
  }, [selectedEmail, onEmailSelect]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Email Actions */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between min-h-[2rem]">
          <div className="flex items-center space-x-1">
            {selectedEmails.length > 0 ? (
              <Button variant="ghost" size="sm">
                <TrashIcon className="h-4 w-4"/>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {}}
                disabled={loading || syncLoading}
              >
                {loading || syncLoading ? (
                  <SpinnerIcon className="h-4 w-4 animate-spin"/>
                ) : (
                  <ArrowClockwiseIcon className="h-4 w-4"/>
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
            <SpinnerIcon className="h-8 w-8 text-blue-500 animate-spin mb-4"/>
            <p className="text-gray-500">Carregando emails...</p>
          </div>
        ) : formattedMockEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <EnvelopeIcon className="h-12 w-12 text-gray-300 mb-4"/>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum email encontrado</h3>
            <p className="text-gray-500 text-center">
              {searchQuery ?
                "Não encontramos emails correspondentes à sua pesquisa." :
                "Não há emails nesta pasta no momento."}
            </p>
          </div>
        ) : (
          formattedMockEmails.map((email) => (
            <EmailItem
              key={email.id}
              email={email}
              isSelected={selectedEmail === email.id}
              isChecked={selectedEmails.includes(email.id)}
              onSelect={() => handleEmailSelect(email.id)}
              onToggleCheck={() => toggleEmailSelection(email.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default EmailList;