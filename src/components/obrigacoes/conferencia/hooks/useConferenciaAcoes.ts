import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import obrigacaoClient from '@/api/obrigacao/client';
import tramitacoesClient from '@/api/tramitacoes/client';
import { FlAprovadoTramitacaoEnum, TramitacaoRequest } from '@/api/tramitacoes/types';
import { authClient } from '@/api/auth/client';
import { solicitacaoParecerClient } from '@/api/solicitacao-parecer/client';
import { formatDateISOWithoutTimezone } from '@/utils/utils';
import { ArquivoDTO } from '@/api/anexos/type';
import { statusList } from '@/api/status-solicitacao/types';
import { ObrigacaoDetalheResponse } from '@/api/obrigacao/types';

interface UseConferenciaAcoesProps {
  obrigacaoId?: number;
  statusId?: number;
  detalhe: ObrigacaoDetalheResponse | null;
  dsJustificativaAtraso?: string | null;
  isStatusAtrasada: boolean;
  temEvidenciaCumprimento: boolean;
  temJustificativaAtraso: boolean;
  arquivosTramitacaoPendentes: ArquivoDTO[];
  comentarioActionsRef: React.MutableRefObject<{
    get: () => string;
    reset: () => void;
    getTramitacaoRef: () => number | null;
    getParecerRef: () => number | null;
  } | null>;
  reloadDetalhe: () => Promise<void>;
  onSuccess?: () => void;
}

