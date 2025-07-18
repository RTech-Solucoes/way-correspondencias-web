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
}

// Helper function to format date
const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Today
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  
  // Yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Ontem';
  }
  
  // This year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
  }
  
  // Other years
  return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric' });
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
  const { toast } = useToast();
  
  // Fetch emails from API
  const { data, error, loading, refetch } = useEmails({
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
    syncAndFetchEmails().then(r => {})
  }, []);
  
  // Map API emails to the format expected by the component
  const emails: Email[] = useMemo(() => {
    return data?.items?.map((apiEmail: ApiEmail) => ({
      id: apiEmail.id_email.toString(),
      from: apiEmail.remetente, // More user-friendly name
      subject: apiEmail.assunto,
      preview: apiEmail.conteudo,
      date: formatDate(apiEmail.prazo_resposta),
      isRead: apiEmail.tp_status !== 'NOVO',
      isStarred: false, // API doesn't have this concept yet
      hasAttachment: false, // API doesn't have this concept yet
      labels: [], // API doesn't have this concept yet
    })) || [];
  }, [data]);
  
  // Calculate and report unread emails count for inbox
  useEffect(() => {
    // Only update count for inbox folder
    if (onUnreadCountChange && folder === 'inbox') {
      // Handle case where emails might be undefined or null
      if (!emails || emails.length === 0) {
        // Reset count to 0 when there are no emails
        onUnreadCountChange(0);
        return;
      }
      
      // Calculate unread emails count
      const unreadCount = emails.filter(email => !email.isRead).length;
      
      // Ensure count is not negative
      const safeCount = Math.max(0, unreadCount);
      
      // Update the inbox count in the parent component
      onUnreadCountChange(safeCount);
    }
  }, [emails, onUnreadCountChange, folder]);
  
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
    <div className={`${selectedEmail && layoutMode === 'split' ? 'w-96' : 'flex-1'} bg-white ${selectedEmail && layoutMode === 'split' ? 'border-r border-gray-200' : ''} flex flex-col`}>
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
                  <Archive className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
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
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCw className="h-4 w-4" />
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
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500">Carregando emails...</p>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <Mail className="h-12 w-12 text-gray-300 mb-4" />
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
                  <Star className={cn("h-4 w-4", email.isStarred && "fill-yellow-500 text-yellow-500")} />
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
                        <Paperclip className="h-3 w-3 text-gray-400" />
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