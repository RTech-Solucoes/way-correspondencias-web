'use client';

import { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { ArquivoDTO, TipoResponsavelAnexoEnum } from '@/api/anexos/type';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { solicitacaoParecerClient } from '@/api/solicitacao-parecer/client';
import { SolicitacaoParecerResponse } from '@/api/solicitacao-parecer/types';
import { statusList } from '@/api/status-solicitacao/types';
import { CorrespondenciaDetalheResponse } from '@/api/correspondencia/types';
import { FlAprovadoTramitacaoEnum } from '@/api/tramitacoes/types';
import { fileToArquivoDTO } from '@/utils/utils';
import { toast } from 'sonner';

export type UseDetalhesSolicitacaoFormProps = {
  correspond: CorrespondenciaDetalheResponse | null;
  idStatusSolicitacao?: number;
  isFlagVisivel: boolean;
  isExisteCienciaGerenteRegul: boolean;
  isResponsavelPossuiMaisUmaAreaIgualSolicitacao: boolean;
  tpResponsavelUpload: TipoResponsavelAnexoEnum;
  userResponsavel: ResponsavelResponse | null;
  onEnviarDevolutiva?(
    mensagem: string,
    arquivos: ArquivoDTO[],
    flAprovado?: FlAprovadoTramitacaoEnum,
    idAreaOrigem?: number | null
  ): Promise<void> | void;
  onClose(): void;
};

export function useDetalhesSolicitacaoForm({
  correspond,
  idStatusSolicitacao,
  isFlagVisivel,
  isExisteCienciaGerenteRegul,
  isResponsavelPossuiMaisUmaAreaIgualSolicitacao,
  tpResponsavelUpload,
  userResponsavel,
  onEnviarDevolutiva,
  onClose,
}: UseDetalhesSolicitacaoFormProps) {
  const [resposta, setResposta] = useState('');
  const [dsDarecer, setDsDarecer] = useState('');
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [flAprovado, setFlAprovado] = useState<'S' | 'N' | ''>('');
  const [areaSelecionadaParaResposta, setAreaSelecionadaParaResposta] = useState<number | null>(null);
  const [, setParecerAtual] = useState<SolicitacaoParecerResponse | null>(null);

  const handleUploadChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setArquivos((prev) => [...prev, ...Array.from(files)]);
    e.currentTarget.value = '';
  }, []);

  const handleRemoveArquivo = useCallback((index: number) => {
    setArquivos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleEnviar = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!onEnviarDevolutiva) return;

      if (idStatusSolicitacao === statusList.EM_ANALISE_GERENTE_REGULATORIO.id) {
        if (isFlagVisivel && !flAprovado) {
          toast.error('É obrigatório aprovar ou reprovar a solicitação (Sim/Não).');
          return;
        }

        if (!isExisteCienciaGerenteRegul && (flAprovado === null || flAprovado === '' || flAprovado === 'N')) {
          toast.error('É obrigatório marcar a opção "Declaro estar ciente da solicitação e de seu conteúdo".');
          return;
        }

        if (isExisteCienciaGerenteRegul && !resposta.trim()) {
          toast.error('É obrigatório escrever uma justificativa na caixa de texto.');
          return;
        }
      }

      if (idStatusSolicitacao === statusList.CONCLUIDO.id) {
        if (isFlagVisivel && !flAprovado) {
          toast.error('É obrigatório escolher uma opção (Sim/Não) para arquivar a solicitação.');
          return;
        }
        if (flAprovado === 'S' && arquivos.length === 0) {
          toast.error('É obrigatório fazer o upload de pelo menos um documento.');
          return;
        }
        if (flAprovado === 'N' && !resposta.trim()) {
          toast.error('É obrigatório escrever uma justificativa na caixa de texto.');
          return;
        }
      }

      if (isResponsavelPossuiMaisUmaAreaIgualSolicitacao && !areaSelecionadaParaResposta) {
        toast.error('É obrigatório selecionar a área para responder.');
        return;
      }

      if (!resposta.trim() && arquivos.length === 0) {
        toast.error('Escreva uma devolutiva ou anexe um arquivo.');
        return;
      }

      if (isFlagVisivel && !flAprovado) {
        toast.error('Selecione se a devolutiva está aprovada (Sim/Não).');
        return;
      }

      if (!correspond?.correspondencia?.idSolicitacao) {
        toast.error('ID da solicitação não encontrado.');
        return;
      }

      try {
        setSending(true);

        const arquivosDTO: ArquivoDTO[] = arquivos.length > 0
          ? await Promise.all(
            arquivos.map((file) => fileToArquivoDTO(file, tpResponsavelUpload))
          )
          : [];

        await onEnviarDevolutiva(resposta.trim(), arquivosDTO, flAprovado as FlAprovadoTramitacaoEnum | undefined, areaSelecionadaParaResposta);

        toast.success('Resposta enviada com sucesso!');
        setResposta('');
        setArquivos([]);
        setAreaSelecionadaParaResposta(null);
        onClose();
      } catch (err) {
        console.error(err);
        const msg = err instanceof Error && err.message ? err.message : 'Não foi possível enviar a resposta.';
        toast.error(msg);
      } finally {
        setSending(false);
      }
    },
    [
      onEnviarDevolutiva, resposta, arquivos, correspond?.correspondencia?.idSolicitacao,
      onClose, flAprovado, isFlagVisivel, tpResponsavelUpload, idStatusSolicitacao,
      isExisteCienciaGerenteRegul, areaSelecionadaParaResposta, isResponsavelPossuiMaisUmaAreaIgualSolicitacao
    ]
  );

  const handleSalvarParecer = useCallback(async () => {
    try {
      if (!correspond?.correspondencia?.idSolicitacao || !correspond?.statusSolicitacao?.idStatusSolicitacao) {
        toast.error('Dados da solicitação incompletos.');
        return;
      }
      if (!dsDarecer.trim()) {
        toast.error('Escreva o parecer.');
        return;
      }

      setSending(true);

      const req = {
        idSolicitacao: correspond.correspondencia.idSolicitacao,
        idStatusSolicitacao: correspond.statusSolicitacao.idStatusSolicitacao,
        dsDarecer: dsDarecer.trim(),
      };
      const ultimoNivel = Number(correspond?.tramitacoes?.[0]?.tramitacao?.nrNivel ?? 0);
      const nextNivel = ultimoNivel + 1;

      const existingParecer = correspond?.solicitacaoPareceres?.find(
        (p) =>
          p?.idStatusSolicitacao === correspond.statusSolicitacao.idStatusSolicitacao &&
          Number(p?.nrNivel) === Number(nextNivel) &&
          p?.responsavel?.idResponsavel === (userResponsavel?.idResponsavel ?? 0)
      );

      const isArquivado = correspond.statusSolicitacao.idStatusSolicitacao === statusList.ARQUIVADO.id;
      const canUpdate = Boolean(existingParecer?.idSolicitacaoParecer) && !isArquivado;

      if (canUpdate) {
        const atualizado = await solicitacaoParecerClient.atualizar(existingParecer?.idSolicitacaoParecer ?? 0, req);
        setParecerAtual(atualizado);
        toast.success('Parecer atualizado com sucesso.');
        onClose();
      } else {
        const criado = await solicitacaoParecerClient.criar(req);
        setParecerAtual(criado);
        toast.success('Parecer salvo com sucesso.');
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error('Não foi possível salvar o parecer.');
    } finally {
      setSending(false);
    }
  }, [
    dsDarecer, onClose, correspond?.correspondencia?.idSolicitacao, correspond?.tramitacoes,
    correspond?.statusSolicitacao?.idStatusSolicitacao, correspond?.solicitacaoPareceres,
    userResponsavel?.idResponsavel
  ]);

  const resetForm = useCallback(() => {
    setResposta('');
    setDsDarecer('');
    setArquivos([]);
    setFlAprovado('');
    setAreaSelecionadaParaResposta(null);
  }, []);

  return {
    // Estado do formulário
    resposta,
    setResposta,
    dsDarecer,
    setDsDarecer,
    arquivos,
    setArquivos,
    sending,
    flAprovado,
    setFlAprovado,
    areaSelecionadaParaResposta,
    setAreaSelecionadaParaResposta,

    // Handlers
    handleUploadChange,
    handleRemoveArquivo,
    handleEnviar,
    handleSalvarParecer,
    resetForm,
  };
}
