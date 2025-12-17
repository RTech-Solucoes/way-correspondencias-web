'use client';

import { CheckCircle2, Clock, MessageSquare, Paperclip, X, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusSolicitacaoResponse } from '@/api/status-solicitacao/client';
import { statusListObrigacao } from '@/api/status-obrigacao/types';
import { TipoDocumentoAnexoEnum } from '@/api/anexos/type';
import { AnexoResponse } from '@/api/anexos/type';
import { perfilUtil } from '@/api/perfis/types';
import { useMemo } from 'react';
import { statusList } from '@/api/status-solicitacao/types';

interface ConferenciaFooterProps {
  statusSolicitacao?: StatusSolicitacaoResponse | null;
  isAdminOrGestor: boolean;
  flAprovarConferencia?: string | null;
  isUsuarioDaAreaAtribuida: boolean;
  idPerfil?: number | null;
  anexos?: AnexoResponse[];
  dsJustificativaAtraso?: string | null;
  canAprovarConferencia?: boolean | null;
  canSolicitarAjustes?: boolean | null;
  onAnexarCorrespondencia: () => void;
  onSolicitarAjustes: () => void;
  onAprovarConferencia: () => void;
  onReprovarConferencia?: () => void;
  onJustificarAtraso: () => void;
  onAnexarEvidencia: () => void;
  onEnviarParaAnalise: () => void;
  onEnviarParaTramitacao: () => void;
  isStatusDesabilitadoParaTramitacao: boolean;
}

