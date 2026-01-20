'use client';

import { FormEvent, useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowArcRightIcon, CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';

import { anexosClient } from '@/api/anexos/client';
import { AnexoResponse, TipoObjetoAnexoEnum } from '@/api/anexos/type';
import { computeTpResponsavel } from '@/api/perfis/types';
import { solicitacoesClient } from '@/api/solicitacoes/client';
import correspondenciaClient from '@/api/correspondencia/client';
import solicitacaoAssinanteClient from '@/api/solicitacao-assinante/client';
import { statusSolicPrazoTemaClient } from '@/api/status-prazo-tema/client';
import { statusList as statusListType } from '@/api/status-solicitacao/types';
import { TipoEnum } from '@/api/tipos/types';

import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Stepper } from '@/components/ui/stepper';
import { usePermissoes } from '@/context/permissoes/PermissoesContext';
import { base64ToUint8Array, saveBlob } from '@/utils/utils';

import { MultiSelectAssinantes } from '@/components/ui/multi-select-assinates';
import { Step3Prazos, DEFAULT_PRAZOS_POR_STATUS } from '@/components/obrigacoes/tramitacao/steps/Step3Prazos';

import { useSolicitacaoForm } from './hooks/use-solicitacao-form';
import { useSolicitacaoData } from './hooks/use-solicitacao-data';
import { Step1Identificacao, Step2TemaAreas, Step5Anexos, Step6Resumo } from './steps';
import { AnexoListItem, SolicitacaoModalProps, STEPS_CONFIG, SolicitacaoFormData, STATUS_OCULTOS_CORRESPONDENCIA } from './types';

