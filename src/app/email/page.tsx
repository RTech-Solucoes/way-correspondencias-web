"use client";

import EmailList from "@/components/email/EmailList";
import PageTitle from "@/components/ui/page-title";
import useEmail from "@/context/email/EmailContext";
import EmailSearch from "@/components/email/EmailSearch";
import FilterDialog from "@/components/email/FilterDialog";
import {Button} from "@nextui-org/react";
import {Pagination} from '@/components/ui/pagination';

import {ArrowClockwiseIcon} from "@phosphor-icons/react";
import {useCallback, useEffect, useMemo, useState} from "react";
import {toast} from "sonner";
import {emailClient} from "@/api/email/client";
import {useDebounce} from "@/hooks/use-debounce";
import {EmailResponse} from "@/api/email/types";

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
}

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

  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<EmailResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [numberOfElements, setNumberOfElements] = useState(0);
  const [first, setFirst] = useState(true);
  const [last, setLast] = useState(true);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const loadEmails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await emailClient.buscarPorFiltro({
        filtro: debouncedSearchQuery || undefined,
        page: currentPage,
        size: 15
      });

      if (!response || !response.content) {
        console.error('Resposta da API inválida:', response);
        toast.error("Resposta da API inválida");
        setEmails([]);
        setTotalPages(0);
        setTotalElements(0);
        setNumberOfElements(0);
        setFirst(true);
        setLast(true);
        return;
      }

      if (!Array.isArray(response.content)) {
        console.error('response.content não é um array:', response.content);
        toast.error("Formato de dados inválido");
        setEmails([]);
        setTotalPages(0);
        setTotalElements(0);
        setNumberOfElements(0);
        setFirst(true);
        setLast(true);
        return;
      }

      setEmails(response.content);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
      setNumberOfElements(response.numberOfElements || 0);
      setFirst(response.first || false);
      setLast(response.last || false);
    } catch (error) {
      console.error("Erro ao carregar emails:", error);
      toast.error("Erro ao carregar emails");
      setEmails([]);
      setTotalPages(0);
      setTotalElements(0);
      setNumberOfElements(0);
      setFirst(true);
      setLast(true);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, currentPage]);

  useEffect(() => {
    loadEmails();
  }, [loadEmails])

  const filteredEmails = useMemo(() => {
    return emails.filter(email => {
      const isRead = email.flAtivo === 'S';
      const hasAttachment = false;

      const matchesReadStatus = !emailFilters.isRead ||
        emailFilters.isRead === 'all' ||
        (emailFilters.isRead === 'read' && isRead) ||
        (emailFilters.isRead === 'unread' && !isRead);

      const matchesAttachment = !emailFilters.hasAttachment ||
        emailFilters.hasAttachment === 'all' ||
        (emailFilters.hasAttachment === 'true' && hasAttachment) ||
        (emailFilters.hasAttachment === 'false' && !hasAttachment);

      const matchesSender = !emailFilters.sender ||
        email.dsRemetente.toLowerCase().includes(emailFilters.sender.toLowerCase());

      const emailDate = new Date(formatDate(email.dtRecebimento).split(' ')[0].split('/').reverse().join('-'));
      const matchesDateFrom = !emailFilters.dateFrom ||
        emailDate >= new Date(emailFilters.dateFrom);
      const matchesDateTo = !emailFilters.dateTo ||
        emailDate <= new Date(emailFilters.dateTo);

      return matchesReadStatus && matchesAttachment &&
             matchesSender && matchesDateFrom && matchesDateTo;
    });
  }, [emails, emailFilters])

  const handleRefresh = () => {
    console.log("Atualizando...");
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Header da página com título e busca */}

      <div className="flex items-center justify-between">
        <PageTitle />
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
          >
            <ArrowClockwiseIcon className="h-4 w-4 mr-1" />
          </Button>

          <span className="text-sm text-gray-500">
            {filteredEmails?.length} {filteredEmails?.length > 1 ? "emails" : "email"}
          </span>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={setCurrentPage}
            loading={loading}
            showOnlyPaginationButtons={true}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <EmailSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setShowFilterModal={setShowFilterModal}
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* Área principal de conteúdo */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-1 overflow-hidden min-h-[600px]">
        <EmailList
          searchQuery={searchQuery}
          selectedEmail={selectedEmail}
          onEmailSelect={onEmailSelect}
          currentPage={currentPage}
          emailFilters={{
            isRead: '',
            hasAttachment: '',
            dateFrom: activeEmailFilters.dateFrom,
            dateTo: activeEmailFilters.dateTo,
            sender: activeEmailFilters.remetente
          }}
        />
      </div>

      {/* Modal de filtros */}
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