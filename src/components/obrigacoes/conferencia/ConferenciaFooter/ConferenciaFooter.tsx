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
import { useMemo } from 'react';
import { perfilUtil } from '@/api/perfis/types';
import { ActionWithHelp } from '@/components/help-tooltip';

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
  idObrigacao?: number;
  onAnexarProtocoloSuccess?: () => void;
  onAnexarProtocoloClick?: () => void;
}

const HELP_EVIDENCIA =
  'Comprova o cumprimento da obrigação. Será analisada pelo Regulatório e pode ser enviada como arquivo ou URL.';

const HELP_ENVIAR_REGULATORIO =
  'Envia a obrigação para validação do Regulatório. Após o envio, a Área não edita até a análise ou a devolução para ajustes.';

const HELP_APROVAR_CONFERENCIA =
  'Aprova a evidência e bloqueia os campos estruturais da obrigação. Comentários, anexos auxiliares e correspondência continuam disponíveis.';

const HELP_SOLICITAR_AJUSTES =
  'Devolve a obrigação para a Área. Exige comentário com a justificativa; o reenvio depende de nova evidência.';

const HELP_JUSTIFICATIVA_ATRASO =
  'Só pode ser incluída quando a obrigação estiver atrasada. O texto da justificativa é obrigatório.';

