"use client";

import EmailList from "@/components/email/EmailList";
import PageTitle from "@/components/ui/page-title";
import useEmail from "@/context/email/EmailContext";
import EmailSearch from "@/components/email/EmailSearch";
import FilterDialog from "@/components/email/FilterDialog";
import {Button} from "@/components/ui/button";
import {Pagination} from '@/components/ui/pagination';

import {ArrowClockwiseIcon} from "@phosphor-icons/react";
import {useEffect, useState, useMemo, useRef} from "react";
import {useDebounce} from "@/hooks/use-debounce";
import {FiltrosAplicados} from '@/components/ui/applied-filters';
import { formatDateBr } from "@/utils/utils";
import { useEmailsQuery } from "./hooks/use-email-query";

export function EmailContent() {
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

  const [currentPage, setCurrentPage] = useState(0);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Refs para detectar mudança de filtros (melhor prática React Query)
  const prevFiltersRef = useRef(JSON.stringify(activeEmailFilters));
  const prevSearchRef = useRef(debouncedSearchQuery);

  // Parâmetros da query - calcula página efetiva de forma síncrona
  const queryParams = useMemo(() => {
    const currentFiltersStr = JSON.stringify(activeEmailFilters);
    const filtersChanged = prevFiltersRef.current !== currentFiltersStr;
    const searchChanged = prevSearchRef.current !== debouncedSearchQuery;
    
    // Página efetiva: 0 se filtros mudaram, senão usa currentPage
    const effectivePage = (filtersChanged || searchChanged) ? 0 : currentPage;
    
    // Atualiza refs para próxima comparação
    prevFiltersRef.current = currentFiltersStr;
    prevSearchRef.current = debouncedSearchQuery;
    
    return {
      filtro: debouncedSearchQuery || undefined,
      dsRemetente: activeEmailFilters.remetente || undefined,
      dsDestinatario: activeEmailFilters.destinatario || undefined,
      dtRecebimentoInicio: activeEmailFilters.dateFrom ? `${activeEmailFilters.dateFrom}T00:00:00` : undefined,
      dtRecebimentoFim: activeEmailFilters.dateTo ? `${activeEmailFilters.dateTo}T23:59:59` : undefined,
      page: effectivePage,
      size: 15
    };
  }, [debouncedSearchQuery, activeEmailFilters, currentPage]);

  // Sincroniza estado da página com a página efetiva calculada
  useEffect(() => {
    if (queryParams.page !== currentPage) {
      setCurrentPage(queryParams.page);
    }
  }, [queryParams.page, currentPage]);

  // Query principal
  const { data, isLoading, refetch, isError, isFetching } = useEmailsQuery(queryParams);

  const emails = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  const handleRefresh = async () => {
    await refetch();
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
      label: 'Data Recebimento (Início)',
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
      label: 'Data Recebimento (Fim)',
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
            disabled={isFetching}
            title="Atualizar"
          >
            <ArrowClockwiseIcon className="h-4 w-4 mr-1" />
          </Button>

          <span className="text-sm text-gray-500">
            {isLoading && emails.length === 0 ? 'Carregando...' : `${totalElements} ${totalElements !== 1 ? "emails" : "email"}`}
          </span>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={setCurrentPage}
            loading={isLoading && emails.length === 0}
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
        {isError ? (
          <div className="flex flex-col items-center justify-center w-full p-8">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Erro ao carregar emails</h3>
              <p className="mt-1 text-sm text-gray-500">
                Não foi possível carregar os emails. Verifique sua conexão e tente novamente.
              </p>
              <div className="mt-6">
                <Button
                  onClick={handleRefresh}
                  variant="default"
                  size="sm"
                >
                  <ArrowClockwiseIcon className="h-4 w-4 mr-2" />
                  Tentar novamente
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <EmailList
            emails={emails}
            loading={isLoading && emails.length === 0}
            searchQuery={searchQuery}
            selectedEmail={selectedEmail}
            onEmailSelect={onEmailSelect}
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
