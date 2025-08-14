'use client';

import {useEffect, useState} from 'react';
import {ArrowLeftIcon, DownloadIcon, DotsThreeVerticalIcon, PaperclipIcon, TrashIcon, FileTextIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from '@/components/ui/dropdown-menu';
import {useToast} from '@/hooks/use-toast';
import SolicitacaoModal from '@/components/solicitacoes/SolicitacaoModal';
import {Solicitacao} from '@/types/solicitacoes/types';
import { v4 as uuidv4 } from 'uuid';
import {Anexo} from "@/api/email/types";
import {EmailDisplay, SentEmail} from "@/types/email/types";

interface EmailDetailProps {
  emailId: string;
  onClose(): void;
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return '';

  const date = new Date(dateString);

  return date.toLocaleDateString('pt-BR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const MOCK_EMAILS: EmailDisplay[] = [
  {
    id: 'mock-1',
    from: 'João Silva',
    fromEmail: 'joao@empresa.com',
    subject: 'Relatório mensal de vendas - Novembro 2024',
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
(11) 9999-8888`,
    date: new Date().toISOString(),
    isStarred: true,
    attachments: []
  },
  {
    id: 'mock-2',
    from: 'Maria Santos',
    fromEmail: 'maria@consultoria.com',
    subject: 'Proposta de consultoria em marketing digital',
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
(11) 8888-7777`,
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isStarred: false,
    attachments: []
  },
  {
    id: 'mock-3',
    from: 'Carlos Oliveira',
    fromEmail: 'carlos@fornecedor.com',
    subject: 'Confirmação do pedido #2024-1156',
    content: `Prezado Cliente,

Confirmamos o recebimento do seu pedido #2024-1156.

Detalhes do pedido:
• Data do pedido: ${new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
• Valor total: R$ 2.850,00
• Prazo de entrega: 5 dias úteis
• Forma de pagamento: Boleto bancário

Itens do pedido:
1. Item A - Qtd: 10 - R$ 150,00 cada
2. Item B - Qtd: 5 - R$ 300,00 cada

Você receberá o código de rastreamento assim que o pedido for despachado.

Em caso de dúvidas, entre em contato conosco.

Atenciosamente,
Carlos Oliveira
Departamento de Vendas
carlos@fornecedor.com
(11) 7777-6666`,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isStarred: false,
    attachments: []
  },
  {
    id: 'mock-4',
    from: 'Ana Costa',
    fromEmail: 'ana@juridico.com',
    subject: 'Revisão do contrato de prestação de serviços',
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
(11) 6666-5555`,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isStarred: true,
    attachments: []
  },
  {
    id: 'mock-5',
    from: 'Ricardo Ferreira',
    fromEmail: 'ricardo@ti.com',
    subject: 'Manutenção programada do sistema - Sábado 09/12',
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
ricardo@ti.com`,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isStarred: false,
    attachments: []
  }
];

export default function EmailDetail({
  emailId,
  onClose
}: EmailDetailProps) {
  const { toast } = useToast();
  const [sentEmail, setSentEmail] = useState<SentEmail | null>(null);
  const [isSentEmail, setIsSentEmail] = useState(false);
  const [mockEmail, setMockEmail] = useState<EmailDisplay | null>(null);
  const [showSolicitacaoModal, setShowSolicitacaoModal] = useState(false);
  const [newSolicitacao, setNewSolicitacao] = useState<Solicitacao | null>(null);

  useEffect(() => {
    const foundMockEmail = MOCK_EMAILS.find(email => email.id === emailId);
    if (foundMockEmail) {
      setMockEmail(foundMockEmail);
      return;
    }

    if (typeof window !== 'undefined') {
      const savedEmails = localStorage.getItem('sentEmails');
      if (savedEmails) {
        const sentEmails = JSON.parse(savedEmails) as SentEmail[];
        const foundEmail = sentEmails.find((email) => email.id === emailId);
        if (foundEmail) {
          setSentEmail(foundEmail);
          setIsSentEmail(true);
        }
      }
    }
  }, [emailId]);

  const createSolicitacaoFromEmail = (email: EmailDisplay) => {
    const today = new Date().toISOString().split('T')[0];
    const newSolicitacao: Solicitacao = {
      idSolicitacao: uuidv4(),
      cdSolicitante: [email.fromEmail],
      dsAssunto: `Solicitação baseada em email: ${email.subject}`,
      cdIdentificacao: `EMAIL-${email.id}`,
      dsDescricao: `Este email requer atenção:\n\nDe: ${email.from} <${email.fromEmail}>\nData: ${email.date}\nAssunto: ${email.subject}\n\nConteúdo do email:\n${email.content.replace(/<[^>]*>/g, '')}`,
      dsAnexos: email.attachments.map(attachment => attachment?.ds_nome_anexo || 'Anexo'),
      status: 'pendente',
      dtCriacao: today,
      idResponsavel: undefined
    };
    return newSolicitacao;
  };

  const email: EmailDisplay | null = (() => {
    if (isSentEmail && sentEmail) {
      return {
        id: sentEmail.id,
        from: 'você',
        fromEmail: sentEmail.from || 'voce@example.com',
        subject: sentEmail.subject,
        content: sentEmail.content,
        date: formatDate(sentEmail.date) || formatDate(new Date().toISOString()),
        attachments: [] as Anexo[],
        isStarred: false
      };
    }
    return mockEmail;
  })();

  if (!email) {
    return (
      <div className="flex-1 bg-white flex flex-col justify-center items-center h-full">
        <p className="text-gray-500">Email não encontrado</p>
        <Button variant="ghost" onClick={onClose} className="mt-4">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white flex flex-col overflow-y-auto h-full max-h-full">
      {/* Email Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <DotsThreeVerticalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Marcar como não lido</DropdownMenuItem>
                <DropdownMenuItem>Adicionar etiqueta</DropdownMenuItem>
                <DropdownMenuItem>Imprimir</DropdownMenuItem>
                <DropdownMenuItem>Reportar spam</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{email.subject}</h1>

        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>MS</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-gray-900">{email.from}</div>
              <div className="text-gray-500">{email.fromEmail}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: email.content }}
        />

        {email.attachments.length > 0 && (
          <div className="mt-8 p-4 bg-gray-50 rounded-3xl">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <PaperclipIcon className="h-4 w-4 mr-2" />
              Anexos ({email.attachments.length})
            </h3>
            <div className="space-y-2">
              {email.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <PaperclipIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{attachment?.ds_nome_anexo || "Arquivo"}</div>
                      <div className="text-xs text-gray-500">{attachment?.nm_tamanho_anexo || "20MB"}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 mt-auto">
        <div className="flex items-center gap-2 w-full">
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              const solicitation = createSolicitacaoFromEmail(email);
              setNewSolicitacao(solicitation);
              setShowSolicitacaoModal(true);
            }}
          >
            <FileTextIcon className="h-4 w-4 mr-2" />
            Criar Solicitação
          </Button>
        </div>
      </div>

      {showSolicitacaoModal && (
        <SolicitacaoModal
          solicitacao={newSolicitacao}
          onClose={() => {
            setShowSolicitacaoModal(false);
            setNewSolicitacao(null);
          }}
          onSave={() => {
            toast({
              title: "Solicitação criada",
              description: "A solicitação foi criada com sucesso.",
            });
            setShowSolicitacaoModal(false);
            setNewSolicitacao(null);
          }}
        />
      )}
    </div>
  );
}
