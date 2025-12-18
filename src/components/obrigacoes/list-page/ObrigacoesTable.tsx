'use client';

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowsDownUpIcon } from "@phosphor-icons/react";
import { ObrigacaoResponse } from "@/api/obrigacao/types";
import { getObrigacaoStatusStyle } from "@/utils/obrigacoes/status";
import { formatDateBr } from "@/utils/utils";
import { TipoEnum } from "@/api/tipos/types";
import TimeProgress from "@/components/ui/time-progress";
import { ObrigacaoAcoesMenu } from "@/components/obrigacoes/ObrigacaoAcoesMenu";

interface ObrigacoesTableProps {
  obrigacoes: ObrigacaoResponse[];
  loading: boolean;
  isAdminOrGestor: boolean;
  handleSort: (field: string) => void;
  canInserirObrigacao: boolean;
  canConcluirObrigacao: boolean;
  canEnviarAreasObrigacao: boolean;
  canNaoAplicavelSuspensaObrigacao: boolean;
  canDeletarObrigacao: boolean;
  onVisualizar: (obrigacao: ObrigacaoResponse) => void;
  onEditar: (obrigacao: ObrigacaoResponse) => void;
  onAnexarProtocolo: (obrigacao: ObrigacaoResponse) => void;
  onEncaminharTramitacao: (obrigacao: ObrigacaoResponse) => void;
  onEnviarArea: (obrigacao: ObrigacaoResponse) => void;
  onNaoAplicavelSuspenso: (obrigacao: ObrigacaoResponse) => void;
  onExcluir: (obrigacao: ObrigacaoResponse) => void;
}

