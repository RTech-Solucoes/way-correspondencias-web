'use client';

import { CheckCircle2, Clock, MessageSquare, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConferenciaFooterProps {
  isAdminOrGestor: boolean;
  isStatusEmValidacaoRegulatorio: boolean;
  conferenciaAprovada: boolean;
  isStatusAtrasada: boolean;
  isUsuarioDaAreaAtribuida: boolean;
  isStatusPermitidoEnviarReg: boolean;
  isPerfilPermitidoEnviarReg: boolean;
  temEvidenciaCumprimento: boolean;
  temJustificativaAtraso: boolean;
  tooltipAnexarCorrespondencia: string;
  tooltipStatusValidacaoRegulatorio: string;
  tooltipJustificarAtraso: string;
  tooltipEnviarRegulatorio: string;
  onAnexarCorrespondencia: () => void;
  onSolicitarAjustes: () => void;
  onAprovarConferencia: () => void;
  onJustificarAtraso: () => void;
  onAnexarEvidencia: () => void;
  onEnviarParaAnalise: () => void;
}

export function ConferenciaFooter({
  isAdminOrGestor,
  isStatusEmValidacaoRegulatorio,
  conferenciaAprovada,
  isStatusAtrasada,
  isUsuarioDaAreaAtribuida,
  isStatusPermitidoEnviarReg,
  isPerfilPermitidoEnviarReg,
  temEvidenciaCumprimento,
  temJustificativaAtraso,
  tooltipAnexarCorrespondencia,
  tooltipStatusValidacaoRegulatorio,
  tooltipJustificarAtraso,
  tooltipEnviarRegulatorio,
  onAnexarCorrespondencia,
  onSolicitarAjustes,
  onAprovarConferencia,
  onJustificarAtraso,
  onAnexarEvidencia,
  onEnviarParaAnalise,
}: ConferenciaFooterProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-11 border-t border-gray-200 bg-white px-8 py-4">
      <div className="ml-auto flex w-full max-w-6xl flex-wrap items-center justify-end gap-3">
        {isAdminOrGestor ? (
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
            <Button
              type="button"
              className="flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onAnexarEvidencia}
              disabled={!isStatusPermitidoEnviarReg}
              tooltip={!isStatusPermitidoEnviarReg ? 'Apenas é possível anexar evidência de cumprimento quando o status for "Em Andamento" ou "Atrasada".' : ''}
            >
              <Paperclip className="h-4 w-4" />
              Anexar evidência de cumprimento
            </Button>
            <Button
              type="button"
              className="flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onEnviarParaAnalise}
              disabled={!isStatusPermitidoEnviarReg || !isPerfilPermitidoEnviarReg || !temEvidenciaCumprimento || (isStatusAtrasada && !temJustificativaAtraso)}
              tooltip={tooltipEnviarRegulatorio}
            >
              <CheckCircle2 className="h-4 w-4" />
              Enviar para análise do regulatório
            </Button>
          </>
        )}
      </div>
    </footer>
  );
}

