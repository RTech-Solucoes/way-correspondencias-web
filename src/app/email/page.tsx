'use client';

import {useState, useEffect} from 'react';
import {
  FunnelSimpleIcon,
  TrayIcon,
  EnvelopeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PaperPlaneRightIcon
} from '@phosphor-icons/react';
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
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useToast} from '@/hooks/use-toast';
import EmailList from '../../components/email/EmailList';
import EmailComposer from '../../components/email/EmailComposer';
import EmailDetail from '../../components/email/EmailDetail';
import FolderManager from '../../components/email/FolderManager';

const EMAIL_FOLDERS = [
  { id: 'inbox', icon: TrayIcon, label: 'Caixa de Entrada', count: 0 },
  { id: 'sent', icon: PaperPlaneRightIcon, label: 'Enviados', count: 0 },
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

export default function EmailPage() {
  const { toast } = useToast();
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFolderManager, setShowFolderManager] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Filter states for emails
  const [emailFilters, setEmailFilters] = useState({
    isRead: '',
    hasAttachment: '',
    dateFrom: '',
    dateTo: '',
    sender: ''
  });

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
    <div className="flex flex-col min-h-0 flex-1">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <EnvelopeIcon className="h-7 w-7 mr-3"/>
            Email
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
            <Input
              placeholder="Pesquisar emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          <Button
            variant="secondary"
            className="h-10 px-4"
            onClick={() => setShowFilterModal(true)}
          >
            <FunnelSimpleIcon className="h-4 w-4 mr-2"/>
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
            <folder.icon className="h-4 w-4"/>
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
                    folder.id === 'inbox' ? {...folder, count} : folder
                  );
                }

                return prev.map(folder =>
                  folder.id === 'inbox'
                    ? {...folder, count}
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
                      const newMessages = {...emailConfig.defaultMessages};
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
                      const newMessages = {...emailConfig.defaultMessages};
                      newMessages[key] = e.target.value;
                      setEmailConfig({
                        ...emailConfig,
                        defaultMessages: newMessages
                      });
                    }}
                    placeholder="Conteúdo da mensagem"
                    className="min-h-[80px]"
                  />
                  <div className="flex-grow-1 h-px bg-gray-200 my-2"/>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const newMessages = {...emailConfig.defaultMessages};
                  newMessages[`Nova Mensagem ${Object.keys(newMessages).length + 1}`] = '';
                  setEmailConfig({
                    ...emailConfig,
                    defaultMessages: newMessages
                  });
                }}
                className="mt-2 flex-grow-1"
              >
                <PlusIcon className="h-4 w-4 mr-2"/>
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

      {/* Email Filter Modal */}
      {showFilterModal && (
        <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filtrar Emails</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="sender">Remetente</Label>
                <Input
                  id="sender"
                  value={emailFilters.sender}
                  onChange={(e) => setEmailFilters({...emailFilters, sender: e.target.value})}
                  placeholder="Filtrar por remetente"
                />
              </div>
              <div>
                <Label htmlFor="isRead">Status de Leitura</Label>
                <Select
                  value={emailFilters.isRead}
                  onValueChange={(value) => setEmailFilters({...emailFilters, isRead: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="read">Lidos</SelectItem>
                    <SelectItem value="unread">Não Lidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="hasAttachment">Anexos</Label>
                <Select
                  value={emailFilters.hasAttachment}
                  onValueChange={(value) => setEmailFilters({...emailFilters, hasAttachment: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione anexos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Com Anexo</SelectItem>
                    <SelectItem value="false">Sem Anexo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateFrom">Data Início</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={emailFilters.dateFrom}
                    onChange={(e) => setEmailFilters({...emailFilters, dateFrom: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo">Data Fim</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={emailFilters.dateTo}
                    onChange={(e) => setEmailFilters({...emailFilters, dateTo: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setEmailFilters({
                    isRead: '',
                    hasAttachment: '',
                    dateFrom: '',
                    dateTo: '',
                    sender: ''
                  });
                  setShowFilterModal(false);
                }}
              >
                Limpar Filtros
              </Button>
              <Button onClick={() => setShowFilterModal(false)}>
                Aplicar Filtros
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}