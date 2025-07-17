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
  Star
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';
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

export default function EmailClient() {
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [showFolders, setShowFolders] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFolderManager, setShowFolderManager] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('full');
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
      from: 'you@example.com', // Use the current user's email
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
          <Button onClick={() => setShowComposer(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Escrever
          </Button>
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
            />
          </div>
        )}
      </div>

      {/* Email Composer */}
      {showComposer && (
        <EmailComposer 
          onClose={() => setShowComposer(false)} 
          onSend={addSentEmail}
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
    </div>
  );
}