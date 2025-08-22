"use client";

import EmailList from "@/components/email/EmailList";
import EmailDetail from "@/components/email/EmailDetail";
import PageTitle from "@/components/ui/page-title";
import useEmail from "@/context/email/EmailContext";
import EmailSearch from "@/components/email/EmailSearch";
import FilterDialog from "@/components/email/FilterDialog";

export default function EmailPage() {
  const {
    selectedEmail,
    onEmailSelect,
    searchQuery,
    setSearchQuery,
    showFilterModal,
    setShowFilterModal,
    emailFilters,
    setEmailFilters,
    activeEmailFilters,
    hasActiveFilters,
    applyFilters,
    clearFilters,
  } = useEmail();

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
        <EmailList
          searchQuery={searchQuery}
          selectedEmail={selectedEmail}
          onEmailSelect={onEmailSelect}
          emailFilters={{
            isRead: '',
            hasAttachment: '',
            dateFrom: activeEmailFilters.dateFrom,
            dateTo: activeEmailFilters.dateTo,
            sender: activeEmailFilters.remetente
          }}
        />
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