'use client';

import {useEffect, useState} from 'react';
import {
  ArrowLeftIcon,
  DownloadIcon,
  DotsThreeVerticalIcon,
  PaperclipIcon,
  TrashIcon,
  FileTextIcon
} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from '@/components/ui/dropdown-menu';
import {useToast} from '@/hooks/use-toast';
import SolicitacaoModal from '@/components/solicitacoes/SolicitacaoModal';
import {Solicitacao} from '@/types/solicitacoes/types';
import {v4 as uuidv4} from 'uuid';

interface EmailDetailProps {
  emailId: string;

  onBack(): void;
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

interface EmailDisplay {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  content: string;
  date: string;
  isStarred: boolean;
  attachments: any[];
}

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
                                      onBack
                                    }: EmailDetailProps) {
  const {toast} = useToast();
  const [email, setEmail] = useState<EmailDisplay | null>(null);
  const [showSolicitacaoModal, setShowSolicitacaoModal] = useState(false);

  useEffect(() => {
    // Find email in mock data
    const foundEmail = MOCK_EMAILS.find(e => e.id === emailId);
    if (foundEmail) {
      setEmail(foundEmail);
    }
  }, [emailId]);

  const handleCreateSolicitacao = () => {
    setShowSolicitacaoModal(true);
  };

  const handleSaveSolicitacao = (solicitacao: Solicitacao) => {
    toast({
      title: "Solicitação criada",
      description: "A solicitação foi criada com sucesso a partir do email.",
    });
    setShowSolicitacaoModal(false);
  };

  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Email não encontrado</p>
          <Button onClick={onBack} className="mt-4">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeftIcon className="h-4 w-4"/>
          </Button>
          <h2 className="text-lg font-semibold truncate">{email.subject}</h2>
        </div>

        <Button
          size="sm"
          onClick={handleCreateSolicitacao}
        >
          <FileTextIcon className="h-4 w-4 mr-2"/>
          Criar Solicitação
        </Button>
      </div>

      {/* Email content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Sender info */}
        <div className="flex items-start space-x-4 mb-6">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              {email.from.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-900">{email.from}</h3>
              <span className="text-sm text-gray-500">{formatDate(email.date)}</span>
            </div>
            <p className="text-sm text-gray-600">{email.fromEmail}</p>
          </div>
        </div>

        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Anexos ({email.attachments.length})
            </h4>
            <div className="space-y-2">
              {email.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <PaperclipIcon className="h-5 w-5 text-gray-400"/>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {attachment.nome}
                      </p>
                      <p className="text-xs text-gray-500">
                        {attachment.tamanho}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <DownloadIcon className="h-4 w-4"/>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email body */}
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
            {email.content}
          </div>
        </div>
      </div>

      {/* Solicitacao Modal */}
      {showSolicitacaoModal && (
        <SolicitacaoModal
          solicitacao={null}
          onClose={() => setShowSolicitacaoModal(false)}
          onSave={handleSaveSolicitacao}
          prefilledData={{
            dsAssunto: email.subject,
            dsDescricao: `Solicitação criada a partir do email de ${email.from}:\n\n${email.content.slice(0, 500)}...`
          }}
        />
      )}
    </div>
  );
}
