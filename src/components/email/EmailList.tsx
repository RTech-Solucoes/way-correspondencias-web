'use client';

import React, {memo, useCallback, useMemo, useState, useEffect} from 'react';
import {ArrowClockwiseIcon, EnvelopeSimpleIcon, PaperclipIcon, SpinnerIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {cn} from '@/utils/utils';
import { toast } from 'sonner';
import { emailClient } from '@/api/email/client';
import { EmailResponse } from '@/api/email/types';
import { useDebounce } from '@/hooks/use-debounce';
import { Pagination } from '@/components/ui/pagination';

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  hasAttachment: boolean;
  labels: string[];
  content?: string;
}

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

const convertEmailResponse = (email: EmailResponse | null): Email => {
  if (!email) {
    console.warn('Email object is undefined or null');
    return {
      id: '0',
      from: 'Email inválido',
      subject: 'Assunto não disponível',
      preview: 'Conteúdo não disponível',
      date: '',
      isRead: false,
      hasAttachment: false,
      labels: ['erro'],
      content: 'Conteúdo não disponível'
    };
  }

  const convertedId = email.id?.toString() || '0';

  return {
    id: convertedId,
    from: email.dsRemetente,
    subject: email.dsAssunto || 'Sem assunto',
    preview: email.dsCorpo
      ? (email.dsCorpo.length > 100 ? email.dsCorpo.substring(0, 100) + '...' : email.dsCorpo)
      : 'Sem conteúdo disponível',
    date: formatDate(email.dtEnvio),
    isRead: email.flStatus === 'RESPONDIDO' || email.dtResposta !== null,
    hasAttachment: email.anexos ? email.anexos.length > 0 : false,
    labels: [email.flStatus?.toLowerCase() || 'desconhecido'],
    content: email.dsCorpo || 'Conteúdo não disponível'
  };
};

interface EmailListProps {
  searchQuery: string;
  selectedEmail: string | null;
  onEmailSelect: (emailId: string) => void;
  emailFilters?: {
    isRead: string;
    hasAttachment: string;
    dateFrom: string;
    dateTo: string;
    sender: string;
  };
}

const EmailItem = memo<{
  email: Email;
  isSelected: boolean;
  onSelect(): void;
}>(({ email, isSelected, onSelect }) => {
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    onSelect();
  }, [onSelect]);

  return (
    <div
      className={cn(
        "p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors",
        isSelected && "bg-blue-100",
        !email.isRead && "bg-blue-50/30"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm truncate font-semibold text-gray-700">
                {email.from}
              </span>
              {email.hasAttachment && (
                <PaperclipIcon className="h-3 w-3 text-gray-400"/>
              )}
            </div>
            <span className="text-xs text-gray-500">{email.date}</span>
          </div>

          <h3 className="text-sm mb-1 truncate font-bold text-gray-900">
            {email.subject}
          </h3>

          <p className="text-xs text-gray-500 line-clamp-2">
            {email.preview}
          </p>
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
  emailFilters = {
    isRead: '',
    hasAttachment: '',
    dateFrom: '',
    dateTo: '',
    sender: ''
  }
}: EmailListProps) {
  const [syncLoading, setSyncLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<Email[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const loadEmails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await emailClient.buscarPorFiltro({
        filtro: debouncedSearchQuery || undefined,
        page: currentPage,
        size: 50
      });

      if (!response || !response.content) {
        console.error('Resposta da API inválida:', response);
        toast.error("Resposta da API inválida");
        setEmails([]);
        setTotalPages(0);
        setTotalElements(0);
        return;
      }

      if (!Array.isArray(response.content)) {
        console.error('response.content não é um array:', response.content);
        toast.error("Formato de dados inválido");
        setEmails([]);
        setTotalPages(0);
        setTotalElements(0);
        return;
      }

      const convertedEmails = response.content.map((email, index) => {
        try {
          return convertEmailResponse(email);
          console.log("teste")
        } catch (error) {
          console.error(`Erro ao converter email ${index}:`, error, email);
          return convertEmailResponse(null);
        }
      });

      setEmails(convertedEmails);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error("Erro ao carregar emails:", error);
      toast.error("Erro ao carregar emails");
      setEmails([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, currentPage]);

  useEffect(() => {
    loadEmails();
  }, [loadEmails]);

  const filteredEmails = useMemo(() => {
    return emails.filter(email => {
      const matchesReadStatus = !emailFilters.isRead ||
        emailFilters.isRead === 'all' ||
        (emailFilters.isRead === 'read' && email.isRead) ||
        (emailFilters.isRead === 'unread' && !email.isRead);

      const matchesAttachment = !emailFilters.hasAttachment ||
        emailFilters.hasAttachment === 'all' ||
        (emailFilters.hasAttachment === 'true' && email.hasAttachment) ||
        (emailFilters.hasAttachment === 'false' && !email.hasAttachment);

      const matchesSender = !emailFilters.sender ||
        email.from.toLowerCase().includes(emailFilters.sender.toLowerCase());

      const emailDate = new Date(email.date.split(' ')[0].split('/').reverse().join('-'));
      const matchesDateFrom = !emailFilters.dateFrom ||
        emailDate >= new Date(emailFilters.dateFrom);
      const matchesDateTo = !emailFilters.dateTo ||
        emailDate <= new Date(emailFilters.dateTo);

      return matchesReadStatus && matchesAttachment &&
             matchesSender && matchesDateFrom && matchesDateTo;
    });
  }, [emails, emailFilters]);

  const handleRefresh = useCallback(async () => {
    setSyncLoading(true);
    try {
      await loadEmails();
      toast.success("Seus emails foram atualizados com sucesso");
    } catch {
      toast.error("Erro ao sincronizar emails");
    } finally {
      setSyncLoading(false);
    }
  }, [loadEmails]);

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {filteredEmails.length} email(s)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={syncLoading}
          >
            {syncLoading ? (
              <SpinnerIcon className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <ArrowClockwiseIcon className="h-4 w-4 mr-1" />
            )}
            Atualizar
          </Button>
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-1 items-center justify-center py-8">
            <SpinnerIcon className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Buscando emails...</span>
          </div>
        ) : filteredEmails.length === 0 ? (
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
          filteredEmails.map((email, index) => (
            <EmailItem
              key={index}
              email={email}
              isSelected={selectedEmail === email.id}
              onSelect={() => onEmailSelect(email.id)}
            />
          ))
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={50}
        onPageChange={setCurrentPage}
        loading={loading}
      />
    </div>
  );
}

export default EmailList;
