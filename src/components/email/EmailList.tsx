'use client';

import React, {memo, useCallback} from 'react';
import {EnvelopeSimpleIcon, PaperclipIcon, SpinnerIcon} from '@phosphor-icons/react';
import {cn, formatDateTimeBr} from '@/utils/utils';
import {EmailResponse} from '@/api/email/types';

interface EmailListProps {
  emails: EmailResponse[];
  loading: boolean;
  searchQuery: string;
  selectedEmail: string | null;
  onEmailSelect: (emailId: string) => void;
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
            {formatDateTimeBr(email.dtRecebimento) || ''}
          </span>
        </div>
      </div>
    </div>
  );
});

EmailItem.displayName = 'EmailItem';

function EmailList({
  emails,
  loading,
  searchQuery,
  selectedEmail,
  onEmailSelect,
}: EmailListProps) {
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
                {searchQuery
                  ? `Não há emails correspondentes à pesquisa "${searchQuery}"`
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
