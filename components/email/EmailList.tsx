'use client';

import {useState} from 'react';
import {Archive, Paperclip, RotateCw, Star, Trash2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {cn} from '@/lib/utils';
import {LayoutMode} from "@/components/email/EmailClient";

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

const MOCK_EMAILS: Email[] = [
  {
    id: '1',
    from: 'Maria Silva',
    subject: 'Relatório mensal de compliance',
    preview: 'Segue em anexo o relatório mensal de compliance referente ao mês de dezembro...',
    date: '10:30 AM',
    isRead: false,
    isStarred: true,
    hasAttachment: true,
    labels: ['work', 'important'],
  },
  {
    id: '2',
    from: 'João Santos',
    subject: 'Aprovação de novo processo regulatório',
    preview: 'Prezado time, preciso da aprovação de vocês para implementar o novo processo...',
    date: '9:15 AM',
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    labels: ['work'],
  },
  {
    id: '3',
    from: 'Ana Costa',
    subject: 'Reunião de alinhamento - Projeto Way Brasil',
    preview: 'Olá pessoal, vamos marcar uma reunião para alinhar os próximos passos do projeto...',
    date: 'Yesterday',
    isRead: false,
    isStarred: false,
    hasAttachment: true,
    labels: ['work', 'meeting'],
  },
  {
    id: '4',
    from: 'Carlos Oliveira',
    subject: 'Documentação atualizada - Sistema de gestão',
    preview: 'A documentação do sistema de gestão foi atualizada com as novas funcionalidades...',
    date: 'Yesterday',
    isRead: true,
    isStarred: true,
    hasAttachment: false,
    labels: ['work'],
  },
  {
    id: '5',
    from: 'Fernanda Lima',
    subject: 'Feedback sobre implementação da nova funcionalidade',
    preview: 'Gostaria de compartilhar algumas observações sobre a nova funcionalidade implementada...',
    date: 'Dec 15',
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    labels: ['feedback'],
  },
];

interface EmailListProps {
  folder: string;
  searchQuery: string;
  selectedEmail: string | null;
  onEmailSelect: (emailId: string) => void;
  layoutMode: LayoutMode;
  onLayoutChange: (mode: LayoutMode) => void;
}

export default function EmailList({ 
  folder, 
  searchQuery, 
  selectedEmail, 
  onEmailSelect, 
  layoutMode,
  onLayoutChange
}: EmailListProps) {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  const filteredEmails = MOCK_EMAILS.filter(email => {
    if (searchQuery) {
      return email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
             email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
             email.preview.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    switch (folder) {
      case 'inbox':
        return true;
      case 'starred':
        return email.isStarred;
      case 'sent':
        return false; // Mock data doesn't include sent emails
      case 'drafts':
        return false; // Mock data doesn't include drafts
      default:
        return true;
    }
  });

  const toggleEmailSelection = (emailId: string) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const selectAllEmails = () => {
    setSelectedEmails(
      selectedEmails.length === filteredEmails.length 
        ? [] 
        : filteredEmails.map(email => email.id)
    );
  };

  return (
    <div className={`${selectedEmail && layoutMode === 'split' ? 'w-96' : 'flex-1'} bg-white ${selectedEmail && layoutMode === 'split' ? 'border-r border-gray-200' : ''} flex flex-col`}>
      {/* Email Actions */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between min-h-[2rem]">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectedEmails.length === filteredEmails.length && filteredEmails.length > 0}
              onCheckedChange={selectAllEmails}
            />
            <span className="text-sm text-gray-600 whitespace-nowrap">
              {selectedEmails.length > 0 ? `${selectedEmails.length} selecionados` : `${filteredEmails.length} emails`}
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
              <Button variant="ghost" size="sm">
                <RotateCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {filteredEmails.map((email) => (
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
                      !email.isRead ? "font-semibold text-gray-900" : "text-gray-700"
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
                  !email.isRead ? "font-semibold text-gray-900" : "text-gray-700"
                )}>
                  {email.subject}
                </h3>
                
                <p className="text-xs text-gray-500 line-clamp-2">
                  {email.preview}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}