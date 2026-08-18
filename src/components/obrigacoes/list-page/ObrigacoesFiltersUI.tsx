'use client';

import { Button } from "@/components/ui/button";
import { FunnelSimpleIcon, PlusIcon, UploadIcon, XIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import ExportObrigacaoMenu from "@/components/obrigacoes/relatorios/ExportObrigacaoMenu";
import { ObrigacaoFiltroRequest } from "@/api/obrigacao/types";
import { ActionWithHelp, HelpTooltip } from "@/components/help-tooltip";

const HELP_IMPORTAR_OBRIGACOES =
  "Indicada para cadastro em lote. O sistema processa o arquivo e valida os campos obrigatórios. Inconsistências geram mensagens de erro antes do cadastro.";

const HELP_PESQUISA_OBRIGACOES =
  "Busca por identificação e tarefa. Retorna as obrigações compatíveis com o termo informado.";

const HELP_FILTROS =
  "Os filtros podem ser combinados para restringir a listagem.";

interface ObrigacoesFiltersUIProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  hasActiveFilters: boolean;
  handleClearAllFilters: () => void;
  setShowFilterModal: (show: boolean) => void;
  filterParamsForExport: Omit<ObrigacaoFiltroRequest, 'page' | 'size' | 'sort'>;
  getStatusText: (statusCode: string) => string | null;
  isAdminOrGestor: boolean;
  canInserirObrigacao: boolean;
  setShowImportModal: (show: boolean) => void;
  setShowObrigacaoModal: (show: boolean) => void;
}

export function ObrigacoesFiltersUI({
  searchQuery,
  setSearchQuery,
  hasActiveFilters,
  handleClearAllFilters,
  setShowFilterModal,
  filterParamsForExport,
  getStatusText,
  isAdminOrGestor,
  canInserirObrigacao,
  setShowImportModal,
  setShowObrigacaoModal,
}: ObrigacoesFiltersUIProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center space-x-4">
        <div className="flex flex-1 items-center gap-1.5">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="pesquisar-obrigacoes"
              placeholder="Pesquisar obrigações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          <HelpTooltip content={HELP_PESQUISA_OBRIGACOES} label="Pesquisar obrigações" />
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="outline"
            className="h-10 px-4"
            onClick={handleClearAllFilters}
          >
            <XIcon className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        )}

        <ActionWithHelp help={HELP_FILTROS} helpLabel="Filtrar">
          <Button
            variant="secondary"
            className="h-10 px-4"
            onClick={() => setShowFilterModal(true)}
          >
            <FunnelSimpleIcon className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        </ActionWithHelp>

        <ExportObrigacaoMenu
          filterParams={filterParamsForExport}
          getStatusText={getStatusText}
          isAdminOrGestor={isAdminOrGestor}
        />
          
        {canInserirObrigacao && (
          <ActionWithHelp
            help={HELP_IMPORTAR_OBRIGACOES}
            helpLabel="Importar Obrigações"
          >
            <Button
              variant="outline"
              className="h-10 px-4"
              onClick={() => setShowImportModal(true)}
            >
              <UploadIcon className="h-4 w-4 mr-2" />
              Importar Obrigações
            </Button>
          </ActionWithHelp>
        )}

        {canInserirObrigacao && (
          <Button
            className="h-10 px-4"
            onClick={() => setShowObrigacaoModal(true)}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Criar Obrigação
          </Button>
        )}
      </div>
    </div>
  );
}

