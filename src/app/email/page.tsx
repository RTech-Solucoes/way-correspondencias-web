'use client';

import EmailDetail from '@/components/email/EmailDetail';
import EmailList from '@/components/email/EmailList';
import EmailSearch from '@/components/email/EmailSearch';
import FilterDialog from '@/components/email/FilterDialog';
import PageTitle from '@/components/ui/page-title';
import { useState } from 'react';

export default function EmailPage() {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [emailFilters, setEmailFilters] = useState({
    remetente: '',
    destinatario: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  const [activeEmailFilters, setActiveEmailFilters] = useState({
    remetente: '',
    destinatario: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  const applyFilters = () => {
    setActiveEmailFilters(emailFilters);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      remetente: '',
      destinatario: '',
      status: '',
      dateFrom: '',
      dateTo: '',
    };
    setEmailFilters(clearedFilters);
    setActiveEmailFilters(clearedFilters);
    setShowFilterModal(false);
  };

  const hasActiveFilters = Object.values(activeEmailFilters).some(value => value !== '');

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <PageTitle />
        </div>

        <EmailSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setShowFilterModal={setShowFilterModal}
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {!selectedEmail ? (
          <EmailList
            searchQuery={searchQuery}
            selectedEmail={selectedEmail}
            onEmailSelect={setSelectedEmail}
            emailFilters={{
              isRead: '',
              hasAttachment: '',
              dateFrom: activeEmailFilters.dateFrom,
              dateTo: activeEmailFilters.dateTo,
              sender: activeEmailFilters.remetente
            }}
          />
        ) : (
          <EmailDetail
            emailId={selectedEmail}
            onBack={() => setSelectedEmail(null)}
          />
        )}
      </div>

      {showFilterModal && (
        <FilterDialog
          emailFilters={emailFilters}
          setEmailFilters={setEmailFilters}
          setShowFilterModal={setShowFilterModal}
          showFilterModal={showFilterModal}
          applyFilters={applyFilters}
          clearFilters={clearFilters}
        />
      )}
    </div>
  );
}