const HELP_ANEXAR_CORRESPONDENCIA =
  'Anexa o documento oficial de formalização do cumprimento. Integra o registro oficial da obrigação e continua disponível após a aprovação da conferência, mesmo com os campos estruturais bloqueados.';

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
  idObrigacao,
  onAnexarProtocoloClick,
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
    anexos,
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
    isStatusVencidoRegulatorio: status.isStatusVencidoRegulatorio,
    isStatusAtrasada: status.isStatusAtrasada,
    isStatusPermitidoEnviarReg: status.isStatusPermitidoEnviarReg,
    isPerfilPermitidoEnviarReg: permissoes.isPerfilPermitidoEnviarReg,
    isDiretorJaAprovou: permissoes.isDiretorJaAprovou,
    conferenciaAprovada: status.conferenciaAprovada,
    temEvidenciaCumprimento: status.temEvidenciaCumprimento,
    temJustificativaAtraso: status.temJustificativaAtraso,
    isReprovadoEmAprovacaoStatusAtualAnaliseRegulatoria: permissoes.isReprovadoEmAprovacaoStatusAtualAnaliseRegulatoria,
  });

  const isStatusBtnEnviarParaTramitacao = useMemo(() => {
    return (
      !status.isStatusBtnFlAprovar &&
      !isStatusDesabilitadoParaTramitacao &&
      !status.isStatusEmValidacaoRegulatorio &&
      !status.isStatusAprovacaoTramitacao &&
      !status.isStatusConcluido
    )
  }, [status.isStatusBtnFlAprovar,
    isStatusDesabilitadoParaTramitacao,
    status.isStatusEmValidacaoRegulatorio,
    status.isStatusAprovacaoTramitacao,
    status.isStatusConcluido
  ]);

  const isPermitidoAnexarEvidencia = useMemo(() => {
    return (
          (idPerfil === perfilUtil.EXECUTOR_AVANCADO ||
          idPerfil === perfilUtil.EXECUTOR ||
          idPerfil === perfilUtil.EXECUTOR_RESTRITO) &&
         (status.isStatusPermitidoEnviarReg)
      );
  }, [status.isStatusPermitidoEnviarReg, idPerfil]);

  const podeMostrarBotaoAnexarCorrespondencia = useMemo(() => {
    return status.isStatusEmAnaliseRegulatoria || 
           status.isStatusEmValidacaoRegulatorio || 
           status.isStatusVencidoRegulatorio;
  }, [status.isStatusEmAnaliseRegulatoria, status.isStatusEmValidacaoRegulatorio, status.isStatusVencidoRegulatorio]);

  const isBotaoAnexarCorrespondenciaDesabilitado = useMemo(() => {
    return !status.conferenciaAprovada || 
           (!status.isStatusEmValidacaoRegulatorio && 
            !status.isStatusEmAnaliseRegulatoria && 
            !status.isStatusVencidoRegulatorio);
  }, [status.conferenciaAprovada, status.isStatusEmValidacaoRegulatorio, status.isStatusEmAnaliseRegulatoria, status.isStatusVencidoRegulatorio]);

  const isPermitidoVizualizarBtnCienciaConteudoObrig = useMemo(() => {

    return (
      (idPerfil === perfilUtil.ADMINISTRADOR || idPerfil === perfilUtil.SUPER_ADMIN) &&
      status.isStatusEmAnaliseGerenteRegulatorio && status.flExigeCienciaGerenteRegul === 'N'
    )
  }, [idPerfil, status.isStatusEmAnaliseGerenteRegulatorio, status.flExigeCienciaGerenteRegul]);

  const anexarEvidenciaButton = (
    <Button
      type="button"
      className="flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={onAnexarEvidencia}
      disabled={!isPermitidoAnexarEvidencia}
      tooltip={!isPermitidoAnexarEvidencia ? tooltips.tooltipAnexarEvidencia : ''}
    >
      <Paperclip className="h-4 w-4" />
      Anexar evidência de cumprimento
    </Button>
  );

  const enviarRegulatorioButton = (
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
  );

  const conferenciaJaAprovada =
    !status.isStatusEmValidacaoRegulatorio || status.conferenciaAprovada;

  const solicitarAjustesButton = (
    <Button
      type="button"
      className="flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={onSolicitarAjustes}
      disabled={conferenciaJaAprovada}
      tooltip={tooltips.tooltipStatusValidacaoRegulatorio}
    >
      <MessageSquare className="h-4 w-4" />
      Solicitar ajustes
    </Button>
  );

  const aprovarConferenciaButton = (
    <Button
      type="button"
      className="flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={onAprovarConferencia}
      disabled={conferenciaJaAprovada}
      tooltip={tooltips.tooltipStatusValidacaoRegulatorio}
    >
      <CheckCircle2 className="h-4 w-4" />
      Aprovar conferência
    </Button>
  );

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-11 border-t border-gray-200 bg-white px-8 py-4 h-[73px]">
      <div className="ml-auto flex w-full max-w-6xl flex-wrap items-center justify-end gap-3">
        {isAdminOrGestor &&
          podeMostrarBotaoAnexarCorrespondencia &&
          (!isBotaoAnexarCorrespondenciaDesabilitado ? (
            <ActionWithHelp
              help={HELP_ANEXAR_CORRESPONDENCIA}
              helpLabel="Anexar correspondência"
            >
              <Button
                type="button"
                className="flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onAnexarCorrespondencia}
              >
                <Paperclip className="h-4 w-4" />
                Anexar correspondência
              </Button>
            </ActionWithHelp>
          ) : (
            <Button
              type="button"
              className="flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onAnexarCorrespondencia}
              disabled
              tooltip={tooltips.tooltipAnexarCorrespondencia}
            >
              <Paperclip className="h-4 w-4" />
              Anexar correspondência
            </Button>
          ))}

        {isAdminOrGestor && status.isStatusEmValidacaoRegulatorio ? (
          <>
            {canSolicitarAjustes &&
              (!conferenciaJaAprovada ? (
                <ActionWithHelp
                  help={HELP_SOLICITAR_AJUSTES}
                  helpLabel="Solicitar ajustes"
                >
                  {solicitarAjustesButton}
                </ActionWithHelp>
              ) : (
                solicitarAjustesButton
              ))}
            {canAprovarConferencia &&
              (!conferenciaJaAprovada ? (
                <ActionWithHelp
                  help={HELP_APROVAR_CONFERENCIA}
                  helpLabel="Aprovar conferência"
                >
                  {aprovarConferenciaButton}
                </ActionWithHelp>
              ) : (
                aprovarConferenciaButton
              ))}
          </>
        ) : (
          <>
            {status.isStatusAtrasada &&
              (isUsuarioDaAreaAtribuida ? (
                <ActionWithHelp
                  help={HELP_JUSTIFICATIVA_ATRASO}
                  helpLabel="Justificativa de atraso"
                >
                  <Button
                    type="button"
                    className="flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onJustificarAtraso}
                  >
                    <Clock className="h-4 w-4" />
                    Inserir Justificativa de Atraso
                  </Button>
                </ActionWithHelp>
              ) : (
                <Button
                  type="button"
                  className="flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={onJustificarAtraso}
                  disabled
                  tooltip={tooltips.tooltipJustificarAtraso}
                >
                  <Clock className="h-4 w-4" />
                  Inserir Justificativa de Atraso
                </Button>
              ))}
            {isStatusDesabilitadoParaTramitacao && (
              <>
                {isPermitidoAnexarEvidencia ? (
                  <ActionWithHelp
                    help={HELP_EVIDENCIA}
                    helpLabel="Anexar evidência de cumprimento"
                  >
                    {anexarEvidenciaButton}
                  </ActionWithHelp>
                ) : (
                  anexarEvidenciaButton
                )}
                {permissoes.isPerfilPermitidoEnviarReg ? (
                  <ActionWithHelp
                    help={HELP_ENVIAR_REGULATORIO}
                    helpLabel="Enviar para análise do regulatório"
                  >
                    {enviarRegulatorioButton}
                  </ActionWithHelp>
                ) : (
                  enviarRegulatorioButton
                )}
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

        { isPermitidoVizualizarBtnCienciaConteudoObrig && (
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
                Declaro estar ciente da obrigação e de seu conteúdo
              </Label>
            </div>
          </div>
        )}

        {isStatusBtnEnviarParaTramitacao && (
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

        {status.isStatusAprovacaoTramitacao && (
          <Button
            type="button"
            className="flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              if (onAnexarProtocoloClick) {
                onAnexarProtocoloClick();
              }
            }}
            disabled={!permissoes.isPerfilPermitidoEnviarTramitacaoPorStatus || !idObrigacao || !onAnexarProtocoloClick}
            tooltip={!permissoes.isPerfilPermitidoEnviarTramitacaoPorStatus ? tooltips.tooltipPerfilPermitidoEnviarTramitacaoPorStatus : ''}
          >
            <Paperclip className="h-4 w-4" />
            Anexar Protocolo
          </Button>
        )}

      </div>
    </footer>
  );
}
