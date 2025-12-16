'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Stepper } from '@/components/ui/stepper';
import { ArrowArcRightIcon, CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { Step1Dados } from './steps/Step1Dados';
import { Step3Prazos } from './steps/Step3Prazos';
import { Step6Resumo } from './steps/Step6Resumo';
import { Step2Obrigacao, Step4Obrigacao } from '../criar';
import { ObrigacaoFormData } from '../criar/ObrigacaoModal';
import { MultiSelectAssinantes } from '@/components/ui/multi-select-assinates';
import obrigacaoClient from '@/api/obrigacao/client';
import { StatusSolicPrazoTemaForUI } from '@/api/status-prazo-tema/types';
import { AnexoResponse, TipoDocumentoAnexoEnum, TipoObjetoAnexoEnum, ArquivoDTO, TipoResponsavelAnexoEnum } from '@/api/anexos/type';
import anexosClient from '@/api/anexos/client';
import { toast } from 'sonner';
import { base64ToUint8Array, saveBlob } from '@/utils/utils';
import solicitacoesClient from '@/api/solicitacoes/client';
import solicitacaoAssinanteClient from '@/api/solicitacao-assinante/client';
import obrigacaoAnexosClient from '@/api/obrigacao/anexos-client';
import { statusList as statusListType } from '@/api/status-solicitacao/types';

export interface TramitacaoFormData {
  dsTarefa?: string;
  cdIdentificacao?: string;
  cdItem?: string;
  flAnaliseGerenteDiretor?: string;
  flExigeCienciaGerenteRegul?: string;
  dsAssunto?: string;
  dsObservacao?: string;
  idTema?: number | null;
  idsAreas?: number[];
  dtInicio?: string | null;
  dtTermino?: string | null;
  dtLimite?: string | null;
  idsAssinantes?: number[];
  anexos?: File[];
  flExcepcional?: string;
  statusPrazos?: StatusSolicPrazoTemaForUI[];
  nrPrazo?: number;
  tpPrazo?: string;
}

interface TramitacaoObrigacaoModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: (data: TramitacaoFormData) => void;
  obrigacaoId?: number | null;
}

const steps = [
  { title: 'Dados', description: 'Informações básicas' },
  { title: 'Temas e áreas', description: 'Categorização' },
  { title: 'Prazos', description: 'Datas e prazos' },
  { title: 'Assinantes', description: 'Responsáveis' },
  { title: 'Anexos', description: 'Documentos' },
  { title: 'Resumo', description: 'Revisão final' },
];

