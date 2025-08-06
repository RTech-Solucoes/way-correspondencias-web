'use client';

import {useState, useEffect} from 'react';
import {
  Archive,
  File,
  Filter,
  Folder,
  Inbox,
  Mail,
  OctagonAlert, PanelLeftClose, PanelLeftOpen,
  Plus, RotateCw,
  Search,
  Send,
  Settings,
  Cog
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import EmailList from './EmailList';
import EmailComposer from './EmailComposer';
import EmailDetail from './EmailDetail';
import FolderManager from './FolderManager';
import {cn} from "@/lib/utils";

const EMAIL_FOLDERS = [
  { id: 'inbox', icon: Inbox, label: 'Caixa de Entrada', count: 0 },
  { id: 'sent', icon: Send, label: 'Enviados', count: 0 },
];

// Mock emails data
const MOCK_EMAILS = [
  {
    id: '1',
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
    id: '2',
    from: 'Maria Santos <maria@consultoria.com>',
    subject: 'Proposta de consultoria em marketing digital',
    preview: 'Espero que esteja bem! Gostaria de apresentar nossa proposta de consultoria em marketing digital para sua empresa...',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
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
    id: '3',
    from: 'Carlos Oliveira <carlos@fornecedor.com>',
    subject: 'Confirmação do pedido #2024-1156',
    preview: 'Confirmamos o recebimento do seu pedido #2024-1156. Prazo de entrega estimado: 5 dias úteis...',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isRead: true,
    hasAttachment: false,
    labels: ['pedido'],
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
(11) 7777-6666`
  },
  {
    id: '4',
    from: 'Ana Costa <ana@juridico.com>',
    subject: 'Revisão do contrato de prestação de serviços',
    preview: 'Conforme solicitado, segue a revisão do contrato de prestação de serviços. Identifiquei alguns pontos que precisam de atenção...',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
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
    id: '5',
    from: 'Ricardo Ferreira <ricardo@ti.com>',
    subject: 'Manutenção programada do sistema - Sábado 09/12',
    preview: 'Informamos que será realizada manutenção programada no sistema no sábado, 09/12, das 02h às 06h...',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
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

interface EmailConfig {
  defaultMessages: {
    [key: string]: string;
  };
  defaultFooter: string;
}

export default function EmailClient() {
  const { toast } = useToast();
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFolderManager, setShowFolderManager] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [emailConfig, setEmailConfig] = useState<EmailConfig>(() => {
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem('emailConfig');
      return savedConfig ? JSON.parse(savedConfig) : {
        defaultMessages: {
          'Saudação': 'Olá,\n\nEspero que esteja bem.',
          'Agradecimento': 'Obrigado pelo seu email.\n\nAgradeço o seu contato.',
          'Despedida': 'Atenciosamente,\n\nEquipe de Suporte'
        },
        defaultFooter: 'Atenciosamente,\n\nSeu Nome\nSeu Cargo\nSeu Telefone'
      };
    }
    return {
      defaultMessages: {
        'Saudação': 'Olá,\n\nEspero que esteja bem.',
        'Agradecimento': 'Obrigado pelo seu email.\n\nAgradeço o seu contato.',
        'Despedida': 'Atenciosamente,\n\nEquipe de Suporte'
      },
      defaultFooter: 'Atenciosamente,\n\nSeu Nome\nSeu Cargo\nSeu Telefone'
    };
  });
  const [sentEmails, setSentEmails] = useState<SentEmail[]>(() => {
    if (typeof window !== 'undefined') {
      const savedEmails = localStorage.getItem('sentEmails');
      return savedEmails ? JSON.parse(savedEmails) : [];
    }
    return [];
  });

  const [folders, setFolders] = useState(() => {
    const initialFolders = [...EMAIL_FOLDERS];

    if (typeof window !== 'undefined') {
      const savedEmails = localStorage.getItem('sentEmails');
      const sentEmailsArray = savedEmails ? JSON.parse(savedEmails) : [];

      const sentFolder = initialFolders.find(folder => folder.id === 'sent');
      if (sentFolder) {
        sentFolder.count = sentEmailsArray.length;
      }
    }
    
    return initialFolders;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sentEmails', JSON.stringify(sentEmails));
    }
  }, [sentEmails]);

  const addSentEmail = (email: Omit<SentEmail, 'id' | 'from'>) => {
    const newEmail: SentEmail = {
      ...email,
      id: Date.now().toString(),
      from: 'voce@example.com',
    };
    
    setSentEmails(prev => [newEmail, ...prev]);

    setFolders(prev => 
      prev.map(folder => 
        folder.id === 'sent' 
          ? { ...folder, count: folder.count + 1 } 
          : folder
      )
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Mail className="h-7 w-7 mr-3" />
            Email
          </h1>
          <div className="flex space-x-2">
            <Button 
              onClick={() => setShowConfigDialog(true)} 
              variant="secondary"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
            <Button onClick={() => setShowComposer(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Escrever
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          <Button variant="secondary" className="h-10 px-4">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-gray-200 p-4">
        {folders.map((folder) => (
          <Button
            key={folder.id}
            variant={activeFolder === folder.id ? "default" : "ghost"}
            className="flex items-center gap-2 h-10 px-4"
            onClick={() => setActiveFolder(folder.id)}
          >
            <folder.icon className="h-4 w-4" />
            <span>{folder.label}</span>
            {folder.count > 0 && (
              <Badge variant="secondary" className="ml-1">
                {folder.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Show email list when no email is selected, or email detail when one is selected */}
        {!selectedEmail ? (
          <EmailList
            folder={activeFolder}
            searchQuery={searchQuery}
            selectedEmail={selectedEmail || null}
            onEmailSelect={setSelectedEmail}
            sentEmails={sentEmails}
            onUnreadCountChange={(count) => {
              setFolders(prev => {
                if (!prev || !Array.isArray(prev)) {
                  return EMAIL_FOLDERS.map(folder =>
                    folder.id === 'inbox' ? { ...folder, count } : folder
                  );
                }

                return prev.map(folder =>
                  folder.id === 'inbox'
                    ? { ...folder, count }
                    : folder
                );
              });
            }}
          />
        ) : (
          <EmailDetail
            emailId={selectedEmail}
            onClose={() => setSelectedEmail('')}
            onSend={addSentEmail}
            emailConfig={emailConfig}
          />
        )}
      </div>

      {showComposer && (
        <EmailComposer 
          onClose={() => setShowComposer(false)} 
          onSend={addSentEmail}
          emailConfig={emailConfig}
        />
      )}

      {showFolderManager && (
        <FolderManager
          folders={folders}
          onClose={() => setShowFolderManager(false)}
          onSave={setFolders}
        />
      )}

      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="flex flex-col sm:max-w-[600px] max-h-[95vh]">
          <DialogHeader>
            <DialogTitle>Configurações de Email</DialogTitle>
            <DialogDescription>
              Configure mensagens padrão e assinatura para seus emails.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4 max-h-full overflow-auto">
            <div className="space-y-2">
              <Label htmlFor="defaultFooter" className="font-medium">Assinatura Padrão</Label>
              <Textarea
                id="defaultFooter"
                value={emailConfig.defaultFooter}
                onChange={(e) => setEmailConfig({
                  ...emailConfig,
                  defaultFooter: e.target.value
                })}
                placeholder="Digite sua assinatura padrão..."
                className="min-h-[100px]"
              />
              <p className="text-sm text-gray-500">
                Esta assinatura será adicionada ao final dos seus emails.
              </p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Label className="font-medium">Mensagens Padrão</Label>
              <p className="text-sm text-gray-500 mb-2">
                Configure mensagens padrão que podem ser rapidamente inseridas nos seus emails.
              </p>
              
              {Object.entries(emailConfig.defaultMessages).map(([key, value], index) => (
                <div key={index} className="grid grid-rows-[1fr,3fr] gap-2 mb-3">
                  <Input
                    value={key}
                    onChange={(e) => {
                      const newMessages = { ...emailConfig.defaultMessages };
                      const oldValue = newMessages[key];
                      delete newMessages[key];
                      newMessages[e.target.value] = oldValue;
                      setEmailConfig({
                        ...emailConfig,
                        defaultMessages: newMessages
                      });
                    }}
                    placeholder="Nome da mensagem"
                  />
                  <Textarea
                    value={value}
                    onChange={(e) => {
                      const newMessages = { ...emailConfig.defaultMessages };
                      newMessages[key] = e.target.value;
                      setEmailConfig({
                        ...emailConfig,
                        defaultMessages: newMessages
                      });
                    }}
                    placeholder="Conteúdo da mensagem"
                    className="min-h-[80px]"
                  />
                  <div className="flex-grow-1 h-px bg-gray-200 my-2" />
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const newMessages = { ...emailConfig.defaultMessages };
                  newMessages[`Nova Mensagem ${Object.keys(newMessages).length + 1}`] = '';
                  setEmailConfig({
                    ...emailConfig,
                    defaultMessages: newMessages
                  });
                }}
                className="mt-2 flex-grow-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Mensagem
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfigDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('emailConfig', JSON.stringify(emailConfig));
                }
                setShowConfigDialog(false);
                
                toast({
                  title: "Configurações salvas",
                  description: "Suas configurações de email foram salvas com sucesso.",
                });
              }}
            >
              Salvar Configurações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
