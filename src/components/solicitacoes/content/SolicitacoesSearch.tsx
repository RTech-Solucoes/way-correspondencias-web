'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ExportSolicitacaoMenu from '@/components/solicitacoes/ExportSolicitacaoMenu';
import {
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XIcon,
} from '@phosphor-icons/react';
import { ActionWithHelp, HelpTooltip } from '@/components/help-tooltip';

const HELP_PESQUISA_SOLICITACOES =
  'Busca por identificação e assunto. Retorna as solicitações compatíveis com o termo informado.';

const HELP_FILTROS =
  'Os filtros podem ser combinados para restringir a listagem.';

interface ExportFilterParams {
  filtro?: string;
  idStatusSolicitacao?: number;
  idArea?: number;
  idTema?: number;
  cdIdentificacao?: string;
  nmResponsavel?: string;
  dtCriacaoInicio?: string;
  dtCriacaoFim?: string;
  sort?: string;
}

interface SolicitacoesSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  setShowFilterModal: (show: boolean) => void;
  canInserirSolicitacao: boolean;
  onCriarSolicitacao: () => void;
  exportFilterParams: ExportFilterParams;
  getStatusText: (status: string) => string;
}

export function SolicitacoesSearch({
  searchQuery,
  setSearchQuery,
  hasActiveFilters,
  clearFilters,
  setShowFilterModal,
  canInserirSolicitacao,
  onCriarSolicitacao,
  exportFilterParams,
  getStatusText,
}: SolicitacoesSearchProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center space-x-4">
        <div className="flex flex-1 items-center gap-1.5">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="pesquisar-solicitacoes"
              placeholder="Pesquisar solicitações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          <HelpTooltip content={HELP_PESQUISA_SOLICITACOES} label="Pesquisar solicitações" />
        </div>

        {hasActiveFilters && (
          <Button
            variant="outline"
            className="h-10 px-4"
            onClick={clearFilters}
          >
            <XIcon className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        )}

        <ExportSolicitacaoMenu
          filterParams={exportFilterParams}
          getStatusText={getStatusText}
        />

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

        {canInserirSolicitacao && (
          <Button onClick={onCriarSolicitacao}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Criar Solicitação
          </Button>
        )}
      </div>
    </div>
  );
}
