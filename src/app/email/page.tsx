"use client";

import EmailList from "@/components/email/EmailList";
import PageTitle from "@/components/ui/page-title";
import useEmail from "@/context/email/EmailContext";
import EmailSearch from "@/components/email/EmailSearch";
import FilterDialog from "@/components/email/FilterDialog";
import {Button} from "@/components/ui/button";
import {Pagination} from '@/components/ui/pagination';

import {ArrowClockwiseIcon} from "@phosphor-icons/react";
import {useCallback, useEffect, useState} from "react";
import {toast} from "sonner";
import {emailClient} from "@/api/email/client";
import {useDebounce} from "@/hooks/use-debounce";
import {FiltrosAplicados} from '@/components/ui/applied-filters';
import { formatDateBr } from "@/utils/utils";



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
    setActiveEmailFilters,
    hasActiveFilters,
    applyFilters,
    clearFilters,
  } = useEmail();

  const [loading, setLoading] = useState(false);
  // local emails state removed; list renders from EmailList fetch
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const loadEmails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await emailClient.buscarPorFiltro({
        filtro: debouncedSearchQuery || undefined,
        dsRemetente: activeEmailFilters.remetente || undefined,
        dsDestinatario: activeEmailFilters.destinatario || undefined,
        dtRecebimentoInicio: activeEmailFilters.dateFrom ? `${activeEmailFilters.dateFrom}T00:00:00` : undefined,
        dtRecebimentoFim: activeEmailFilters.dateTo ? `${activeEmailFilters.dateTo}T23:59:59` : undefined,
        page: currentPage,
        size: 15
      });

      if (!response || !response.content) {
        console.error('Resposta da API inválida:', response);
        toast.error("Resposta da API inválida");
        setTotalPages(0);
        setTotalElements(0);
        return;
      }

      if (!Array.isArray(response.content)) {
        console.error('response.content não é um array:', response.content);
        toast.error("Formato de dados inválido");
        setTotalPages(0);
        setTotalElements(0);
        return;
      }

      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error("Erro ao carregar emails:", error);
      toast.error("Erro ao carregar emails");
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, currentPage, activeEmailFilters.remetente, activeEmailFilters.destinatario, activeEmailFilters.dateFrom, activeEmailFilters.dateTo]);

  useEffect(() => {
    loadEmails();
  }, [loadEmails])

  const handleRefresh = () => {
    console.log("Atualizando...");
  };

  const filtrosAplicados = [
    ...(searchQuery ? [{
      key: 'search',
      label: 'Busca',
      value: searchQuery,
      color: 'blue' as const,
      onRemove: () => setSearchQuery('')
    }] : []),
    ...(activeEmailFilters.remetente ? [{
      key: 'remetente',
      label: 'Remetente',
      value: activeEmailFilters.remetente,
      color: 'green' as const,
      onRemove: () => {
        const newFilters = { ...activeEmailFilters, remetente: '' };
        setActiveEmailFilters(newFilters);
        setEmailFilters(newFilters);
      }
    }] : []),
    ...(activeEmailFilters.destinatario ? [{
      key: 'destinatario',
      label: 'Destinatário',
      value: activeEmailFilters.destinatario,
      color: 'purple' as const,
      onRemove: () => {
        const newFilters = { ...activeEmailFilters, destinatario: '' };
        setActiveEmailFilters(newFilters);
        setEmailFilters(newFilters);
      }
    }] : []),
    ...(activeEmailFilters.dateFrom ? [{
      key: 'dateFrom',
      label: 'Data Recebimento Início',
      value: formatDateBr(activeEmailFilters.dateFrom),
      color: 'indigo' as const,
      onRemove: () => {
        const newFilters = { ...activeEmailFilters, dateFrom: '' };
        setActiveEmailFilters(newFilters);
        setEmailFilters(newFilters);
      }
    }] : []),
    ...(activeEmailFilters.dateTo ? [{
      key: 'dateTo',
      label: 'Data Recebimento Fim',
      value: formatDateBr(activeEmailFilters.dateTo),
      color: 'indigo' as const,
      onRemove: () => {
        const newFilters = { ...activeEmailFilters, dateTo: '' };
        setActiveEmailFilters(newFilters);
        setEmailFilters(newFilters);
      }
    }] : [])
  ];

  return (
    <div className="flex flex-col min-h-0 flex-1">

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
            {totalElements} {totalElements > 1 ? "emails" : "email"}
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

      <FiltrosAplicados
        filters={filtrosAplicados}
        showClearAll={false}
        className="mb-4"
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-1 overflow-hidden min-h-[600px]">
        <EmailList
          searchQuery={searchQuery}
          selectedEmail={selectedEmail}
          onEmailSelect={onEmailSelect}
          currentPage={currentPage}
          emailFilters={{
            remetente: activeEmailFilters.remetente,
            destinatario: activeEmailFilters.destinatario,
            status: '',
            dateFrom: activeEmailFilters.dateFrom,
            dateTo: activeEmailFilters.dateTo,
            isRead: '',
            hasAttachments: '',
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