'use client';

import { ArquivoDTO } from '@/api/anexos/type';
import { SolicitacaoDetalheResponse } from '@/api/solicitacoes/types';
import { CorrespondenciaDetalheResponse } from '@/api/correspondencia/types';
import { FlAprovadoTramitacaoEnum } from '@/api/tramitacoes/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { ActionWithHelp } from '@/components/help-tooltip';
import { statusList } from '@/api/status-solicitacao/types';

import AnexoModalTramitacao from '../AnexoModalTramitacao';
import InformaçaoStatusEmAnaliseGerReg from '../InformaçaoStatusEmAnaliseGerReg';



import { useDetalhesSolicitacaoData } from './hook/use-detalhes-solicitacao-data';
import { useDetalhesSolicitacaoForm } from './hook/use-detalhes-solicitacao-form';
import { useDetalhesSolicitacaoPermissoes } from './hook/use-detalhes-solicitacao-permissoes';
import { useDetalhesSolicitacaoLabels } from './hook/use-detalhes-solicitacao-labels';
import { DetalhesSolicitacaoDescricao } from './DetalhesSolicitacaoDescricao';
import { DetalhesSolicitacaoHeader } from './DetalhesSolicitacaoHeader';
import { DetalhesSolicitacaoResumo } from './DetalhesSolicitacaoResumo';
import { DetalhesSolicitacaoDevolutiva } from './DetalhesSolicitacaoDevolutiva';

type DetalhesSolicitacaoModalProps = {
  open: boolean;
  onClose(): void;
  correspondencia: CorrespondenciaDetalheResponse | SolicitacaoDetalheResponse | null;
  onEnviarDevolutiva?(
    mensagem: string,
    arquivos: ArquivoDTO[],
    flAprovado?: FlAprovadoTramitacaoEnum,
    idAreaOrigem?: number | null
  ): Promise<void> | void;
  statusLabel?: string;
};

const HELP_ENVIAR_RESPOSTA_AREA_TECNICA =
  'A resposta deve conter a manifestação técnica e pode incluir anexos de suporte. Cada área envia uma única resposta. Após o envio, a resposta fica bloqueada para edição.';

const HELP_REPROVACAO_DEVOLUTIVA =
  'Não: a reprovação da devolutiva exige parecer e devolve a demanda à área responsável. Sim: a minuta segue para aprovação dos gerentes das áreas.';

const HELP_APROVACAO_GERENCIAL =
  'Todos os gerentes das áreas envolvidas precisam aprovar a minuta para o fluxo avançar.';

const HELP_ASSINATURA_DIRETORIA =
  'A aprovação pela Diretoria exige o upload do documento assinado e a aprovação de dois Diretores.';

const HELP_CHANCELA =
  'Encaminha a minuta para assinatura da Diretoria. A aprovação exige o upload do documento assinado e a aprovação de dois Diretores.';

const HELP_PROTOCOLO_ANTT =
  'Sim: exige anexar o protocolo ANTT. Não: exige uma justificativa.';

const HELP_ARQUIVAMENTO =
  'A solicitação arquivada permanece disponível para auditoria, mas não pode ser editada ou reativada.';

