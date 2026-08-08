'use client';

import {
  ArrowsDownUpIcon,
  GearSixIcon,
  PencilSimpleIcon,
  PlusIcon,
  RoadHorizonIcon,
  SpinnerIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
} from '@phosphor-icons/react';
import {
  ConfiguracaoConcessionariaResponse,
  ConcessionariaResponse,
} from '@/api/concessionaria/types';
import { Button } from '@/components/ui/button';
import {
  StickyTable,
  StickyTableBody,
  StickyTableCell,
  StickyTableHead,
  StickyTableHeader,
  StickyTableRow,
} from '@/components/ui/sticky-table';
import { getStatusText, mask } from '@/utils/utils';
import ConfiguracaoProgress from './ConfiguracaoProgress';

interface TableConcessionariasProps {
  concessionarias: ConcessionariaResponse[];
  configuracoesById?: Record<number, ConfiguracaoConcessionariaResponse | null>;
  configuracoesLoadingById?: Record<number, boolean>;
  loading: boolean;
  canInserirConcessionaria?: boolean | null;
  canAtualizarConcessionaria?: boolean | null;
  canAlterarStatusConcessionaria?: boolean | null;
  canConfigurarConcessionaria?: boolean;
  handleSort: (field: keyof ConcessionariaResponse) => void;
  handleEdit: (concessionaria: ConcessionariaResponse) => void;
  handleConfigure: (concessionaria: ConcessionariaResponse) => void;
  handleToggleStatus: (concessionaria: ConcessionariaResponse) => void;
  onCriarConcessionaria?: () => void;
}

export default function TableConcessionarias({
  concessionarias,
  configuracoesById = {},
  configuracoesLoadingById = {},
  loading,
  canInserirConcessionaria,
  canAtualizarConcessionaria,
  canAlterarStatusConcessionaria,
  canConfigurarConcessionaria,
  handleSort,
  handleEdit,
  handleConfigure,
  handleToggleStatus,
  onCriarConcessionaria,
}: TableConcessionariasProps) {
  const showActions = true;
  const colSpan = showActions ? 7 : 6;

  return (
    <div className="flex flex-1 overflow-hidden bg-white">
      <StickyTable>
        <StickyTableHeader>
          <StickyTableRow>
            <StickyTableHead className="cursor-pointer" onClick={() => handleSort('cdConcessionaria')}>
              <div className="flex items-center">
                Código
                <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
              </div>
            </StickyTableHead>
            <StickyTableHead className="cursor-pointer" onClick={() => handleSort('nmConcessionaria')}>
              <div className="flex items-center">
                Nome
                <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
              </div>
            </StickyTableHead>
            <StickyTableHead>CNPJ</StickyTableHead>
            <StickyTableHead>Estado</StickyTableHead>
            <StickyTableHead className="text-center">
              <div className="flex items-center justify-center">
                Progresso da Configuração
              </div>
            </StickyTableHead>
            <StickyTableHead>
              <div className="flex items-center">
                Status
              </div>
            </StickyTableHead>
            {showActions && <StickyTableHead className="w-[180px] text-right">Ações</StickyTableHead>}
          </StickyTableRow>
        </StickyTableHeader>
        <StickyTableBody>
          {loading ? (
            <StickyTableRow>
              <StickyTableCell colSpan={colSpan} className="text-center py-8">
                <div className="flex items-center justify-center py-8">
                  <SpinnerIcon className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Buscando concessionárias...</span>
                </div>
              </StickyTableCell>
            </StickyTableRow>
          ) : concessionarias.length === 0 ? (
            <StickyTableRow>
              <StickyTableCell colSpan={colSpan} className="text-center py-10">
                <div className="flex flex-col items-center gap-3">
                  <RoadHorizonIcon className="h-8 w-8 text-gray-400" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700">Nenhuma concessionária</p>
                    <p className="text-sm text-gray-500">Criar a primeira</p>
                  </div>
                  {canInserirConcessionaria && onCriarConcessionaria && (
                    <Button className="mt-1" onClick={onCriarConcessionaria}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Criar Concessionária
                    </Button>
                  )}
                </div>
              </StickyTableCell>
            </StickyTableRow>
          ) : (
            concessionarias.map((concessionaria) => (
              <StickyTableRow key={concessionaria.idConcessionaria}>
                <StickyTableCell className="font-medium">{concessionaria.cdConcessionaria}</StickyTableCell>
                <StickyTableCell>{concessionaria.nmConcessionaria}</StickyTableCell>
                <StickyTableCell>
                  {concessionaria.nrCnpj ? mask.cnpj(concessionaria.nrCnpj) : '-'}
                </StickyTableCell>
                <StickyTableCell>{concessionaria.sgUf || '-'}</StickyTableCell>
                <StickyTableCell className="text-center">
                  <ConfiguracaoProgress
                    configuracao={configuracoesById[concessionaria.idConcessionaria]}
                    loading={configuracoesLoadingById[concessionaria.idConcessionaria]}
                    className="mx-auto max-w-[220px]"
                    onClick={
                      canConfigurarConcessionaria
                        ? () => handleConfigure(concessionaria)
                        : undefined
                    }
                  />
                </StickyTableCell>
                <StickyTableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    concessionaria.flAtivo === 'S'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {getStatusText(concessionaria.flAtivo)}
                  </span>
                </StickyTableCell>
                {showActions && (
                  <StickyTableCell className="w-[180px] text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {canConfigurarConcessionaria && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleConfigure(concessionaria)}
                          tooltip="Configurações da concessionária"
                          aria-label="Configurações da concessionária"
                        >
                          <GearSixIcon className="h-4 w-4" />
                        </Button>
                      )}
                      {canAtualizarConcessionaria && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(concessionaria)}
                          tooltip="Editar"
                          aria-label="Editar concessionária"
                        >
                          <PencilSimpleIcon className="h-4 w-4" />
                        </Button>
                      )}
                      {canAlterarStatusConcessionaria && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(concessionaria)}
                          tooltip={concessionaria.flAtivo === 'S' ? 'Desativar concessionária' : 'Ativar concessionária'}
                          aria-label={concessionaria.flAtivo === 'S' ? 'Desativar concessionária' : 'Ativar concessionária'}
                        >
                          {concessionaria.flAtivo === 'S' ? (
                            <ToggleRightIcon className="h-4 w-4 text-emerald-500" weight="bold" />
                          ) : (
                            <ToggleLeftIcon className="h-4 w-4 text-red-500" weight="bold" />
                          )}
                        </Button>
                      )}
                    </div>
                  </StickyTableCell>
                )}
              </StickyTableRow>
            ))
          )}
        </StickyTableBody>
      </StickyTable>
    </div>
  );
}
