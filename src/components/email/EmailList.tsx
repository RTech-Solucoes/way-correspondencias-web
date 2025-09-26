'use client';

import React, {memo, useCallback, useEffect, useState} from 'react';
import {EnvelopeSimpleIcon, PaperclipIcon, SpinnerIcon} from '@phosphor-icons/react';
import {cn} from '@/utils/utils';
import {toast} from 'sonner';
import {emailClient} from '@/api/email/client';
import {EmailResponse} from '@/api/email/types';
import {useDebounce} from '@/hooks/use-debounce';
import {EmailFiltersState} from "@/context/email/EmailContext";

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
  } catch {
    return '';
  }
};

interface EmailListProps {
  searchQuery: string;
  selectedEmail: string | null;
  onEmailSelect: (emailId: string) => void;
  currentPage?: number;
  emailFilters?: EmailFiltersState;
}

const EmailItem = memo<{
  email: EmailResponse;
  isSelected: boolean;
  onSelect: () => void;
}>(({ email, isSelected, onSelect }) => {
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    onSelect();
  }, [onSelect]);

  const isRead = email.flAtivo === 'S';
  const hasAttachment = false;
  const preview = email.dsCorpo
    ? (email.dsCorpo?.length > 100 ? email.dsCorpo.substring(0, 100) + '...' : email.dsCorpo)
    : 'Sem conteúdo disponível';

  return (
    <div
      className={cn(
        "p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors",
        isSelected && "bg-blue-100",
        !isRead && "bg-blue-50/30"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between space-x-4">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {email.dsAssunto || 'Sem assunto'}
            </h3>
            {hasAttachment && (
              <PaperclipIcon className="h-3 w-3 text-gray-400 flex-shrink-0"/>
            )}
          </div>
          <p className="text-xs text-gray-500 line-clamp-2">
            {preview}
          </p>
        </div>

        <div className="flex flex-col items-end space-y-1 flex-shrink-0 min-w-0 max-w-[200px]">
          <span className="text-xs text-gray-600 truncate max-w-full">
            {email.dsDestinatario || email.dsRemetente || ''}
          </span>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatDate(email.dtRecebimento) || ''}
          </span>
        </div>
      </div>
    </div>
  );
});

EmailItem.displayName = 'EmailItem';

function EmailList({
  searchQuery,
  selectedEmail,
  onEmailSelect,
  currentPage: externalPage,
  emailFilters = {
    remetente: '',
    destinatario: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    isRead: '',
    hasAttachments: ''
  }
}: EmailListProps) {
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<EmailResponse[]>([]);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const loadEmails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await emailClient.buscarPorFiltro({
        filtro: debouncedSearchQuery || undefined,
        dsRemetente: emailFilters.remetente || undefined,
        dsDestinatario: emailFilters.destinatario || undefined,
        dtRecebimentoInicio: emailFilters.dateFrom ? `${emailFilters.dateFrom}T00:00:00` : undefined,
        dtRecebimentoFim: emailFilters.dateTo ? `${emailFilters.dateTo}T23:59:59` : undefined,
        page: typeof externalPage === 'number' ? externalPage : 0,
        size: 15
      });

      if (!response || !response.content) {
        console.error('Resposta da API inválida:', response);
        toast.error("Resposta da API inválida");
        setEmails([]);
        return;
      }

      if (!Array.isArray(response.content)) {
        console.error('response.content não é um array:', response.content);
        toast.error("Formato de dados inválido");
        setEmails([]);
        return;
      }

      setEmails(response.content);
    } catch (error) {
      console.error("Erro ao carregar emails:", error);
      toast.error("Erro ao carregar emails");
      setEmails([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, externalPage, emailFilters.remetente, emailFilters.destinatario, emailFilters.dateFrom, emailFilters.dateTo]);

  useEffect(() => {
    loadEmails();
  }, [loadEmails]);


  return (
    <div className="flex-1 flex flex-col bg-white w-full">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-1 items-center justify-center py-8">
            <SpinnerIcon className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Buscando emails...</span>
          </div>
        ) : emails?.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <div className="text-center">
              <EnvelopeSimpleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Nenhum email encontrado
              </h3>
              <p className="text-gray-500">
                {debouncedSearchQuery
                  ? `Não há emails correspondentes à pesquisa "${debouncedSearchQuery}"`
                  : "Sua caixa de entrada está vazia"
                }
              </p>
            </div>
          </div>
        ) : (
          emails.map((email, index) => (
            <EmailItem
              key={index}
              email={email}
              isSelected={selectedEmail === email.idEmail?.toString()}
              onSelect={() => onEmailSelect(email.idEmail?.toString() || '')}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default EmailList;