export default function SolicitacaoModal({
  correspondencia,
  open,
  onClose,
  onSave,
  responsaveis,
  temas,
  initialSubject,
  initialDescription,
}: SolicitacaoModalProps) {
  const router = useRouter();
  const { canListarAnexo, canInserirAnexo } = usePermissoes();

  const [loading, setLoading] = useState(false);
  const [showConfirmSend, setShowConfirmSend] = useState(false);
  const [confirmSendId, setConfirmSendId] = useState<number | null>(null);
  const [confirmSendToast, setConfirmSendToast] = useState<string>('');
  const [isNewSolicitacao, setIsNewSolicitacao] = useState<boolean>(false);
  const [pendingCreateData, setPendingCreateData] = useState<{
    solicitacoesPrazos: unknown[];
    solicitacoesAssinantes: unknown[];
    arquivos: unknown[];
    cdIdentificacao: string | undefined;
  } | null>(null);

  const {
    currentStep,
    setCurrentStep,
    formData,
    updateFormData,
    prazoExcepcional,
    canEditSolicitacao,
    handleInputChange,
    handleAreasSelectionChange,
    handleResponsaveisSelectionChange,
    getSelectedTema,
    getResponsavelFromTema,
    getResponsavelByArea,
    isStep1Valid,
    isStep2Valid,
    isStep4Valid,
    canNavigateToStep,
    handleStepClick,
    handlePreviousStep,
  } = useSolicitacaoForm({
    correspondencia,
    open,
    initialSubject,
    initialDescription,
    temas,
    responsaveis,
  });

  const {
    anexos,
    setAnexos,
    anexosBackend,
    setAnexosBackend,
    anexosTypeE,
    statusPrazos,
    statusList,
    allAreas,
    prazosSolicitacaoPorStatus,
    userResponsavelIdPerfil,
    handleAddAnexos,
    handleRemoveAnexo,
  } = useSolicitacaoData({
    correspondencia,
    open,
    currentStep,
    formData,
    updateFormData,
  });

  const currentPrazoTotal = useMemo(() => {
    return (formData.statusPrazos || []).reduce((acc, curr) => acc + curr.nrPrazoInterno, 0);
  }, [formData.statusPrazos]);

  // Handlers de anexos backend
  const handleRemoveAnexoBackend = useCallback(
    async (idAnexo: number) => {
      if (!correspondencia?.idSolicitacao) return;

      try {
        await solicitacoesClient.removerAnexo(correspondencia.idSolicitacao, idAnexo);
        setAnexosBackend(prev => prev.filter(anexo => anexo.idAnexo !== idAnexo));
        toast.success('Documento removido com sucesso');
      } catch {
        toast.error('Erro ao remover documento');
      }
    },
    [correspondencia?.idSolicitacao, setAnexosBackend]
  );

  const handleDownloadAnexoBackend = useCallback(async (anexo: AnexoListItem) => {
    try {
      if (!anexo.idObjeto || !anexo.nmArquivo) {
        toast.error('Dados do documento incompletos');
        return;
      }

      const arquivos = await solicitacoesClient.downloadAnexo(anexo.idObjeto, anexo.nmArquivo);

      if (arquivos.length > 0) {
        arquivos.forEach(arquivo => {
          const bytes = base64ToUint8Array(arquivo.conteudoArquivo);
          const filename = arquivo.nomeArquivo || anexo.name || 'documento';
          const mime = arquivo.tipoConteudo || 'application/octet-stream';
          saveBlob(bytes, mime, filename);
        });
      } else {
        toast.error('Arquivo não encontrado');
      }
    } catch {
      toast.error('Erro ao baixar documento');
    }
  }, []);

  const handleDownloadAnexoEmail = useCallback(async (anexo: AnexoResponse) => {
    try {
      if (!anexo.idObjeto || !anexo.nmArquivo) {
        toast.error('Dados do documento incompletos');
        return;
      }

      const arquivos = await anexosClient.download(anexo.idObjeto, TipoObjetoAnexoEnum.E, anexo.nmArquivo);

      if (arquivos.length > 0) {
        arquivos.forEach(arquivo => {
          const bytes = base64ToUint8Array(arquivo.conteudoArquivo);
          const filename = arquivo.nomeArquivo || anexo.nmArquivo || 'documento';
          const mime = arquivo.tipoConteudo || 'application/octet-stream';
          saveBlob(bytes, mime, filename);
        });
      } else {
        toast.error('Arquivo não encontrado');
      }
    } catch {
      toast.error('Erro ao baixar documento');
    }
  }, []);

  // Confirmar envio
  const handleConfirmSend = useCallback(async () => {
    try {
      setLoading(true);

      let idToSend = confirmSendId;

      if (isNewSolicitacao && pendingCreateData) {
        const created = await correspondenciaClient.criar({
          idTema: formData.idTema,
          ...(pendingCreateData.cdIdentificacao && { cdIdentificacao: pendingCreateData.cdIdentificacao }),
          dsAssunto: formData.dsAssunto?.trim(),
          dsSolicitacao: formData.dsSolicitacao?.trim(),
          dsObservacao: formData.dsObservacao?.trim(),
          nrOficio: formData.nrOficio?.trim(),
          nrProcesso: formData.nrProcesso?.trim(),
          flExcepcional: formData.flExcepcional === 'S' ? 'S' : 'N',
          flAnaliseGerenteDiretor: formData.flAnaliseGerenteDiretor,
          flExigeCienciaGerenteRegul: formData.flExigeCienciaGerenteRegul,
          solicitacoesPrazos: pendingCreateData.solicitacoesPrazos as [],
          idsAreas: formData.idsAreas,
          solicitacoesAssinantes: pendingCreateData.solicitacoesAssinantes as [],
          arquivos: pendingCreateData.arquivos as [],
        });
        idToSend = created.idSolicitacao;
      } else if (!isNewSolicitacao && idToSend) {
        await correspondenciaClient.etapaStatus(idToSend);
      }

      if (!idToSend) return;

      toast.success(confirmSendToast || 'Solicitação enviada com sucesso!');
      onSave();
      onClose();
      router.refresh();
    } catch (err) {
      console.error(err);
      let errorMessage = 'Erro ao encaminhar solicitação';

      if (err instanceof Error) {
        if (err.message) {
          errorMessage = err.message;
        } else if ((err as { payload?: { message?: string; error?: string } }).payload) {
          const payload = (err as { payload?: { message?: string; error?: string } }).payload;
          errorMessage = payload?.message || payload?.error || errorMessage;
        }
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setShowConfirmSend(false);
      setConfirmSendId(null);
      setConfirmSendToast('');
      setIsNewSolicitacao(false);
      setPendingCreateData(null);
    }
  }, [confirmSendId, confirmSendToast, onClose, onSave, router, isNewSolicitacao, pendingCreateData, formData]);

  // Next step handler
  const handleNextStep = useCallback(async () => {
    try {
      if (currentStep === 1) {
        if (!formData.cdIdentificacao?.trim()) {
          toast.error('Código de identificação é obrigatório');
          return;
        }
        if (!formData.flExigeCienciaGerenteRegul || (formData.flExigeCienciaGerenteRegul !== 'S' && formData.flExigeCienciaGerenteRegul !== 'N')) {
          toast.error('É obrigatório selecionar se exige manifestação do Gerente do Regulatório');
          return;
        }

        if (!correspondencia || (correspondencia?.cdIdentificacao === null && correspondencia?.idSolicitacao === undefined)) {
          const cdIdentificacao = formData.cdIdentificacao?.trim();
          if (cdIdentificacao) {
            const existeCdIdentificacao = await solicitacoesClient.verificarExisteCdIdentificacaoPorFluxo(cdIdentificacao, TipoEnum.CORRESPONDENCIA);

            if (existeCdIdentificacao) {
              toast.error(`O código de identificação "${cdIdentificacao}" já existe.`);
              return;
            }
          }
        }

        if (!correspondencia) {
          setCurrentStep(2);
          return;
        }
        if (canEditSolicitacao) {
          const cdIdentificacao = formData.cdIdentificacao?.trim();
          const cdIdentificacaoOriginal = correspondencia?.cdIdentificacao || '';

          if (cdIdentificacao && cdIdentificacao !== cdIdentificacaoOriginal) {
            const existeCdIdentificacao = await solicitacoesClient.verificarExisteCdIdentificacaoPorFluxo(cdIdentificacao, TipoEnum.CORRESPONDENCIA);

            if (existeCdIdentificacao) {
              toast.error(`O código de identificação "${cdIdentificacao}" já existe.`);
              return;
            }
          }

          await correspondenciaClient.etapaIdentificacao(correspondencia.idSolicitacao, {
            cdIdentificacao: cdIdentificacao,
            dsAssunto: formData.dsAssunto?.trim(),
            dsObservacao: formData.dsObservacao?.trim(),
            nrOficio: formData.nrOficio?.trim(),
            nrProcesso: formData.nrProcesso?.trim(),
            flAnaliseGerenteDiretor: formData.flAnaliseGerenteDiretor,
            flExigeCienciaGerenteRegul: formData.flExigeCienciaGerenteRegul,
          });
        }

        setCurrentStep(2);
      } else if (currentStep === 2) {
        if (!formData.idTema || formData.idTema === 0) {
          toast.error('Tema é obrigatório');
          return;
        }

        if (!formData.idsAreas || formData.idsAreas.length === 0) {
          toast.error('Selecione pelo menos uma área');
          return;
        }

        try {
          const prazosPadrao = await statusSolicPrazoTemaClient.buscarPrazosPadraoParaUI(formData.idTema);
          if (prazosPadrao.length > 0) {
            updateFormData({ statusPrazos: prazosPadrao });
          }
        } catch (error) {
          console.error('Erro ao carregar prazos padrão:', error);
        }

        if (!correspondencia) {
          setCurrentStep(3);
          return;
        }
        if (canEditSolicitacao) {
          await correspondenciaClient.etapaTema(correspondencia.idSolicitacao, {
            idTema: formData.idTema,
            tpPrazo: formData.tpPrazo || undefined,
            nrPrazoInterno: formData.nrPrazo,
            flExcepcional: formData.flExcepcional === 'S' ? 'S' : 'N',
            idsAreas: formData.idsAreas,
          });
        }

        setCurrentStep(3);
      } else if (currentStep === 3) {
        if (!correspondencia) {
          setCurrentStep(4);
          return;
        }
        if (canEditSolicitacao) {
          const solicitacoesPrazos = (formData.statusPrazos || [])
            .filter(p => p.nrPrazoInterno && p.nrPrazoInterno > 0 && p.idStatusSolicitacao)
            .map(p => ({
              idStatusSolicitacao: p.idStatusSolicitacao!,
              idTema: formData.idTema,
              nrPrazoInterno: p.nrPrazoInterno,
              nrPrazoExterno: p.nrPrazoExterno || 0,
              tpPrazo: formData.tpPrazo || undefined,
              flExcepcional: formData.flExcepcional || 'N',
            }));

          await solicitacoesClient.etapaPrazo(correspondencia.idSolicitacao, {
            idTema: formData.idTema,
            nrPrazoInterno: formData.nrPrazo,
            flExcepcional: formData.flExcepcional || 'N',
            solicitacoesPrazos,
          });

          // Recarregar prazos após salvar para garantir sincronização
          try {
            const prazosAtualizados = await solicitacoesClient.listarPrazos(correspondencia.idSolicitacao);
            if (prazosAtualizados && prazosAtualizados.length > 0) {
              const temaId = formData.idTema || correspondencia?.idTema || correspondencia?.tema?.idTema || 0;
              const temaNome = correspondencia?.tema?.nmTema || '';
              const prazosMapeados = prazosAtualizados.map(p => ({
                idStatusSolicPrazoTema: 0,
                idStatusSolicitacao: p.idStatusSolicitacao,
                idTema: temaId,
                nrPrazoInterno: p.nrPrazoInterno || 0,
                nrPrazoExterno: 0,
                tema: { idTema: temaId, nmTema: temaNome },
                flAtivo: 'S',
              }));
              updateFormData({ statusPrazos: prazosMapeados });
            }
          } catch (error) {
            console.error('Erro ao recarregar prazos após salvar:', error);
          }
        }

        setCurrentStep(4);
      } else if (currentStep === 4) {
        if (!formData.idsResponsaveisAssinates || formData.idsResponsaveisAssinates.length !== 2) {
          toast.error('Selecione exatamente 2 validadores/assinantes para continuar');
          return;
        }

        if (!correspondencia) {
          setCurrentStep(5);
          return;
        }

        if (canEditSolicitacao && formData.idsResponsaveisAssinates && formData.idsResponsaveisAssinates.length > 0) {
          await solicitacaoAssinanteClient.criar(
            formData.idsResponsaveisAssinates.map(id => ({
              idSolicitacao: correspondencia.idSolicitacao,
              idStatusSolicitacao: statusListType.EM_ASSINATURA_DIRETORIA.id,
              idResponsavel: id,
            }))
          );
        }

        setCurrentStep(5);
      } else if (currentStep === 5) {
        if (!correspondencia) {
          setCurrentStep(6);
          return;
        }
        if (canEditSolicitacao) {
          if (anexos.length > 0) {
            const existingNames = new Set([
              ...anexosBackend.map(a => (a.nmArquivo || '').trim().toLowerCase()),
              ...anexosTypeE.map(a => (a.nmArquivo || '').trim().toLowerCase()),
            ]);

            const newNames = anexos.map(file => (file.name || '').trim().toLowerCase()).filter(name => name !== '');

            const duplicateWithExisting = newNames.filter(name => existingNames.has(name));
            const duplicateWithinNew = newNames.filter((name, idx, arr) => arr.indexOf(name) !== idx);
            const duplicateNames = Array.from(new Set([...duplicateWithExisting, ...duplicateWithinNew]));

            if (duplicateNames.length > 0) {
              toast.error(`Já existe anexo com o mesmo nome: ${duplicateNames.join(', ')}`);
              return;
            }

            const seenNames = new Set<string>();
            const filesToUpload = anexos.filter(file => {
              const key = (file.name || '').trim().toLowerCase();
              if (!key) return false;
              if (seenNames.has(key)) return false;
              seenNames.add(key);
              return true;
            });

            const arquivosDTO = await Promise.all(
              filesToUpload.map(async file => {
                if (!file.name || file.name.trim() === '') {
                  throw new Error(`Arquivo sem nome válido: ${file.name || 'undefined'}`);
                }

                const base64 = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = reader.result as string;
                    if (!result) {
                      reject(new Error('Erro ao ler arquivo'));
                      return;
                    }
                    resolve(result);
                  };
                  reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
                  reader.readAsDataURL(file);
                });

                const base64Content = base64.split(',')[1];
                if (!base64Content) {
                  throw new Error('Erro ao converter arquivo para base64');
                }

                return {
                  nomeArquivo: file.name.trim(),
                  conteudoArquivo: base64Content,
                  tipoArquivo: file.type || 'application/octet-stream',
                  tpResponsavel: computeTpResponsavel(userResponsavelIdPerfil),
                };
              })
            );

            try {
              setLoading(true);
              await solicitacoesClient.uploadAnexos(correspondencia.idSolicitacao, arquivosDTO);
              try {
                const atualizados = await solicitacoesClient.buscarAnexos(correspondencia.idSolicitacao);
                setAnexosBackend(atualizados);
              } catch {}
              setAnexos([]);
            } catch {
              toast.error('Erro ao anexar arquivos');
            } finally {
              setLoading(false);
            }
          }
        }

        setCurrentStep(6);
      }
    } catch (e) {
      console.error(e);
      toast.error('Erro ao avançar etapa');
    }
  }, [
    currentStep,
    formData,
    correspondencia,
    anexos,
    anexosBackend,
    anexosTypeE,
    canEditSolicitacao,
    setCurrentStep,
    updateFormData,
    setAnexos,
    setAnexosBackend,
    userResponsavelIdPerfil,
  ]);

  // Submit handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const id = correspondencia?.idSolicitacao;

      if (correspondencia?.idSolicitacao) {
        if (!canEditSolicitacao) {
          toast.message('Esta solicitação não pode ser editada no status atual.');
          setLoading(false);
          return;
        }
        setConfirmSendId(correspondencia.idSolicitacao);
        setConfirmSendToast('Solicitação encaminhada com sucesso!');
        setShowConfirmSend(true);
        setLoading(false);
        return;
      } else {
        if (!formData.cdIdentificacao?.trim()) {
          toast.error('Código de identificação é obrigatório');
          setLoading(false);
          return;
        }
        if (!formData.idTema || formData.idTema === 0) {
          toast.error('Tema é obrigatório');
          setLoading(false);
          return;
        }

        const cdIdentificacao = formData.cdIdentificacao?.trim();

        if (id === undefined && correspondencia?.cdIdentificacao === null && correspondencia?.idSolicitacao === undefined) {
          const existeCdIdentificacao = await solicitacoesClient.verificarExisteCdIdentificacaoPorFluxo(cdIdentificacao, TipoEnum.CORRESPONDENCIA);

          if (existeCdIdentificacao) {
            toast.error(`O código de identificação "${cdIdentificacao}" já existe.`);
            setLoading(false);
            return;
          }
        }

        const solicitacoesPrazos = statusPrazos
          .filter(p => p.nrPrazoInterno && p.nrPrazoInterno > 0 && p.idStatusSolicitacao)
          .map(p => ({
            idStatusSolicitacao: p.idStatusSolicitacao!,
            idTema: formData.idTema,
            nrPrazoInterno: p.nrPrazoInterno,
            nrPrazoExterno: p.nrPrazoExterno,
            tpPrazo: formData.tpPrazo || undefined,
            flExcepcional: formData.flExcepcional === 'S' ? 'S' : 'N',
          }));

        if (id === undefined || correspondencia?.idSolicitacao === undefined) {
          const solicitacoesAssinantes = (formData.idsResponsaveisAssinates || []).map(idResp => ({
            idStatusSolicitacao: statusListType.EM_ASSINATURA_DIRETORIA.id,
            idResponsavel: idResp,
          }));

          const arquivos = await Promise.all(
            anexos.map(async file => {
              const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
                reader.readAsDataURL(file);
              });

              return {
                nomeArquivo: file.name.trim(),
                conteudoArquivo: base64.split(',')[1],
                tipoArquivo: file.type || 'application/octet-stream',
                tpResponsavel: computeTpResponsavel(userResponsavelIdPerfil),
              };
            })
          );

          setPendingCreateData({
            solicitacoesPrazos,
            solicitacoesAssinantes,
            arquivos,
            cdIdentificacao,
          });
          setIsNewSolicitacao(true);
          setConfirmSendToast('Solicitação criada e encaminhada com sucesso!');
          setShowConfirmSend(true);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error(err);
      let errorMessage = correspondencia ? 'Erro ao encaminhar solicitação' : 'Erro ao criar solicitação';

      if (err instanceof Error) {
        if (err.message) {
          errorMessage = err.message;
        } else if ((err as { payload?: { message?: string; error?: string } }).payload) {
          const payload = (err as { payload?: { message?: string; error?: string } }).payload;
          errorMessage = payload?.message || payload?.error || errorMessage;
        }
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1Identificacao formData={formData} updateFormData={updateFormData} disabled={!canEditSolicitacao} onInputChange={handleInputChange} />;
      case 2:
        return (
          <Step2TemaAreas
            formData={formData}
            updateFormData={updateFormData}
            disabled={!canEditSolicitacao}
            temas={temas}
            correspondencia={correspondencia}
            onAreasSelectionChange={handleAreasSelectionChange}
            getResponsavelFromTema={getResponsavelFromTema}
          />
        );
      case 3:
        return (
          <Step3Prazos<SolicitacaoFormData>
            formData={formData}
            updateFormData={updateFormData}
            disabled={!canEditSolicitacao}
            defaultPrazosPorStatus={DEFAULT_PRAZOS_POR_STATUS}
            statusOcultos={STATUS_OCULTOS_CORRESPONDENCIA}
            tipoEnum={TipoEnum.CORRESPONDENCIA}
          />
        );
      case 4:
        return (
          <MultiSelectAssinantes
            selectedResponsavelIds={formData.idsResponsaveisAssinates || []}
            onSelectionChange={handleResponsaveisSelectionChange}
            label="Selecione os validadores em 'Em Assinatura Diretoria' *"
            disabled={!canEditSolicitacao}
          />
        );
      case 5:
        return (
          <Step5Anexos
            formData={formData}
            updateFormData={updateFormData}
            disabled={!canEditSolicitacao}
            anexos={anexos}
            anexosBackend={anexosBackend}
            anexosTypeE={anexosTypeE}
            onAddAnexos={handleAddAnexos}
            onRemoveAnexo={handleRemoveAnexo}
            onRemoveAnexoBackend={handleRemoveAnexoBackend}
            onDownloadAnexoBackend={handleDownloadAnexoBackend}
            onDownloadAnexoEmail={handleDownloadAnexoEmail}
            canListarAnexo={canListarAnexo ?? false}
            canInserirAnexo={canInserirAnexo ?? false}
          />
        );
      case 6:
        return (
          <Step6Resumo
            formData={formData}
            updateFormData={updateFormData}
            correspondencia={correspondencia}
            responsaveis={responsaveis}
            getSelectedTema={getSelectedTema}
            getResponsavelByArea={getResponsavelByArea}
            allAreas={allAreas}
            statusPrazos={formData.statusPrazos || []}
            prazoExcepcional={prazoExcepcional}
            prazosSolicitacaoPorStatus={prazosSolicitacaoPorStatus}
            statusList={statusList}
            anexos={anexos}
            anexosBackend={anexosBackend}
            anexosTypeE={anexosTypeE}
            canListarAnexo={canListarAnexo ?? false}
            currentPrazoTotal={currentPrazoTotal}
            onDownloadAnexoBackend={handleDownloadAnexoBackend}
            onDownloadAnexoEmail={handleDownloadAnexoEmail}
          />
        );
      default:
        return null;
    }
  };

  // Render footer buttons
  const renderFooterButtons = () => {
    if (currentStep === 1) {
      return (
        <Button
          type="button"
          onClick={() => handleNextStep()}
          disabled={!isStep1Valid()}
          className="flex items-center gap-2"
          tooltip={!canEditSolicitacao ? 'Esta solicitação não pode ser editada no status atual.' : undefined}
        >
          Próximo
          <CaretRightIcon size={16} />
        </Button>
      );
    }

    if (currentStep === 6) {
      return (
        <>
          <Button type="button" variant="outline" onClick={handlePreviousStep} disabled={loading} className="flex items-center gap-2">
            <CaretLeftIcon size={16} />
            Anterior
          </Button>
          <Button
            type="submit"
            form="solicitacao-form"
            disabled={loading || !canEditSolicitacao}
            className="flex items-center gap-2"
            tooltip={!canEditSolicitacao ? 'Esta solicitação não pode ser editada no status atual.' : undefined}
          >
            {correspondencia && <ArrowArcRightIcon className={'w-4 h-4 mr-1'} />}
            {loading ? 'Salvando...' : correspondencia ? 'Encaminhar para Gerente do Regulatório' : 'Criar Solicitação'}
          </Button>
        </>
      );
    }

    const isNextDisabled = () => {
      if (loading) return true;
      if (currentStep === 2 && !isStep2Valid()) return true;
      if (currentStep === 4 && !isStep4Valid()) return true;
      return false;
    };

    const getTooltip = () => {
      if (!canEditSolicitacao) return 'Esta solicitação não pode ser editada no status atual.';
      if (currentStep === 4 && !isStep4Valid()) return 'Selecione exatamente 2 validadores/assinantes para continuar';
      return undefined;
    };

    return (
      <>
        <Button type="button" variant="outline" onClick={handlePreviousStep} disabled={loading} className="flex items-center gap-2">
          <CaretLeftIcon size={16} />
          Anterior
        </Button>
        <Button type="button" onClick={() => handleNextStep()} disabled={isNextDisabled()} className="flex items-center gap-2" tooltip={getTooltip()}>
          Próximo
          <CaretRightIcon size={16} />
        </Button>
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="h-full flex flex-col">
        <DialogHeader className="pb-6 flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">{correspondencia ? 'Editar Solicitação' : 'Nova Solicitação'}</DialogTitle>
        </DialogHeader>

        <div className="flex-shrink-0 border-b border-gray-200 pb-4">
          <Stepper currentStep={currentStep} steps={STEPS_CONFIG} onStepClick={handleStepClick} canNavigateToStep={canNavigateToStep} />
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          <form id="solicitacao-form" onSubmit={handleSubmit}>
            {renderStepContent()}
          </form>
        </div>

        <DialogFooter className="flex gap-3 pt-6 border-t flex-shrink-0">{renderFooterButtons()}</DialogFooter>
      </DialogContent>
      <ConfirmationDialog
        open={showConfirmSend}
        onOpenChange={setShowConfirmSend}
        title="Confirmar envio"
        description="Deseja encaminhar para o Gerente do Regulatório?"
        confirmText="Sim"
        cancelText="Voltar a solicitação"
        onConfirm={handleConfirmSend}
      />
    </Dialog>
  );
}