export default function DetalhesSolicitacaoModal({
  open,
  onClose,
  correspondencia,
  onEnviarDevolutiva,
  statusLabel = 'Status',
}: DetalhesSolicitacaoModalProps) {
  // Hook para carregar dados
  const data = useDetalhesSolicitacaoData({
    open,
    correspondencia,
    statusLabel,
  });

  // Hook para gerenciar formulário
  const form = useDetalhesSolicitacaoForm({
    correspond: data.correspond,
    idStatusSolicitacao: data.idStatusSolicitacao,
    isFlagVisivel: data.isFlagVisivel,
    isExisteCienciaGerenteRegul: data.isExisteCienciaGerenteRegul,
    isResponsavelPossuiMaisUmaAreaIgualSolicitacao: data.isResponsavelPossuiMaisUmaAreaIgualSolicitacao,
    tpResponsavelUpload: data.tpResponsavelUpload,
    userResponsavel: data.userResponsavel,
    areaParaAutoSelecao: data.areaParaAutoSelecao,
    open,
    onEnviarDevolutiva,
    onClose,
  });

  // Hook para verificar permissões
  const permissoes = useDetalhesSolicitacaoPermissoes({
    correspond: data.correspond,
    idStatusSolicitacao: data.idStatusSolicitacao,
    flAnaliseGerenteDiretor: data.flAnaliseGerenteDiretor,
    userResponsavel: data.userResponsavel,
    areaDiretoria: data.areaDiretoria,
    hasAreaInicial: data.hasAreaInicial,
    isFlagVisivel: data.isFlagVisivel,
    sending: form.sending,
    flAprovado: form.flAprovado,
    isDiretoria: data.isDiretoria,
    devolutivaReprovadaUmavezDiretoria: data.devolutivaReprovadaUmavezDiretoria,
    isExisteCienciaGerenteRegul: data.isExisteCienciaGerenteRegul,
  });

  // Hook para labels dinâmicas
  const labels = useDetalhesSolicitacaoLabels({
    idStatusSolicitacao: data.idStatusSolicitacao,
    idProximoStatusAnaliseRegulatoria: data.idProximoStatusAnaliseRegulatoria,
    isAnaliseRegulatoriaAprovarDevolutiva: data.isAnaliseRegulatoriaAprovarDevolutiva,
    isDiretoria: data.isDiretoria,
    devolutivaReprovadaUmavezDiretoria: data.devolutivaReprovadaUmavezDiretoria,
    devolutivaReprovadaPelaDiretoriaSegundaVez: data.devolutivaReprovadaPelaDiretoriaSegundaVez,
    flAprovado: form.flAprovado,
    isExisteCienciaGerenteRegul: data.isExisteCienciaGerenteRegul,
  });

  const isAnaliseAreaTecnica = data.idStatusSolicitacao === statusList.EM_ANALISE_AREA_TECNICA.id;
  const isAprovacaoGerencial = data.idStatusSolicitacao === statusList.EM_APROVACAO.id;
  const isChancela = data.idStatusSolicitacao === statusList.EM_CHANCELA.id;
  const isAssinaturaDiretoria = data.idStatusSolicitacao === statusList.EM_ASSINATURA_DIRETORIA.id;
  const isConcluido = data.idStatusSolicitacao === statusList.CONCLUIDO.id;
  const canEnviar = !permissoes.diretorPermitidoDsParecer && !!permissoes.enableEnviarDevolutiva;

  const helpAprovacao = data.isAnaliseRegulatoriaAprovarDevolutiva
    ? HELP_REPROVACAO_DEVOLUTIVA
    : isAprovacaoGerencial
      ? HELP_APROVACAO_GERENCIAL
      : isAssinaturaDiretoria
        ? HELP_ASSINATURA_DIRETORIA
        : isConcluido
          ? HELP_PROTOCOLO_ANTT
          : undefined;

  const sendActionHelp = isAnaliseAreaTecnica
    ? { help: HELP_ENVIAR_RESPOSTA_AREA_TECNICA, label: 'Enviar Resposta' }
    : isChancela
      ? { help: HELP_CHANCELA, label: 'Enviar para assinatura da Diretoria' }
      : isAssinaturaDiretoria
        ? { help: HELP_ASSINATURA_DIRETORIA, label: labels.btnEnviarDevolutivaLabel }
        : isConcluido
          ? { help: HELP_ARQUIVAMENTO, label: 'Arquivar Solicitação' }
          : null;

  const showSendActionHelp = canEnviar && sendActionHelp !== null;

  const enviarRespostaButton = (
    <Button
      type="submit"
      form="detalhes-form"
      disabled={!permissoes.enableEnviarDevolutiva}
      tooltip={!permissoes.enableEnviarDevolutiva ? permissoes.btnTooltip : ''}
    >
      {form.sending ? 'Enviando...' : labels.btnEnviarDevolutivaLabel}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl md:max-w-4xl lg:max-w-5xl p-0 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <DetalhesSolicitacaoHeader
          identificador={data.identificador}
          criadorLine={data.criadorLine}
          statusText={data.statusText}
          prazoLine={data.prazoLine}
          isPrazoVencido={data.isPrazoVencido}
        />

        {/* Form */}
        <form
          id="detalhes-form"
          onSubmit={form.handleEnviar}
          className="pl-6 pr-2 pb-6 space-y-8 overflow-y-auto overflow-x-hidden flex-1"
        >
          {/* Resumo da Solicitação */}
          <DetalhesSolicitacaoResumo
            assunto={data.assunto}
            areas={data.areas}
            temaLabel={data.temaLabel}
            nrOficio={data.correspond?.correspondencia?.nrOficio ?? null}
            nrProcesso={data.correspond?.correspondencia?.nrProcesso ?? null}
            flAnaliseGerenteDiretor={data.flAnaliseGerenteDiretor}
            isAnaliseGerenteRegulatorio={data.isAnaliseGerenteRegulatorio}
            currentPrazoTotal={data.currentPrazoTotal}
            flExcepcional={data.correspond?.correspondencia?.flExcepcional}
          />

          {/* Descrição e Observação */}
          <DetalhesSolicitacaoDescricao
            observacao={data.observacao}
            descricao={data.descricao}
            expandDescricao={data.expandDescricao}
            setExpandDescricao={data.setExpandDescricao}
            canToggleDescricao={data.canToggleDescricao}
            lineHeightPx={data.lineHeightPx}
            descRef={data.descRef}
            maxDescLines={data.MAX_DESC_LINES}
          />

          {/* Informações adicionais para Análise Gerente Regulatório */}
          {data.isAnaliseGerenteRegulatorio && (
            <InformaçaoStatusEmAnaliseGerReg
              correspondencia={data.correspond}
              statusListPrazos={data.statusListPrazos}
              prazosSolicitacaoPorStatus={data.prazosSolicitacaoPorStatus}
              responsaveis={data.responsaveis}
              isAnaliseGerenteRegulatorio={data.isAnaliseGerenteRegulatorio}
            />
          )}

          {/* Anexos */}
          <AnexoModalTramitacao
            correspondencia={data.correspond}
            canListarAnexo={permissoes.canListarAnexo}
            isAnaliseGerenteRegulatorio={data.isAnaliseGerenteRegulatorio}
          />

          {/* Área de Devolutiva/Parecer */}
          <DetalhesSolicitacaoDevolutiva
            resposta={form.resposta}
            setResposta={form.setResposta}
            dsDarecer={form.dsDarecer}
            setDsDarecer={form.setDsDarecer}
            arquivos={form.arquivos}
            sending={form.sending}
            flAprovado={form.flAprovado}
            setFlAprovado={form.setFlAprovado}
            areaSelecionadaParaResposta={form.areaSelecionadaParaResposta}
            setAreaSelecionadaParaResposta={form.setAreaSelecionadaParaResposta}
            handleUploadChange={form.handleUploadChange}
            handleRemoveArquivo={form.handleRemoveArquivo}
            labelStatusTextarea={labels.labelStatusTextarea}
            labelFlAprovacao={labels.labelFlAprovacao}
            helpAprovacao={helpAprovacao}
            isFlagVisivel={data.isFlagVisivel}
            diretorPermitidoDsParecer={permissoes.diretorPermitidoDsParecer}
            enableEnviarDevolutiva={permissoes.enableEnviarDevolutiva ?? false}
            isResponsavelPossuiMaisUmaAreaIgualSolicitacao={data.isResponsavelPossuiMaisUmaAreaIgualSolicitacao}
            isAnaliseGerenteRegulatorio={data.isAnaliseGerenteRegulatorio}
            isExisteCienciaGerenteRegul={data.isExisteCienciaGerenteRegul}
            canDeletarAnexo={permissoes.canDeletarAnexo ?? false}
            idSolicitacao={data.correspond?.correspondencia?.idSolicitacao ?? null}
            quantidadeDevolutivas={data.quantidadeDevolutivas ?? 0}
            areasCorrespondentesParaSelecao={data.areasCorrespondentesParaSelecao}
          />
        </form>

        {/* Footer */}
        <DialogFooter className="flex gap-3 px-6 pb-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={form.sending}>
            Cancelar
          </Button>
          
          {permissoes.diretorPermitidoDsParecer && (
            <Button
              type="button"
              onClick={form.handleSalvarParecer}
              disabled={form.sending}
            >
              {form.sending ? 'Salvando...' : 'Salvar Parecer'}
            </Button>
          )}

          {!permissoes.diretorPermitidoDsParecer && (
            showSendActionHelp && sendActionHelp ? (
              <ActionWithHelp
                help={sendActionHelp.help}
                helpLabel={sendActionHelp.label}
              >
                {enviarRespostaButton}
              </ActionWithHelp>
            ) : (
              enviarRespostaButton
            )
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