export function useConferenciaAcoes({
  obrigacaoId,
  statusId,
  detalhe,
  dsJustificativaAtraso,
  isStatusAtrasada,
  temEvidenciaCumprimento,
  temJustificativaAtraso,
  arquivosTramitacaoPendentes,
  comentarioActionsRef,
  reloadDetalhe,
  onSuccess,
}: UseConferenciaAcoesProps) {
  const [loading, setLoading] = useState(false);

  const limparEstadoAposAcao = useCallback(() => {
    comentarioActionsRef.current?.reset();
  }, [comentarioActionsRef]);

  const confirmarSolicitarAjustes = useCallback(async () => {
    if (!obrigacaoId) {
      toast.error('Dados da obrigação incompletos.');
      return;
    }
    
    setLoading(true);
    try {
      await tramitacoesClient.tramitarViaFluxo({
        idSolicitacao: obrigacaoId,
        dsObservacao: 'Obrigação solicitada de ajustes. Volta para área atribuída',
        flAprovado: FlAprovadoTramitacaoEnum.N,
        arquivos: arquivosTramitacaoPendentes,
      });
      
      limparEstadoAposAcao();
      await reloadDetalhe();
      toast.success('Obrigação enviada para ajustes da área atribuída.');
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao solicitar ajustes:', error);
      toast.error('Erro ao solicitar ajustes.');
    } finally {
      setLoading(false);
    }
  }, [obrigacaoId, arquivosTramitacaoPendentes, limparEstadoAposAcao, reloadDetalhe, onSuccess]);

  const handleAprovarReprovarTramitacao = useCallback(async (flAprovado: FlAprovadoTramitacaoEnum) => {
    if (!obrigacaoId) {
      toast.error('Dados da obrigação incompletos.');
      return;
    }

    const comentarioTexto = comentarioActionsRef.current?.get() || '';
    const textoTrimmed = comentarioTexto.trim();

    if (!textoTrimmed) {
      toast.error('É necessário escrever um comentário antes de enviar.');
      return;
    }

    const idTramitacaoRef = comentarioActionsRef.current?.getTramitacaoRef?.() ?? undefined;

    setLoading(true);
    try {
      const tramitacaoRequest: TramitacaoRequest = {
        idSolicitacao: obrigacaoId,
        dsObservacao: textoTrimmed,
        flAprovado,
        arquivos: arquivosTramitacaoPendentes,
        idTramitacaoRef,
      };

      await tramitacoesClient.tramitarViaFluxo(tramitacaoRequest);
      
      limparEstadoAposAcao();
      await reloadDetalhe();
      toast.success(
        flAprovado === FlAprovadoTramitacaoEnum.S 
          ? 'Obrigação aprovada com sucesso!'
          : 'Obrigação reprovada com sucesso!'
      );
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao tramitar:', error);
      toast.error('Erro ao processar tramitação.');
    } finally {
      setLoading(false);
    }
  }, [obrigacaoId, arquivosTramitacaoPendentes, comentarioActionsRef, limparEstadoAposAcao, reloadDetalhe, onSuccess]);

  const confirmarAprovarConferencia = useCallback(async () => {
    if (!obrigacaoId || !statusId) {
      toast.error('Dados da obrigação incompletos.');
      return;
    }
    
    setLoading(true);
    try {
      await Promise.all([
        obrigacaoClient.atualizar(obrigacaoId, {
          flAprovarConferencia: 'S',
        }),
        
        solicitacaoParecerClient.criar({
          idSolicitacao: obrigacaoId,
          idStatusSolicitacao: statusId,
          dsDarecer: 'Obrigação aprovada na conferência.',
          arquivos: arquivosTramitacaoPendentes,
        }),
      ]);
      
      limparEstadoAposAcao();
      await reloadDetalhe();
      toast.success('Conferência aprovada com sucesso!');
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao aprovar conferência:', error);
      toast.error('Erro ao aprovar conferência.');
    } finally {
      setLoading(false);
    }
  }, [obrigacaoId, statusId, arquivosTramitacaoPendentes, limparEstadoAposAcao, reloadDetalhe, onSuccess]);

  const confirmarJustificarAtraso = useCallback(async (justificativa: string) => {
    if (!obrigacaoId) {
      toast.error('Dados da obrigação incompletos.');
      return;
    }

    const idResponsavel = authClient.getUserIdResponsavelFromToken();
    if (!idResponsavel) {
      toast.error('Usuário não autenticado.');
      return;
    }

    const dtJustificativaAtraso = formatDateISOWithoutTimezone();
   
    setLoading(true);
    try {
      await obrigacaoClient.atualizar(obrigacaoId, {
        idResponsavelJustifAtraso: idResponsavel,
        dsJustificativaAtraso: justificativa,
        dtJustificativaAtraso: dtJustificativaAtraso,
      });

      await reloadDetalhe();
      toast.success('Atraso justificado com sucesso!');
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao justificar atraso:', error);
      toast.error('Erro ao justificar atraso.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [obrigacaoId, reloadDetalhe, onSuccess]);

  const confirmarEnviarParaAnalise = useCallback(async () => {
    if (!obrigacaoId || !statusId) {
      toast.error('Dados da obrigação incompletos.');
      return;
    }
    
    const idResponsavelTecnico = authClient.getUserIdResponsavelFromToken();
    if (!idResponsavelTecnico) {
      toast.error('Usuário não autenticado.');
      return;
    }

    if (isStatusAtrasada) {
      if (!temJustificativaAtraso) {
        toast.error('É necessário inserir a justificativa de atraso antes de enviar ao Regulatório.');
        return;
      }
      if (!temEvidenciaCumprimento) {
        toast.error('É necessário anexar a evidência de cumprimento antes de enviar ao Regulatório.');
        return;
      }
    }
    
    setLoading(true);
    try {
      const observacaoTramitacao = isStatusAtrasada && dsJustificativaAtraso
        ? 'Obrigação enviada ao Regulatório com atraso justificado'
        : 'Obrigação enviada para Em Validação (Regulatório).';

      const idTramitacaoRef = comentarioActionsRef.current?.getTramitacaoRef?.() ?? undefined;

      const tramitacaoRequest: TramitacaoRequest = {
        idSolicitacao: obrigacaoId,
        dsObservacao: observacaoTramitacao,
        arquivos: arquivosTramitacaoPendentes,
        idTramitacaoRef,
      };

      await tramitacoesClient.tramitarViaFluxo(tramitacaoRequest);
      
      limparEstadoAposAcao();
      await obrigacaoClient.atualizar(obrigacaoId, {
        idResponsavelTecnico: idResponsavelTecnico,
      });
      
      await reloadDetalhe();
      toast.success('Evidência de cumprimento enviada para análise do regulatório');
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao enviar obrigação para análise do regulatório:', error);
      toast.error('Erro ao enviar obrigação para análise do regulatório.');
    } finally {
      setLoading(false);
    }
  }, [
    obrigacaoId,
    statusId,
    dsJustificativaAtraso,
    isStatusAtrasada,
    temEvidenciaCumprimento,
    temJustificativaAtraso,
    arquivosTramitacaoPendentes,
    comentarioActionsRef,
    limparEstadoAposAcao,
    reloadDetalhe,
    onSuccess,
  ]);

  const handleEnviarParaTramitacao = useCallback(async () => {
    if (!obrigacaoId) {
      toast.error('Dados da obrigação incompletos.');
      return;
    }

    const comentarioTexto = comentarioActionsRef.current?.get() || '';
    const textoTrimmed = comentarioTexto.trim();

    if (!textoTrimmed) {
      toast.error('É necessário escrever um comentário antes de enviar.');
      return;
    }

    const idTramitacaoRef = comentarioActionsRef.current?.getTramitacaoRef?.() ?? undefined;

    setLoading(true);
    try {
      let flAprovado = undefined;

      if (statusId === statusList.EM_ANALISE_GERENTE_REGULATORIO.id) {
        flAprovado = FlAprovadoTramitacaoEnum.S;
      } else if (statusId === statusList.ANALISE_REGULATORIA.id) {
        const ultimaTramitacaoAprovacao = detalhe?.tramitacoes?.find(
          t => t.tramitacao?.idStatusSolicitacao === statusList.EM_APROVACAO.id
        );

        if (ultimaTramitacaoAprovacao) {
          flAprovado = ultimaTramitacaoAprovacao.tramitacao.flAprovado as FlAprovadoTramitacaoEnum;
        }
      }

      const tramitacaoRequest: TramitacaoRequest = {
        idSolicitacao: obrigacaoId,
        dsObservacao: textoTrimmed,
        flAprovado,
        arquivos: arquivosTramitacaoPendentes,
        idTramitacaoRef,
      };

      await tramitacoesClient.tramitarViaFluxo(tramitacaoRequest);
      
      limparEstadoAposAcao();
      await reloadDetalhe();
      toast.success('Obrigação enviada para tramitação com sucesso!');
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao enviar para tramitação:', error);
      toast.error('Erro ao enviar para tramitação.');
    } finally {
      setLoading(false);
    }
  }, [obrigacaoId, statusId, detalhe, arquivosTramitacaoPendentes, comentarioActionsRef, limparEstadoAposAcao, reloadDetalhe, onSuccess]);

  return {
    loading,
    confirmarSolicitarAjustes,
    handleAprovarReprovarTramitacao,
    confirmarAprovarConferencia,
    confirmarJustificarAtraso,
    confirmarEnviarParaAnalise,
    handleEnviarParaTramitacao,
  };
}

