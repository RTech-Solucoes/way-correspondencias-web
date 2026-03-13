'use client';

import React from 'react';
import {
  StickyTable,
  StickyTableBody,
  StickyTableCell,
  StickyTableHead,
  StickyTableHeader,
  StickyTableRow,
} from '@/components/ui/sticky-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import LoadingRows from '@/components/solicitacoes/LoadingRows';
import TimeProgress from '@/components/ui/time-progress';
import {
  ArrowsDownUpIcon,
  ClipboardTextIcon,
  ClockCounterClockwiseIcon,
  PaperPlaneRightIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { CorrespondenciaResponse } from '@/api/correspondencia/types';
import { AreaSolicitacao } from '@/api/solicitacoes/types';
import { statusList } from '@/api/status-solicitacao/types';

interface SolicitacoesTableProps {
  solicitacoes: CorrespondenciaResponse[];
  loading: boolean;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  canAtualizarSolicitacao: boolean;
  canDeletarSolicitacao: boolean;
  handleSort: (field: string) => void;
  handleEdit: (solicitacao: CorrespondenciaResponse) => void;
  handleDelete: (solicitacao: CorrespondenciaResponse) => void;
  handleTramitacoes: (solicitacao: CorrespondenciaResponse) => void;
  openDetalhes: (solicitacao: CorrespondenciaResponse) => void;
  getStatusBadgeVariant: (status: string) => "default" | "secondary" | "destructive" | "outline";
  getStatusBadgeBg: (status: string) => string;
  getStatusText: (status: string) => string;
  getJoinedNmAreas: (areas: AreaSolicitacao[] | undefined) => string;
}

export function SolicitacoesTable({
  solicitacoes,
  loading,
  canAtualizarSolicitacao,
  canDeletarSolicitacao,
  handleSort,
  handleEdit,
  handleDelete,
  handleTramitacoes,
  openDetalhes,
  getStatusBadgeVariant,
  getStatusBadgeBg,
  getStatusText,
  getJoinedNmAreas,
}: SolicitacoesTableProps) {
  const isPreAnalise = (solicitacao: CorrespondenciaResponse) => {
    return (
      solicitacao.statusSolicitacao?.nmStatus === statusList.PRE_ANALISE.label ||
      solicitacao.statusSolicitacao?.idStatusSolicitacao === 1 ||
      getStatusText(solicitacao.statusCodigo?.toString() || '') === statusList.PRE_ANALISE.label
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-1 overflow-auto">
      <StickyTable>
        <StickyTableHeader>
          <StickyTableRow>
            <StickyTableHead
              className="cursor-pointer"
              onClick={() => handleSort('cdIdentificacao')}
            >
              <div className="flex items-center min-w-[120px]">
                Identificação
                <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
              </div>
            </StickyTableHead>
            <StickyTableHead
              className="cursor-pointer"
              onClick={() => handleSort('dsAssunto')}
            >
              <div className="flex items-center">
                Assunto
                <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
              </div>
            </StickyTableHead>
            <StickyTableHead>Áreas</StickyTableHead>
            <StickyTableHead
              className="cursor-pointer"
              onClick={() => handleSort('tema.nmTema')}
            >
              <div className="flex items-center">
                Tema
                <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
              </div>
            </StickyTableHead>
            <StickyTableHead className="min-w-[220px]">Progresso</StickyTableHead>
            <StickyTableHead className="min-w-[220px] text-center">
              Aprovação Gerente do Regulatório
            </StickyTableHead>
            <StickyTableHead
              className="cursor-pointer"
              onClick={() => handleSort('statusSolicitacao.nmStatus')}
            >
              <div className="flex items-center">
                Status
                <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
              </div>
            </StickyTableHead>
            <StickyTableHead className="text-right">Ações</StickyTableHead>
          </StickyTableRow>
        </StickyTableHeader>
        <StickyTableBody>
          {loading ? (
            <LoadingRows
              canAtualizarSolicitacao={canAtualizarSolicitacao}
              canDeletarSolicitacao={canDeletarSolicitacao}
            />
          ) : solicitacoes?.length === 0 ? (
            <StickyTableRow>
              <StickyTableCell colSpan={8} className="text-center py-8">
                <div className="flex flex-col items-center space-y-2">
                  <ClipboardTextIcon className="h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500">Nenhuma solicitação encontrada</p>
                </div>
              </StickyTableCell>
            </StickyTableRow>
          ) : (
            solicitacoes?.map((solicitacao: CorrespondenciaResponse) => (
              <React.Fragment key={solicitacao.idSolicitacao}>
                <StickyTableRow>
                  <StickyTableCell className="font-medium min-w-[120px]">
                    {solicitacao.cdIdentificacao}
                  </StickyTableCell>
                  <StickyTableCell className="max-w-xs truncate">
                    {solicitacao.dsAssunto}
                  </StickyTableCell>
                  <StickyTableCell>
                    <AreasCell
                      areas={solicitacao.area}
                      temaAreas={solicitacao.tema?.areas}
                      getJoinedNmAreas={getJoinedNmAreas}
                    />
                  </StickyTableCell>
                  <StickyTableCell>
                    {solicitacao.nmTema || solicitacao?.tema?.nmTema || '-'}
                  </StickyTableCell>
                  <StickyTableCell className="min-w-[220px]">
                    <TimeProgress
                      start={solicitacao.dtPrimeiraTramitacao}
                      end={solicitacao.dtPrazoLimite}
                      finishedAt={solicitacao.dtConclusaoTramitacao}
                      now={new Date().toISOString()}
                      statusLabel={solicitacao.statusSolicitacao?.nmStatus}
                    />
                  </StickyTableCell>
                  <StickyTableCell className="min-w-[220px] text-center">
                    {solicitacao.flExigeCienciaGerenteRegul === 'N'
                      ? 'Não, apenas ciência'
                      : solicitacao.flExigeCienciaGerenteRegul === 'S'
                      ? 'Sim'
                      : '-'}
                  </StickyTableCell>
                  <StickyTableCell>
                    <Badge
                      className="whitespace-nowrap truncate text-white"
                      variant={getStatusBadgeVariant(
                        solicitacao.statusSolicitacao?.idStatusSolicitacao?.toString() ||
                          solicitacao.statusCodigo?.toString() ||
                          ''
                      )}
                      style={{
                        backgroundColor: getStatusBadgeBg(
                          solicitacao.statusSolicitacao?.idStatusSolicitacao?.toString() ||
                            solicitacao.statusCodigo?.toString() ||
                            ''
                        ),
                      }}
                    >
                      {solicitacao.statusSolicitacao?.nmStatus ||
                        getStatusText(solicitacao.statusCodigo?.toString() || '') ||
                        '-'}
                    </Badge>
                  </StickyTableCell>
                  <StickyTableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {!isPreAnalise(solicitacao) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await openDetalhes(solicitacao);
                          }}
                          title="Enviar resposta"
                        >
                          <PaperPlaneRightIcon className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTramitacoes(solicitacao);
                        }}
                        title="Ver Tramitações"
                      >
                        <ClockCounterClockwiseIcon className="h-4 w-4" />
                      </Button>

                      {canAtualizarSolicitacao && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(solicitacao);
                          }}
                          title="Editar"
                        >
                          <PencilSimpleIcon className="h-4 w-4" />
                        </Button>
                      )}

                      {canDeletarSolicitacao && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(solicitacao);
                          }}
                          className="text-red-600 hover:text-red-700"
                          title="Excluir"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </StickyTableCell>
                </StickyTableRow>
              </React.Fragment>
            ))
          )}
        </StickyTableBody>
      </StickyTable>
    </div>
  );
}

// Subcomponente para células de áreas
interface AreasCellProps {
  areas: AreaSolicitacao[] | undefined;
  temaAreas: AreaSolicitacao[] | undefined;
  getJoinedNmAreas: (areas: AreaSolicitacao[] | undefined) => string;
}

function AreasCell({ areas, temaAreas, getJoinedNmAreas }: AreasCellProps) {
  const displayAreas = areas && areas.length > 0 ? areas : temaAreas;

  if (!displayAreas || displayAreas.length === 0) {
    return <span className="text-gray-400 text-sm">-</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center flex-wrap gap-1 cursor-help">
            {displayAreas.slice(0, 2).map((area: AreaSolicitacao) => (
              <span
                key={area.idArea}
                className="text-xs bg-gray-100 px-2 py-1 rounded"
              >
                {area.nmArea}
              </span>
            ))}
            {displayAreas.length > 2 && (
              <span className="text-xs text-gray-500 h-fit">
                +{displayAreas.length - 2} mais
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{getJoinedNmAreas(displayAreas)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
