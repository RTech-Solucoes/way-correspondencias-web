"use client";

import {
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EmailList from "@/components/email/EmailList";
import EmailDetail from "@/components/email/EmailDetail";
import PageTitle from "@/components/ui/page-title";
import useEmail from "@/context/email/EmailContext";
import EmailSearch from "@/components/email/EmailSearch";
import FilterDialog from "@/components/email/FilterDialog";

export default function EmailPage() {
  const {
    selectedEmail,
    setSelectedEmail,
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