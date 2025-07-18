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
  Star,
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
  // { id: 'drafts', icon: File, label: 'Rascunhos', count: 0 },
  // { id: 'archive', icon: Archive, label: 'Arquivo', count: 0 },
  // { id: 'starred', icon: Star, label: 'Favoritos', count: 0 },
  // { id: 'spam', icon: OctagonAlert, label: 'Spam', count: 0 },
];

export type LayoutMode = 'split' | 'full'

// Interface for sent emails
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

// Interface for email configuration
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
  const [showFolders, setShowFolders] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFolderManager, setShowFolderManager] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('full');
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [emailConfig, setEmailConfig] = useState<EmailConfig>(() => {
    // Load email configuration from localStorage if available
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
    // Load sent emails from localStorage if available
    if (typeof window !== 'undefined') {
      const savedEmails = localStorage.getItem('sentEmails');
      return savedEmails ? JSON.parse(savedEmails) : [];
    }
    return [];
  });
  
  // Initialize folders with correct counts
  const [folders, setFolders] = useState(() => {
    const initialFolders = [...EMAIL_FOLDERS];
    
    // Set sent count based on loaded sent emails
    if (typeof window !== 'undefined') {
      const savedEmails = localStorage.getItem('sentEmails');
      const sentEmailsArray = savedEmails ? JSON.parse(savedEmails) : [];
      
      // Update sent folder count
      const sentFolder = initialFolders.find(folder => folder.id === 'sent');
      if (sentFolder) {
        sentFolder.count = sentEmailsArray.length;
      }
    }
    
    return initialFolders;
  });

  // Save sent emails to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sentEmails', JSON.stringify(sentEmails));
    }
  }, [sentEmails]);

  // Function to add a new sent email
  const addSentEmail = (email: Omit<SentEmail, 'id' | 'from'>) => {
    const newEmail: SentEmail = {
      ...email,
      id: Date.now().toString(), // Generate a unique ID
      from: 'voce@example.com', // Use the current user's email
    };
    
    setSentEmails(prev => [newEmail, ...prev]);
    
    // Update the count in the folders
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
      {/* Email Header */}
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

      <div className="flex flex-1 overflow-hidden">
        {/* Email Folders */}
        <div 
          className={cn(
            "flex flex-col justify-between h-full bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0 min-w-[80px]",
            "transform transition-all duration-300 ease-in-out",
            showFolders ? "w-64" : "w-[80px]"
          )}
          onMouseEnter={() => setShowFolders(true)}
          onMouseLeave={() => setShowFolders(false)}
        >
          <div className="space-y-2 p-4">
            {folders.map((folder) => (
              <Button
                key={folder.id}
                variant={activeFolder === folder.id ? "default" : "ghost"}
                className="flex gap-3 w-full justify-start text-left h-10 px-4 overflow-x-hidden"
                disabled={false}
                onClick={() => setActiveFolder(folder.id)}
              >
                <div className="relative">
                  <folder.icon className="h-4 w-4 flex-shrink-0" />
                </div>
                {showFolders && (
                  <>
                    <span className="flex-1 truncate">{folder.label}</span>
                    {folder.count > 0 && (
                      <Badge variant="secondary" className="ml-auto hover:bg-gray-100">
                        {folder.count}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            ))}
            <Button
              variant="ghost"
              onClick={() => setShowFolderManager(true)}
              className="flex gap-3 w-full justify-start text-left h-10 px-4"
            >
              <Settings className="h-4 w-4"/>
              {showFolders && <span className="flex-1 truncate">Gerenciar pastas</span>}
            </Button>
          </div>
          {/* Toggle button removed as hover functionality now handles expansion */}
        </div>

        {/* Email List */}
        <div className={`flex ${selectedEmail && layoutMode === 'full' ? 'hidden' : 'flex-1'} ${!selectedEmail ? 'flex-1' : ''}`}>
          <EmailList
            folder={activeFolder}
            searchQuery={searchQuery}
            selectedEmail={selectedEmail || null}
            onEmailSelect={setSelectedEmail}
            layoutMode={layoutMode}
            onLayoutChange={setLayoutMode}
            sentEmails={sentEmails}
            onUnreadCountChange={(count) => {
              // Update the inbox count in folders state
              setFolders(prev => {
                // Ensure prev is initialized
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

          {/* Email Detail */}
          {selectedEmail && layoutMode === 'split' && (
            <EmailDetail
              emailId={selectedEmail}
              onClose={() => setSelectedEmail('')}
              layoutMode={layoutMode}
              onLayoutChange={setLayoutMode}
              onSend={addSentEmail}
              emailConfig={emailConfig}
            />
          )}
        </div>

        {/* Full Email Detail */}
        {selectedEmail && layoutMode === 'full' && (
          <div className="flex-1">
            <EmailDetail
              emailId={selectedEmail}
              onClose={() => setSelectedEmail('')}
              layoutMode={layoutMode}
              onLayoutChange={setLayoutMode}
              onSend={addSentEmail}
              emailConfig={emailConfig}
            />
          </div>
        )}
      </div>

      {/* Email Composer */}
      {showComposer && (
        <EmailComposer 
          onClose={() => setShowComposer(false)} 
          onSend={addSentEmail}
          emailConfig={emailConfig}
        />
      )}

      {/* Folder Manager */}
      {showFolderManager && (
        <FolderManager
          folders={folders}
          onClose={() => setShowFolderManager(false)}
          onSave={setFolders}
        />
      )}

      {/* Email Configuration Dialog */}
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
                // Save configuration to localStorage
                if (typeof window !== 'undefined') {
                  localStorage.setItem('emailConfig', JSON.stringify(emailConfig));
                }
                setShowConfigDialog(false);
                
                // Show success toast
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