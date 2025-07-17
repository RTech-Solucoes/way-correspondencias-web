'use client';

import { useState } from 'react';
import { Star, Archive, Trash2, Reply, ReplyAll, Forward, MoreHorizontal, Paperclip, Download, Maximize, Maximize2, Minimize2, StretchVertical, Loader2, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {LayoutMode} from "@/components/email/EmailClient";
import EmailComposer from './EmailComposer';
import { useEmail, useResponderEmail } from '@/lib/api/hooks';
import { useToast } from '@/hooks/use-toast';
import { Anexo } from '@/lib/api/types'
import { cn } from '@/lib/utils';

interface EmailDetailProps {
  emailId: string;
  onClose(): void;
  layoutMode?: LayoutMode;
  onLayoutChange?: (mode: LayoutMode) => void;
}

// Helper function to format date
const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  
  // Format as full date and time
  return date.toLocaleDateString('pt-BR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Sample HTML content for emails that don't have a response
const DEFAULT_EMAIL_CONTENT = `
  <p>Este email não possui conteúdo detalhado.</p>
  <p>Em uma aplicação real, o conteúdo completo do email seria exibido aqui.</p>
`;
export default function EmailDetail({
  emailId,
  onClose,
  layoutMode = 'split',
  onLayoutChange
}: EmailDetailProps) {
  const { toast } = useToast();
  const emailIdNumber = parseInt(emailId, 10);
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const [showForwardComposer, setShowForwardComposer] = useState(false);
  
  // Only fetch if we have a valid number
  const { data: apiEmail, loading, error } = useEmail(
    !isNaN(emailIdNumber) ? emailIdNumber : 0
  );
  
  // Get the responder email hook
  const { responder, loading: replyLoading, error: replyError } = useResponderEmail();
  
  // Show error toast if API call fails
  if (error) {
    toast({
      title: "Erro ao carregar email",
      description: "Não foi possível carregar os detalhes do email. Tente novamente mais tarde.",
      variant: "destructive",
    });
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="flex-1 bg-white flex flex-col h-full items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500">Carregando email...</p>
      </div>
    );
  }
  
  // Email not found state
  if (!apiEmail || isNaN(emailIdNumber)) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center">
        <p className="text-gray-500">Email não encontrado</p>
      </div>
    );
  }
  
  // Map API data to the format expected by the component
  const email = {
    id: apiEmail.id_email.toString(),
    from: apiEmail.remetente.split("@")[0], // More user-friendly name
    fromEmail: apiEmail.remetente, // Placeholder email
    subject: apiEmail.assunto,
    content: apiEmail.conteudo || DEFAULT_EMAIL_CONTENT,
    date: formatDate(apiEmail.prazo_resposta) || formatDate(new Date().toISOString()), // Use prazo_resposta or current date
    attachments: [] as Anexo[], // API doesn't have attachments yet
    isStarred: false // API doesn't have this concept yet
  };

  return (
    <div className="flex-1 bg-white flex flex-col overflow-y-auto h-full max-h-full">
      {/* Email Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              {layoutMode === "split" ?
                <X className="h-4 w-4" /> :
                <ArrowLeft className="h-4 w-4" />
              }
            </Button>
            <Button variant="ghost" size="sm">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </Button>
            <Button variant="ghost" size="sm">
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
            {onLayoutChange && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLayoutChange(layoutMode === 'split' ? 'full' : 'split')}
                title={layoutMode === 'split' ? 'Expandir' : 'Dividir'}
              >
                {layoutMode === 'split' ? (
                  <Maximize className="h-4 w-4" />
                ) : (
                  <StretchVertical className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
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
              <AvatarImage src="/placeholder-avatar.jpg" alt={email.from} />
              <AvatarFallback>MS</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-gray-900">{email.from}</div>
              <div className="text-gray-500">{email.fromEmail}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 p-6">
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: email.content }}
        />

        {/* Attachments */}
        {email.attachments.length > 0 && (
          <div className="mt-8 p-4 bg-gray-50 rounded-3xl">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Paperclip className="h-4 w-4 mr-2" />
              Anexos ({email.attachments.length})
            </h3>
            <div className="space-y-2">
              {email.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <Paperclip className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{attachment?.ds_nome_anexo || "Arquivo"}</div>
                      <div className="text-xs text-gray-500">{attachment?.nm_tamanho_anexo || "20MB"}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Email Actions */}
      <div className="p-6 border-t border-gray-200 mt-auto">
        <div className="flex items-center gap-2 w-full">
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              // Open reply composer
              setShowReplyComposer(true);
            }}
            disabled={replyLoading}
          >
            {replyLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Reply className="h-4 w-4 mr-2" />
            )}
            Responder
          </Button>
          {/*<Button variant="secondary">*/}
          {/*  <ReplyAll className="h-4 w-4 mr-2" />*/}
          {/*  Responder Tudo*/}
          {/*</Button>*/}
          <Button 
            variant="secondary" 
            className="ml-auto"
            onClick={() => {
              // Open forward composer
              setShowForwardComposer(true);
            }}
          >
            <Forward className="h-4 w-4 mr-2" />
            Encaminhar
          </Button>
        </div>
      </div>
      
      {/* Reply Composer */}
      {showReplyComposer && (
        <EmailComposer 
          onClose={() => setShowReplyComposer(false)}
          initialTo={email.fromEmail}
          initialSubject={email.subject}
          isReply={true}
          originalEmail={email}
        />
      )}
      
      {/* Forward Composer */}
      {showForwardComposer && (
        <EmailComposer 
          onClose={() => setShowForwardComposer(false)}
          initialSubject={email.subject}
          isForward={true}
          originalEmail={email}
        />
      )}
    </div>
  );
}