export function ObrigacoesTable({
  obrigacoes,
  loading,
  isAdminOrGestor,
  handleSort,
  canInserirObrigacao,
  canConcluirObrigacao,
  canEnviarAreasObrigacao,
  canNaoAplicavelSuspensaObrigacao,
  canDeletarObrigacao,
  onVisualizar,
  onEditar,
  onAnexarProtocolo,
  onEncaminharTramitacao,
  onEnviarArea,
  onNaoAplicavelSuspenso,
  onExcluir,
}: ObrigacoesTableProps) {
  
  function getProgressEndDate(obrigacao: ObrigacaoResponse) {
    if (isAdminOrGestor) {
      return obrigacao.dtLimite || null;
    }
    return obrigacao.dtTermino || null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="min-w-[200px] cursor-pointer"
                onClick={() => handleSort('cdIdentificacao')}
              >
                <div className="flex items-center">
                  Identificação
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="min-w-[250px]">Tarefa</TableHead>
              <TableHead className="min-w-[150px]">Tema</TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('statusSolicitacao.nmStatus')}
              >
                <div className="flex items-center">
                  Status
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="min-w-[150px] cursor-pointer"
                onClick={() => handleSort('areas')}
              >
                <div className="flex items-center">
                  Atribuído a
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead 
                className="cursor-pointer whitespace-nowrap"
                onClick={() => handleSort('dtTermino')}
              >
                <div className="flex items-center">
                  <span className="whitespace-nowrap">Data de Término</span>
                  <ArrowsDownUpIcon className="ml-1 h-4 w-4 flex-shrink-0" />
                </div>
              </TableHead>
              {isAdminOrGestor && (
                <TableHead 
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort('dtLimite')}
                >
                  <div className="flex items-center">
                    <span className="whitespace-nowrap">Data Limite</span>
                    <ArrowsDownUpIcon className="ml-1 h-4 w-4 flex-shrink-0" />
                  </div>
                </TableHead>
              )}
              {isAdminOrGestor && (
                <TableHead className="min-w-[150px] text-center">Enviado para Áreas</TableHead>
              )}
              <TableHead className="w-[100px] text-center sticky right-0 bg-white z-10 shadow-sm">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isAdminOrGestor ? 10 : 8} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : obrigacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdminOrGestor ? 10 : 8} className="text-center py-8 text-gray-500">
                  Nenhuma obrigação encontrada
                </TableCell>
              </TableRow>
            ) : (
              obrigacoes.map((obrigacao) => (
                <TableRow key={obrigacao.idSolicitacao}>
                  <TableCell className="font-medium min-w-[200px]">{obrigacao.cdIdentificacao || '-'}</TableCell>
                  <TableCell className="min-w-[250px]">
                    <div className="line-clamp-4" title={obrigacao.dsTarefa || undefined}>
                      {obrigacao.dsTarefa || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[150px]">{obrigacao.tema?.nmTema || '-'}</TableCell>
                  <TableCell className="min-w-[150px]">
                    {(() => {
                      const statusStyle = getObrigacaoStatusStyle(
                        obrigacao.statusSolicitacao?.idStatusSolicitacao?.toString(),
                        obrigacao.statusSolicitacao?.nmStatus
                      );
                      return (
                        <Badge
                          className="whitespace-nowrap truncate"
                          variant={statusStyle.variant}
                          style={{
                            backgroundColor: statusStyle.backgroundColor,
                            color: statusStyle.textColor,
                          }}
                        >
                          {obrigacao.statusSolicitacao?.nmStatus || '-'}
                        </Badge>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    {obrigacao.areas && obrigacao.areas.length > 0 
                      ? (obrigacao.areas.find(a => a.tipoArea?.cdTipo === TipoEnum.ATRIBUIDA)?.nmArea)
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const startDate = obrigacao.dtInicio;
                      const endDate = getProgressEndDate(obrigacao);
                      const hasRequiredDates = startDate && endDate;

                      if (!hasRequiredDates) {
                        return (
                          <span className="text-gray-400 text-sm">
                            Preencha corretamente as datas de início e fim para exibir o progresso
                          </span>
                        );
                      }

                      return (
                        <TimeProgress
                          start={
                            startDate
                              ? startDate.includes('T')
                                ? startDate
                                : `${startDate}T00:00:00`
                              : null
                          }
                          end={
                            endDate
                              ? endDate.includes('T')
                                ? endDate
                                : `${endDate}T23:59:59`
                              : null
                          }
                          finishedAt={obrigacao.dtConclusaoTramitacao}
                          now={new Date().toISOString()}
                          statusLabel={obrigacao.statusSolicitacao?.nmStatus}
                        />
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    {obrigacao.dtTermino 
                      ? formatDateBr(obrigacao.dtTermino)
                      : '-'
                    }
                  </TableCell>
                  {isAdminOrGestor && (
                    <TableCell>
                      {obrigacao.dtLimite 
                        ? formatDateBr(obrigacao.dtLimite)
                        : '-'
                      }
                    </TableCell>
                  )}
                  {isAdminOrGestor && (
                    <TableCell className="text-center">
                      {obrigacao.flEnviandoArea === 'S' ? 'Sim' : 'Não'}
                    </TableCell>
                  )}
                  <TableCell className="text-center sticky right-0 bg-white z-10 shadow-sm">
                    <div className="flex items-center justify-center">
                      <ObrigacaoAcoesMenu
                        obrigacao={obrigacao}
                        onVisualizar={() => onVisualizar(obrigacao)}
                        onEditar={canInserirObrigacao ? () => onEditar(obrigacao) : undefined}
                        onAnexarProtocolo={canConcluirObrigacao ? () => onAnexarProtocolo(obrigacao) : undefined}
                        onEncaminharTramitacao={() => onEncaminharTramitacao(obrigacao)}
                        onEnviarArea={canEnviarAreasObrigacao ? () => onEnviarArea(obrigacao) : undefined}
                        onNaoAplicavelSuspenso={canNaoAplicavelSuspensaObrigacao ? () => onNaoAplicavelSuspenso(obrigacao) : undefined}
                        onExcluir={canDeletarObrigacao ? () => onExcluir(obrigacao) : undefined}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