export function ConferenciaFooter({
  statusSolicitacao,
  isAdminOrGestor,
  flAprovarConferencia,
  isUsuarioDaAreaAtribuida,
  idPerfil,
  anexos = [],
  dsJustificativaAtraso,
  canAprovarConferencia = true,
  canSolicitarAjustes = true,
  onAnexarCorrespondencia,
  onSolicitarAjustes,
  onAprovarConferencia,
  onReprovarConferencia,
  onJustificarAtraso,
  onAnexarEvidencia,
  onEnviarParaAnalise,
  onEnviarParaTramitacao,
  isStatusDesabilitadoParaTramitacao,
}: ConferenciaFooterProps) {

  const idStatusSolicitacao = statusSolicitacao?.idStatusSolicitacao ?? 0;

  const isStatusEmValidacaoRegulatorio = useMemo(() => {
    return idStatusSolicitacao === statusListObrigacao.EM_VALIDACAO_REGULATORIO.id;
  }, [idStatusSolicitacao]);

  const isStatusAtrasada = useMemo(() => {
    return idStatusSolicitacao === statusListObrigacao.ATRASADA.id;
  }, [idStatusSolicitacao]);

  const isStatusEmAndamento = useMemo(() => {
    return idStatusSolicitacao === statusListObrigacao.EM_ANDAMENTO.id;
  }, [idStatusSolicitacao]);

  const isStatusPermitidoEnviarReg = useMemo(() => {
    return isStatusEmAndamento || isStatusAtrasada;
  }, [isStatusEmAndamento, isStatusAtrasada]);

  const temEvidenciaCumprimento = useMemo(() => {
    return anexos.some(anexo => 
      anexo.tpDocumento === TipoDocumentoAnexoEnum.E || 
      anexo.tpDocumento === TipoDocumentoAnexoEnum.L
    );
  }, [anexos]);

  const temJustificativaAtraso = useMemo(() => {
    return !!dsJustificativaAtraso;
  }, [dsJustificativaAtraso]);

  const conferenciaAprovada = useMemo(() => {
    return flAprovarConferencia === 'S';
  }, [flAprovarConferencia]);

  const isPerfilPermitidoEnviarReg = useMemo(() => {
    const temPerfilPermitido = [perfilUtil.EXECUTOR_AVANCADO, perfilUtil.EXECUTOR, perfilUtil.EXECUTOR_RESTRITO].includes(idPerfil ?? 0);
    return temPerfilPermitido && isUsuarioDaAreaAtribuida;
  }, [idPerfil, isUsuarioDaAreaAtribuida]);

  const tooltipAnexarCorrespondencia = useMemo(() => {
    if (!conferenciaAprovada) {
      return 'É necessário aprovar a conferência antes de anexar correspondência.';
    }
    if (!isStatusEmValidacaoRegulatorio) {
      return 'Apenas é possível anexar correspondência quando o status for "Em Validação (Regulatório)".';
    }
    return '';
  }, [conferenciaAprovada, isStatusEmValidacaoRegulatorio]);

  const tooltipStatusValidacaoRegulatorio = useMemo(() => {
    if (conferenciaAprovada) {
      return 'A conferência já foi aprovada.';
    }
    if (!isStatusEmValidacaoRegulatorio) {
      return 'Só é possível realizar esta ação quando o status for "Em Validação (Regulatório)".';
    }
    return '';
  }, [isStatusEmValidacaoRegulatorio, conferenciaAprovada]);

  const tooltipJustificarAtraso = useMemo(() => {
    if (!isStatusAtrasada) {
      return '';
    }
    if (!isUsuarioDaAreaAtribuida) {
      return 'Apenas usuários da área atribuída podem justificar o atraso desta obrigação.';
    }
    return '';
  }, [isStatusAtrasada, isUsuarioDaAreaAtribuida]);

  const tooltipEnviarRegulatorio = useMemo(() => {
    if (!isPerfilPermitidoEnviarReg) {
      const temPerfilPermitido = [perfilUtil.EXECUTOR_AVANCADO, perfilUtil.EXECUTOR, perfilUtil.EXECUTOR_RESTRITO].includes(idPerfil ?? 0);

      if (!temPerfilPermitido) {
        return 'Apenas Executor Avançado, Executor, Executor Restrito podem enviar para análise do regulatório.';
      }
      if (!isUsuarioDaAreaAtribuida) {
        return 'Apenas usuários da área atribuída podem enviar para análise do regulatório.';
      }
      return 'Você não tem permissão para enviar para análise do regulatório.';
    }
    if (isStatusAtrasada && !temJustificativaAtraso) {
      return 'É necessário inserir a justificativa de atraso antes de enviar ao Regulatório.';
    }
    if (!temEvidenciaCumprimento) {
      if (isStatusAtrasada) {
        return 'É necessário anexar a evidência de cumprimento antes de enviar ao Regulatório.';
      }
      return 'É necessário anexar pelo menos uma evidência de cumprimento (arquivo ou link) antes de enviar para análise do regulatório.';
    }
    if (!isStatusPermitidoEnviarReg) {
      return 'Só é possível enviar para análise do regulatório quando o status for "Em Andamento" ou "Atrasada".';
    }
    return '';
  }, [isPerfilPermitidoEnviarReg, isStatusPermitidoEnviarReg, temEvidenciaCumprimento, isStatusAtrasada, temJustificativaAtraso, idPerfil, isUsuarioDaAreaAtribuida]);

  const tooltipAnexarEvidencia = useMemo(() => {
    if (!isStatusPermitidoEnviarReg) {
      return 'Apenas é possível anexar evidência de cumprimento quando o status for "Em Andamento" ou "Atrasada".';
    }
    return '';
  }, [isStatusPermitidoEnviarReg]);

  const podeEnviarParaAnalise = useMemo(() => {
    return isStatusPermitidoEnviarReg && 
           isPerfilPermitidoEnviarReg && 
           temEvidenciaCumprimento && 
           (!isStatusAtrasada || temJustificativaAtraso);
  }, [isStatusPermitidoEnviarReg, isPerfilPermitidoEnviarReg, temEvidenciaCumprimento, isStatusAtrasada, temJustificativaAtraso]);

  const isStatusBtnFlAprovar = useMemo(() => {
    return statusSolicitacao?.idStatusSolicitacao === statusList.EM_ANALISE_GERENTE_REGULATORIO.id ||
           statusSolicitacao?.idStatusSolicitacao === statusList.EM_APROVACAO.id;
  }, [statusSolicitacao?.idStatusSolicitacao]);

  const isPerfilPermitidoEnviarTramitacaoPorStatus = useMemo(() => {

    if (idStatusSolicitacao === statusList.EM_ANALISE_GERENTE_REGULATORIO.id){
      if (idPerfil === perfilUtil.ADMINISTRADOR) return true;
    }

    return false;

  }, [idPerfil, idStatusSolicitacao]);

  const tooltipPerfilPermitidoEnviarTramitacaoPorStatus = useMemo(() => {

    if (idStatusSolicitacao === statusList.PRE_ANALISE.id) {
        return 'Aguardando preencher todos dados para enviar para Tramitação';
    }

    if (idStatusSolicitacao === statusList.EM_ANALISE_GERENTE_REGULATORIO.id) {
      if (idPerfil === perfilUtil.ADMINISTRADOR) {
        return 'Apenas o Administrador pode aprovar ou reprovar';
      }
    }
      return '';
  }, [idStatusSolicitacao, idPerfil]);

  const textoBtnEnviarParaTramitacaoPorStatus = useMemo(() => {
    const textosPorStatus: Record<number, string> = {
      [statusList.PRE_ANALISE.id]: 'Enviar para Gerente do Regulatório',
    };
    
    return textosPorStatus[idStatusSolicitacao] ?? 'Enviar para Tramitação';
  }, [idStatusSolicitacao]);


  return (
    <footer className="fixed bottom-0 left-0 right-0 z-11 border-t border-gray-200 bg-white px-8 py-4">
      <div className="ml-auto flex w-full max-w-6xl flex-wrap items-center justify-end gap-3">
        {isAdminOrGestor && isStatusEmValidacaoRegulatorio ? (
          <>
            <Button
              type="button"
              className="flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onAnexarCorrespondencia}
              disabled={!isStatusEmValidacaoRegulatorio || !conferenciaAprovada}
              tooltip={tooltipAnexarCorrespondencia}
            >
              <Paperclip className="h-4 w-4" />
              Anexar correspondência
            </Button>
            {canSolicitarAjustes && (
              <Button
                type="button"
                className="flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onSolicitarAjustes}
                disabled={!isStatusEmValidacaoRegulatorio || conferenciaAprovada}
                tooltip={tooltipStatusValidacaoRegulatorio}
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
                disabled={!isStatusEmValidacaoRegulatorio || conferenciaAprovada}
                tooltip={tooltipStatusValidacaoRegulatorio}
              >
                <CheckCircle2 className="h-4 w-4" />
                Aprovar conferência
              </Button>
            )}
          </>
        ) : (
          <>
            {isStatusAtrasada && (
              <Button
                type="button"
                className="flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onJustificarAtraso}
                disabled={!isUsuarioDaAreaAtribuida}
                tooltip={tooltipJustificarAtraso}
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
                disabled={!isStatusPermitidoEnviarReg}
                tooltip={tooltipAnexarEvidencia}
              >
                <Paperclip className="h-4 w-4" />
                Anexar evidência de cumprimento
                </Button>
              <Button
                type="button"
                className="flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onEnviarParaAnalise}
                disabled={!podeEnviarParaAnalise}
                tooltip={tooltipEnviarRegulatorio}
              >
                <CheckCircle2 className="h-4 w-4" />
                Enviar para análise do regulatório
              </Button>
            </>
            )}
          </>
        )}
        {isStatusBtnFlAprovar && (
          <>
             <Button
              type="button"
              className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onReprovarConferencia}
              disabled={!isPerfilPermitidoEnviarTramitacaoPorStatus}
              tooltip={!isPerfilPermitidoEnviarTramitacaoPorStatus ? tooltipPerfilPermitidoEnviarTramitacaoPorStatus : ''}
            >
              <X className="h-4 w-4" />
              Reprovar
            </Button>

            <Button
              type="button"
              className="flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onAprovarConferencia}
              disabled={!isPerfilPermitidoEnviarTramitacaoPorStatus}
              tooltip={!isPerfilPermitidoEnviarTramitacaoPorStatus ? tooltipPerfilPermitidoEnviarTramitacaoPorStatus : ''}
            >
              <CheckSquare className="h-4 w-4" />
              Aprovar
            </Button>
          </>
        )}

        {!isStatusBtnFlAprovar && !isStatusDesabilitadoParaTramitacao && !isStatusEmValidacaoRegulatorio && (
          <Button
            type="button"
            className="flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onEnviarParaTramitacao}
            disabled={!isPerfilPermitidoEnviarTramitacaoPorStatus}
            tooltip={!isPerfilPermitidoEnviarTramitacaoPorStatus ? tooltipPerfilPermitidoEnviarTramitacaoPorStatus : ''}
          >
          <Paperclip className="h-4 w-4" />
          {textoBtnEnviarParaTramitacaoPorStatus}
          </Button>
        )}
      </div>
    </footer>
  );
}