export function TramitacaoObrigacaoModal({ open, onClose, onConfirm, obrigacaoId }: TramitacaoObrigacaoModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [existingAnexos, setExistingAnexos] = useState<AnexoResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TramitacaoFormData>({
    dsTarefa: '',
    cdIdentificacao: '',
    cdItem: '',
    flAnaliseGerenteDiretor: '',
    flExigeCienciaGerenteRegul: '',
    dsAssunto: '',
    dsObservacao: '',
    idTema: null,
    idsAreas: [],
    dtInicio: null,
    dtTermino: null,
    dtLimite: null,
    idsAssinantes: [],
    anexos: [],
    flExcepcional: 'N',
    statusPrazos: [],
    nrPrazo: undefined,
    tpPrazo: '',
  });

  const loadObrigacaoDetalhe = useCallback(async () => {
    if (!obrigacaoId) return;

    try {
      const detalhe = await obrigacaoClient.buscarDetalhePorId(obrigacaoId);
      const obrigacao = detalhe.obrigacao;

      const mappedData: Partial<TramitacaoFormData> = {
        dsTarefa: obrigacao.dsTarefa || '',
        cdIdentificacao: obrigacao.cdIdentificacao || '',
        flAnaliseGerenteDiretor: obrigacao.flAnaliseGerenteDiretor || '',
        flExigeCienciaGerenteRegul: obrigacao.flExigeCienciaGerenteRegul || '',
        dsObservacao: obrigacao.dsObservacao || '',
        idTema: obrigacao.tema?.idTema || null,
        idsAreas: obrigacao.areas?.map(area => area.idArea) || [],
        dtInicio: obrigacao.dtInicio || null,
        dtTermino: obrigacao.dtTermino || null,
        dtLimite: obrigacao.dtLimite || null,
        flExcepcional: obrigacao.flExcepcional || 'N',
        idsAssinantes: detalhe.solicitacoesAssinantes
          ?.filter(a => a.idStatusSolicitacao === statusListType.EM_ASSINATURA_DIRETORIA.id)
          .map(a => a.idResponsavel) || [], 
        nrPrazo: obrigacao.nrPrazo,
        tpPrazo: obrigacao.tpPrazo || '',
      };

      if (detalhe.solicitacaoPrazos && detalhe.solicitacaoPrazos.length > 0) {
        mappedData.statusPrazos = detalhe.solicitacaoPrazos.map(prazo => ({
          idStatusSolicPrazoTema: prazo.idSolicitacaoPrazo || 0,
          idStatusSolicitacao: prazo.idStatusSolicitacao || 0,
          nrPrazoInterno: prazo.nrPrazoInterno || 0,
          nrPrazoExterno: 0,
          flAtivo: 'S',
        }));
      }

      setFormData(prev => ({ ...prev, ...mappedData }));

      if (detalhe.anexos && detalhe.anexos.length > 0) {
        const anexosTipoC = detalhe.anexos.filter(
          anexo => anexo.tpDocumento === TipoDocumentoAnexoEnum.C
        );
        setExistingAnexos(anexosTipoC);
      } else {
        setExistingAnexos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhe da obrigação:', error);
    }
  }, [obrigacaoId]);

  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      if (obrigacaoId) {
        loadObrigacaoDetalhe();
      }
    }
  }, [open, obrigacaoId, loadObrigacaoDetalhe]);

  useEffect(() => {
    if (currentStep === 5 && obrigacaoId) {
      const reloadAnexos = async () => {
        try {
          const detalhe = await obrigacaoClient.buscarDetalhePorId(obrigacaoId);
          if (detalhe.anexos && detalhe.anexos.length > 0) {
            const anexosTipoC = detalhe.anexos.filter(
              anexo => anexo.tpDocumento === TipoDocumentoAnexoEnum.C
            );
            setExistingAnexos(anexosTipoC);
          } else {
            setExistingAnexos([]);
          }
        } catch (error) {
          console.error('Erro ao recarregar anexos:', error);
        }
      };
      reloadAnexos();
    }
  }, [currentStep, obrigacaoId]);

  const updateFormData = (data: Partial<TramitacaoFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = async () => {
    if (!obrigacaoId) {
      toast.error('ID da obrigação não encontrado.');
      return;
    }

    setLoading(true);
    try {
      if (currentStep === 1) {
        await obrigacaoClient.atualizarStep1(obrigacaoId, {
          dsTarefa: formData.dsTarefa || '',
          flAnaliseGerenteDiretor: formData.flAnaliseGerenteDiretor || '',
          flExigeCienciaGerenteRegul: formData.flExigeCienciaGerenteRegul || '',
          dsObservacao: formData.dsObservacao || '',
        });
        setCurrentStep(currentStep + 1);
      } else if (currentStep === 2) {
        setCurrentStep(currentStep + 1);
      } else if (currentStep === 3) {
        const solicitacoesPrazos = (formData.statusPrazos || [])
          .filter(p => p.nrPrazoInterno && p.nrPrazoInterno > 0 && p.idStatusSolicitacao)
          .map(p => ({
            idStatusSolicitacao: p.idStatusSolicitacao!,
            idTema: formData.idTema || undefined,
            nrPrazoInterno: p.nrPrazoInterno,
            nrPrazoExterno: p.nrPrazoExterno || 0,
            tpPrazo: formData.tpPrazo || undefined,
            flExcepcional: formData.flExcepcional || 'N',
          }));

        await solicitacoesClient.etapaPrazo(obrigacaoId, {
          idTema: formData.idTema || undefined,
          nrPrazoInterno: formData.nrPrazo || undefined,
          flExcepcional: formData.flExcepcional || 'N',
          solicitacoesPrazos,
        });

        try {
          const detalhe = await obrigacaoClient.buscarDetalhePorId(obrigacaoId);
          const obrigacao = detalhe.obrigacao;
          
          if (obrigacao.flExcepcional) {
            setFormData(prev => ({ ...prev, flExcepcional: obrigacao.flExcepcional || 'N' }));
          }

          if (detalhe.solicitacaoPrazos && detalhe.solicitacaoPrazos.length > 0) {
            const prazosAtualizados = detalhe.solicitacaoPrazos.map(prazo => ({
              idStatusSolicPrazoTema: prazo.idSolicitacaoPrazo || 0,
              idStatusSolicitacao: prazo.idStatusSolicitacao || 0,
              nrPrazoInterno: prazo.nrPrazoInterno || 0,
              nrPrazoExterno: 0,
              flAtivo: 'S',
            }));
            setFormData(prev => ({ ...prev, statusPrazos: prazosAtualizados }));
          }
        } catch (error) {
          console.error('Erro ao recarregar dados após salvar prazos:', error);
        }

        setCurrentStep(currentStep + 1);
      } else if (currentStep === 4) {
        if (formData.idsAssinantes && formData.idsAssinantes.length > 0) {
          await solicitacaoAssinanteClient.criar(
            formData.idsAssinantes.map(id => ({
              idSolicitacao: obrigacaoId,
              idStatusSolicitacao: statusListType.EM_ASSINATURA_DIRETORIA.id,
              idResponsavel: id,
            }))
          );
        }
        setCurrentStep(currentStep + 1);
      } else if (currentStep === 5) {
        let anexosExistentesAtualizados: AnexoResponse[] = [];
        try {
          const detalhe = await obrigacaoClient.buscarDetalhePorId(obrigacaoId);
          if (detalhe.anexos && detalhe.anexos.length > 0) {
            anexosExistentesAtualizados = detalhe.anexos.filter(
              anexo => anexo.tpDocumento === TipoDocumentoAnexoEnum.C
            );
            setExistingAnexos(anexosExistentesAtualizados);
          }
        } catch (error) {
          console.error('Erro ao recarregar anexos:', error);
        }
        if (formData.anexos && formData.anexos.length > 0) {
          const existingNames = new Set(
            anexosExistentesAtualizados
              .map(a => (a.nmArquivo || '').trim().toLowerCase())
              .filter(name => name !== '')
          );

          const filesToUpload = formData.anexos.filter(file => {
            const fileName = (file.name || '').trim().toLowerCase();
            if (!fileName) return false;
            return !(existingNames.has(fileName));
          });

          if (filesToUpload.length > 0) {
            const arquivosDTO: ArquivoDTO[] = await Promise.all(
              filesToUpload.map(async (file) => {
                const base64 = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = reader.result as string;
                    const commaIndex = result.indexOf(',');
                    resolve(commaIndex >= 0 ? result.substring(commaIndex + 1) : result);
                  };
                  reader.onerror = reject;
                  reader.readAsDataURL(file);
                });

                return {
                  nomeArquivo: file.name,
                  tipoConteudo: file.type,
                  tpResponsavel: TipoResponsavelAnexoEnum.A,
                  conteudoArquivo: base64,
                  tpDocumento: TipoDocumentoAnexoEnum.C,
                };
              })
            );

            await obrigacaoAnexosClient.upload(obrigacaoId, arquivosDTO);
            const detalheAtualizado = await obrigacaoClient.buscarDetalhePorId(obrigacaoId);
            if (detalheAtualizado.anexos && detalheAtualizado.anexos.length > 0) {
              const anexosTipoC = detalheAtualizado.anexos.filter(
                anexo => anexo.tpDocumento === TipoDocumentoAnexoEnum.C
              );
              setExistingAnexos(anexosTipoC);
            }
          }
        }
        setCurrentStep(currentStep + 1);
      } else if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(formData);
    }
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep(1);
    setExistingAnexos([]);
    setFormData({
      dsTarefa: '',
      cdIdentificacao: '',
      cdItem: '',
      flAnaliseGerenteDiretor: '',
      flExigeCienciaGerenteRegul: '',
      dsAssunto: '',
      dsObservacao: '',
      idTema: null,
      idsAreas: [],
      dtInicio: null,
      dtTermino: null,
      dtLimite: null,
      idsAssinantes: [],
      anexos: [],
      flExcepcional: 'N',
      statusPrazos: [],
      nrPrazo: undefined,
      tpPrazo: '',
    });
    onClose();
  };

  const handleDownloadExisting = async (anexo: AnexoResponse) => {
    try {
      if (!anexo.idObjeto || !anexo.nmArquivo) {
        toast.error('Dados do anexo incompletos');
        return;
      }

      const arquivos = await anexosClient.download(
        anexo.idObjeto,
        TipoObjetoAnexoEnum.O,
        anexo.nmArquivo
      );

      if (arquivos && arquivos.length > 0) {
        arquivos.forEach((arquivo) => {
          const bytes = base64ToUint8Array(arquivo.conteudoArquivo);
          const filename = arquivo.nomeArquivo || anexo.nmArquivo || 'documento';
          const mime = arquivo.tipoConteudo || 'application/octet-stream';
          saveBlob(bytes, mime, filename);
        });
        toast.success('Download iniciado com sucesso.');
      } else {
        toast.error('Arquivo não encontrado');
      }
    } catch (error) {
      console.error('Erro ao baixar anexo:', error);
      toast.error('Erro ao baixar o anexo.');
    }
  };

  const handleRemoveExisting = async (anexo: AnexoResponse) => {
    if (!obrigacaoId) return;
    try {
      await obrigacaoAnexosClient.deletar(obrigacaoId, anexo.idAnexo);
      setExistingAnexos(prev => prev.filter(a => a.idAnexo !== anexo.idAnexo));
      toast.success('Anexo removido com sucesso.');
    } catch (error) {
      console.error('Erro ao remover anexo:', error);
      toast.error('Erro ao remover o anexo.');
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.flAnaliseGerenteDiretor &&
          formData.flAnaliseGerenteDiretor.trim() !== '' &&
          formData.flExigeCienciaGerenteRegul &&
          formData.flExigeCienciaGerenteRegul.trim() !== ''
        );
      case 4:
        return !!(formData.idsAssinantes && formData.idsAssinantes.length >= 2);
      default:
        return true;
    }
  };
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Dados
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 2:
        return (
          <Step2Obrigacao
            formData={{
              idTema: formData.idTema ?? null,
              idAreaAtribuida: formData.idsAreas?.[0] ?? null,
              idsAreasCondicionantes: formData.idsAreas?.slice(1) ?? [],
            } as ObrigacaoFormData}
            updateFormData={(data) => updateFormData({ ...formData, ...data } as Partial<TramitacaoFormData>)}
            disabled={true}
          />
        );
      case 3:
        return (
          <Step3Prazos
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 4: 
        return (
          <MultiSelectAssinantes
          selectedResponsavelIds={formData.idsAssinantes || []}
          onSelectionChange={(idsAssinantes) => updateFormData({ idsAssinantes } as Partial<TramitacaoFormData>)}
          label="Selecione os validadores em 'Em Assinatura Diretoria' *"
          />
        );
      case 5:
        return (
          <Step4Obrigacao
            formData={formData}
            updateFormData={(data) => updateFormData({ ...formData, ...data } as Partial<TramitacaoFormData>)}
            anexos={formData.anexos || []}
            onAnexosChange={(anexos) => updateFormData({ ...formData, anexos } as Partial<TramitacaoFormData>)}
            existingAnexos={existingAnexos}
            onDownloadExisting={handleDownloadExisting}
            onRemoveExisting={handleRemoveExisting}
          />
        );
      case 6:
        return <Step6Resumo formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[70vw] h-[89vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Encaminhar para tramitação
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <Stepper
            currentStep={currentStep}
            steps={steps}
            onStepClick={setCurrentStep}
            canNavigateToStep={() => true}
          />
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          {renderStepContent()}
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <CaretLeftIcon className="h-4 w-4" />
            Etapa Anterior
          </Button>
          
          <div className="flex gap-2">
            {currentStep < steps.length ? (
              <Button 
                onClick={handleNext} 
                disabled={loading || !isStepValid(currentStep)} 
                className="flex items-center gap-2"
              >
                <CaretRightIcon className="h-4 w-4" />
                {loading ? 'Salvando...' : 'Próxima etapa'}
              </Button>
            ) : (
              <Button onClick={handleConfirm} className="flex items-center gap-2">
                <ArrowArcRightIcon className={"w-4 h-4 mr-1"} />
                Encaminhar para o Gerente do Regulatório
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}