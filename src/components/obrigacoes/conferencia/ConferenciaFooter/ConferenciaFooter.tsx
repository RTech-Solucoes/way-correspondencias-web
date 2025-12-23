'use client';

import { CheckCircle2, Clock, MessageSquare, Paperclip, X, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { StatusSolicitacaoResponse } from '@/api/status-solicitacao/client';
import { ArquivoDTO } from '@/api/anexos/type';
import { AnexoResponse } from '@/api/anexos/type';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { TramitacaoComAnexosResponse, SolicitacaoAssinanteResponse } from '@/api/solicitacoes/types';
import { FlAprovadoTramitacaoEnum } from '@/api/tramitacoes/types';
import { useFooterStatus, useFooterPermissoes, useFooterTooltips } from './hooks';

interface ConferenciaFooterProps {
  statusSolicitacao?: StatusSolicitacaoResponse | null;
  isAdminOrGestor: boolean;
  flAprovarConferencia?: string | null;
  isUsuarioDaAreaAtribuida: boolean;
  idPerfil?: number | null;
  userResponsavel?: ResponsavelResponse | null;
  tramitacoes?: TramitacaoComAnexosResponse[];
  solicitacoesAssinantes?: SolicitacaoAssinanteResponse[];
  anexos?: AnexoResponse[];
  dsJustificativaAtraso?: string | null;
  canAprovarConferencia?: boolean | null;
  canSolicitarAjustes?: boolean | null;
  flExigeCienciaGerenteRegul?: string | null;
  isCienciaChecked?: boolean;
  onCienciaCheckedChange?: (checked: boolean) => void;
  onAnexarCorrespondencia: () => void;
  onSolicitarAjustes: () => void;
  onAprovarConferencia: () => void;
  onReprovarConferencia?: () => void;
  onAprovarReprovarTramitacao?: (flAprovado: FlAprovadoTramitacaoEnum) => void;
  onJustificarAtraso: () => void;
  onAnexarEvidencia: () => void;
  onEnviarParaAnalise: () => void;
  onEnviarParaTramitacao: () => void;
  isStatusDesabilitadoParaTramitacao: boolean;
  arquivosTramitacaoPendentes?: ArquivoDTO[];
}

export function ConferenciaFooter({
  statusSolicitacao,
  isAdminOrGestor,
  flAprovarConferencia,
  isUsuarioDaAreaAtribuida,
  idPerfil,
  userResponsavel,
  tramitacoes = [],
  solicitacoesAssinantes = [],
  anexos = [],
  dsJustificativaAtraso,
  canAprovarConferencia = true,
  canSolicitarAjustes = true,
  flExigeCienciaGerenteRegul,
  isCienciaChecked = false,
  onCienciaCheckedChange,
  onAnexarCorrespondencia,
  onSolicitarAjustes,
  onAprovarConferencia,
  onReprovarConferencia, // Mantido para compatibilidade, mas não usado quando onAprovarReprovarTramitacao está disponível
  onAprovarReprovarTramitacao,
  onJustificarAtraso,
  onAnexarEvidencia,
  onEnviarParaAnalise,
  onEnviarParaTramitacao,
  isStatusDesabilitadoParaTramitacao,
}: ConferenciaFooterProps) {

  const status = useFooterStatus({
    statusSolicitacao,
    anexos,
    dsJustificativaAtraso,
    flAprovarConferencia,
    flExigeCienciaGerenteRegul,
    isCienciaChecked,
    tramitacoes,
  });

  const permissoes = useFooterPermissoes({
    idPerfil,
    isUsuarioDaAreaAtribuida,
    userResponsavel,
    tramitacoes,
    solicitacoesAssinantes,
    idStatusSolicitacao: status.idStatusSolicitacao,
    flExigeCienciaGerenteRegul,
    isCienciaChecked,
    isStatusEmAnaliseGerenteRegulatorio: status.isStatusEmAnaliseGerenteRegulatorio,
    isStatusPermitidoEnviarReg: status.isStatusPermitidoEnviarReg,
    temEvidenciaCumprimento: status.temEvidenciaCumprimento,
    isStatusAtrasada: status.isStatusAtrasada,
    temJustificativaAtraso: status.temJustificativaAtraso,
  });

  const tooltips = useFooterTooltips({
    idPerfil,
    isUsuarioDaAreaAtribuida,
    idStatusSolicitacao: status.idStatusSolicitacao,
    userResponsavel,
    solicitacoesAssinantes,
    flExigeCienciaGerenteRegul,
    isCienciaChecked,
    isStatusEmValidacaoRegulatorio: status.isStatusEmValidacaoRegulatorio,
    isStatusEmAnaliseRegulatoria: status.isStatusEmAnaliseRegulatoria,
    isStatusAtrasada: status.isStatusAtrasada,
    isStatusPermitidoEnviarReg: status.isStatusPermitidoEnviarReg,
    isPerfilPermitidoEnviarReg: permissoes.isPerfilPermitidoEnviarReg,
    isDiretorJaAprovou: permissoes.isDiretorJaAprovou,
    conferenciaAprovada: status.conferenciaAprovada,
    temEvidenciaCumprimento: status.temEvidenciaCumprimento,
    temJustificativaAtraso: status.temJustificativaAtraso,
  });

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-11 border-t border-gray-200 bg-white px-8 py-4">
      <div className="ml-auto flex w-full max-w-6xl flex-wrap items-center justify-end gap-3">
        {status.isStatusEmAnaliseRegulatoria || (isAdminOrGestor && status.isStatusEmValidacaoRegulatorio) && (
        
        <Button
          type="button"
          className="flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onAnexarCorrespondencia}
          disabled={!status.conferenciaAprovada || (!status.isStatusEmValidacaoRegulatorio && !status.isStatusEmAnaliseRegulatoria)}
          tooltip={(!status.conferenciaAprovada || (!status.isStatusEmValidacaoRegulatorio && !status.isStatusEmAnaliseRegulatoria)) ? tooltips.tooltipAnexarCorrespondencia : ''}
        >
          <Paperclip className="h-4 w-4" />
          Anexar correspondência
        </Button>
        )}

        {isAdminOrGestor && status.isStatusEmValidacaoRegulatorio ? (
          <>
            {canSolicitarAjustes && (
              <Button
                type="button"
                className="flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onSolicitarAjustes}
                disabled={!status.isStatusEmValidacaoRegulatorio || status.conferenciaAprovada}
                tooltip={tooltips.tooltipStatusValidacaoRegulatorio}
              >
                <MessageSquare className="h-4 w-4" />
                Solicitar ajustes
              </Button>
            )}
            {canAprovarConferencia && (
              <Button
                type="button"
                className="flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onAprovarConferencia}
                disabled={!status.isStatusEmValidacaoRegulatorio || status.conferenciaAprovada}
                tooltip={tooltips.tooltipStatusValidacaoRegulatorio}
              >
                <CheckCircle2 className="h-4 w-4" />
                Aprovar conferência
              </Button>
            )}
          </>
        ) : (
          <>
            {status.isStatusAtrasada && (
              <Button
                type="button"
                className="flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onJustificarAtraso}
                disabled={!isUsuarioDaAreaAtribuida}
                tooltip={tooltips.tooltipJustificarAtraso}
              >
                <Clock className="h-4 w-4" />
                Inserir Justificativa de Atraso
              </Button>
            )}
            {isStatusDesabilitadoParaTramitacao && (
              <>
                <Button
                  type="button"
                  className="flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={onAnexarEvidencia}
                  disabled={!status.isStatusPermitidoEnviarReg}
                  tooltip={tooltips.tooltipAnexarEvidencia}
                >
                  <Paperclip className="h-4 w-4" />
                  Anexar evidência de cumprimento
                </Button>
                <Button
                  type="button"
                  className="flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={onEnviarParaAnalise}
                  disabled={!permissoes.podeEnviarParaAnalise}
                  tooltip={tooltips.tooltipEnviarRegulatorio}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Enviar para análise do regulatório
                </Button>
              </>
            )}
          </>
        )}

        {status.isStatusBtnFlAprovar && (
          <>
            <Button
              type="button"
              className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                if (onReprovarConferencia) {
                  onReprovarConferencia();
                } else if (onAprovarReprovarTramitacao) {
                  onAprovarReprovarTramitacao(FlAprovadoTramitacaoEnum.N);
                }
              }}
              disabled={!permissoes.isPerfilPermitidoEnviarTramitacaoPorStatus}
              tooltip={!permissoes.isPerfilPermitidoEnviarTramitacaoPorStatus ? tooltips.tooltipPerfilPermitidoEnviarTramitacaoPorStatus : ''}
            >
              <X className="h-4 w-4" />
              Reprovar
            </Button>

            <Button
              type="button"
              className="flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                if (onAprovarReprovarTramitacao) {
                  onAprovarReprovarTramitacao(FlAprovadoTramitacaoEnum.S);
                } else {
                  onAprovarConferencia();
                }
              }}
              disabled={!permissoes.isPerfilPermitidoEnviarTramitacaoPorStatus}
              tooltip={!permissoes.isPerfilPermitidoEnviarTramitacaoPorStatus ? tooltips.tooltipPerfilPermitidoEnviarTramitacaoPorStatus : ''}
            >
              <CheckSquare className="h-4 w-4" />
              Aprovar
            </Button>
          </>
        )}

        {status.isStatusEmAnaliseGerenteRegulatorio && status.flExigeCienciaGerenteRegul === 'N' && (
          <div>
            <div className="flex items-center gap-3 bg-blue-50/50 px-5 py-2.5 rounded-full border border-blue-100 shadow-sm transition-all hover:bg-blue-50">
              <Checkbox
                id="ciencia-checkbox"
                checked={isCienciaChecked}
                onCheckedChange={(checked) => onCienciaCheckedChange?.(!!checked)}
                className="h-5 w-5 border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label
                htmlFor="ciencia-checkbox"
                className="text-sm font-semibold text-blue-900 cursor-pointer whitespace-nowrap select-none"
              >
                Declaro estar ciente da solicitação e de seu conteúdo
              </Label>
            </div>
          </div>
        )}

        {!status.isStatusBtnFlAprovar && !isStatusDesabilitadoParaTramitacao && !status.isStatusEmValidacaoRegulatorio && (
          <Button
            type="button"
            className="flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onEnviarParaTramitacao}
            disabled={!permissoes.isPerfilPermitidoEnviarTramitacaoPorStatus}
            tooltip={!permissoes.isPerfilPermitidoEnviarTramitacaoPorStatus ? tooltips.tooltipPerfilPermitidoEnviarTramitacaoPorStatus : ''}
          >
            <Paperclip className="h-4 w-4" />
            {status.textoBtnEnviarParaTramitacaoPorStatus}
          </Button>
        )}
      </div>
    </footer>
  );
}
