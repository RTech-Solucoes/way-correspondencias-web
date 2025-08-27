'use client';

import { useCallback, useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CaretLeftIcon, CaretRightIcon, ArrowBendUpRightIcon } from '@phosphor-icons/react';

import { SolicitacaoResponse, SolicitacaoRequest } from '@/api/solicitacoes/types';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { TemaResponse } from '@/api/temas/types';
import { solicitacoesClient } from '@/api/solicitacoes/client';
import { statusPrazoTemaClient } from '@/api/status-prazo-tema/client';
import { StatusSolicPrazoTemaResponse } from '@/api/status-prazo-tema/types';
import { capitalize } from '@/utils/utils';
import StepperNav from './StepperNav';
import Step1Dados from './steps/Step1Dados';
import Step2TemaAreas from './steps/Step2TemaAreas';
import Step3StatusPrazos from './steps/Step3StatusPrazos';
import Step4Anexos from './steps/Step4Anexos';
import Step5Resumo from './steps/Step5Resumo';


export interface AnexoFromBackend {
  idAnexo: number;
  idObjeto: number;
  nmArquivo: string;
  dsCaminho: string;
  tpObjeto: string;
}

export interface AnexoListItem {
  idAnexo?: number;
  idObjeto?: number;
  name: string;
  size?: number;
  nmArquivo?: string;
  dsCaminho?: string;
  tpObjeto?: string;
}

interface WizardProps {
  solicitacao: SolicitacaoResponse | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  responsaveis: ResponsavelResponse[];
  temas: TemaResponse[];
  initialSubject?: string;
  initialDescription?: string;
}

export default function SolicitacaoModalWizard({
  solicitacao,
  open,
  onClose,
  onSave,
  responsaveis,
  temas,
  initialSubject,
  initialDescription,
}: WizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [prazoExcepcional, setPrazoExcepcional] = useState(false);

  const [formData, setFormData] = useState<SolicitacaoRequest>({
    cdIdentificacao: '',
    dsAssunto: '',
    dsSolicitacao: '',
    dsObservacao: '',
    flStatus: 'P',
    idResponsavel: 0,
    idTema: 0,
    idsAreas: [],
    nrPrazo: undefined,
    tpPrazo: '',
    nrOficio: '',
    nrProcesso: '',
  });

  const [anexos, setAnexos] = useState<File[]>([]);
  const [anexosBackend, setAnexosBackend] = useState<AnexoFromBackend[]>([]);
  const [statusPrazos, setStatusPrazos] = useState<StatusSolicPrazoTemaResponse[]>([]);
  const [loadingStatusPrazos, setLoadingStatusPrazos] = useState(false);

  useEffect(() => {
    if (solicitacao) {
      setFormData({
        idEmail: solicitacao.idEmail,
        cdIdentificacao: solicitacao.cdIdentificacao || '',
        dsAssunto: solicitacao.dsAssunto || '',
        dsSolicitacao: solicitacao.dsSolicitacao || '',
        dsObservacao: solicitacao.dsObservacao || '',
        flStatus: solicitacao.flStatus || 'P',
        idResponsavel: solicitacao.idResponsavel || 0,
        idTema: solicitacao.idTema || 0,
        idsAreas: solicitacao.areas?.map((a) => a.idArea) || [],
        nrPrazo: solicitacao.nrPrazo || undefined,
        tpPrazo: solicitacao.tpPrazo || '',
        nrOficio: solicitacao.nrOficio || '',
        nrProcesso: solicitacao.nrProcesso || '',
      });
      setPrazoExcepcional(Boolean(solicitacao.nrPrazo && solicitacao.nrPrazo > 0));
    } else {
      setFormData({
        cdIdentificacao: '',
        dsAssunto: initialSubject || '',
        dsSolicitacao: initialDescription || '',
        dsObservacao: '',
        flStatus: 'P',
        idResponsavel: 0,
        idTema: 0,
        idsAreas: [],
        nrPrazo: undefined,
        tpPrazo: '',
        nrOficio: '',
        nrProcesso: '',
      });
      setPrazoExcepcional(false);
    }
    setCurrentStep(1);
    setAnexos([]);
  }, [solicitacao, open, initialSubject, initialDescription]);

  useEffect(() => {
    if (solicitacao?.idSolicitacao && open) {
      solicitacoesClient.buscarAnexos(solicitacao.idSolicitacao).then(setAnexosBackend);
    } else {
      setAnexosBackend([]);
    }
    if (!open) setAnexos([]);
  }, [solicitacao, open]);

  const getResponsavelFromTema = useCallback(
    (temaId: number): number => {
      const tema = temas.find((t) => t.idTema === temaId);
      if (tema && responsaveis.length > 0) return responsaveis[0].idResponsavel;
      return responsaveis.length > 0 ? responsaveis[0].idResponsavel : 0;
    },
    [temas, responsaveis]
  );

  const getSelectedTema = useCallback(() => temas.find((t) => t.idTema === formData.idTema), [temas, formData.idTema]);

  const fillDataFromTema = useCallback(
    (temaId: number) => {
      const tema = temas.find((t) => t.idTema === temaId);
      if (tema) {
        const areasIds = tema.areas?.map((a) => a.idArea) || [];
        const responsavelId = getResponsavelFromTema(temaId);
        setFormData((prev) => ({
          ...prev,
          idTema: temaId,
          idResponsavel: responsavelId,
          idsAreas: areasIds,
          nrPrazo: tema.nrPrazo || undefined,
          tpPrazo: tema.tpPrazo || '',
        }));
      }
    },
    [temas, getResponsavelFromTema]
  );

  const isStep1Valid = useCallback(() => formData.cdIdentificacao?.trim() !== '', [formData.cdIdentificacao]);
  const isStep2Valid = useCallback(() => !!formData.idTema && formData.idTema > 0, [formData.idTema]);
  const canGoToStep = useCallback(
    (step: number) => {
      if (step === 1) return true;
      if (step === 2) return isStep1Valid();
      if (step >= 3) return isStep1Valid() && isStep2Valid();
      return true;
    },
    [isStep1Valid, isStep2Valid]
  );

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processed: string | number | undefined = value;
    if (name === 'dsAssunto') processed = capitalize(value);
    if (name === 'nrPrazo') processed = value === '' ? undefined : parseInt(value);
    setFormData((p) => ({ ...p, [name]: processed }));
  }, []);

  const handleAreasSelectionChange = useCallback((selectedIds: number[]) => setFormData((p) => ({ ...p, idsAreas: selectedIds })), []);

  const handleSelectChange = useCallback(
    (field: keyof SolicitacaoRequest, value: string) => {
      let processed: string | number | undefined = value;
      if (field.includes('id') && field !== 'cdIdentificacao') processed = value ? parseInt(value) : 0;
      setFormData((prev) => {
        const next = { ...prev, [field]: processed } as SolicitacaoRequest;
        if (field === 'idTema' && processed) next.idResponsavel = getResponsavelFromTema(processed as number);
        return next;
      });
    },
    [getResponsavelFromTema]
  );

  const handleNextStep = useCallback(() => {
    setCurrentStep((s) => Math.min(5, s + 1));
  }, []);
  const handlePreviousStep = useCallback(() => setCurrentStep((s) => Math.max(1, s - 1)), []);
  const handleStepClick = useCallback((step: number) => canGoToStep(step) && setCurrentStep(step), [canGoToStep]);

  const handleAddAnexos = useCallback((files: FileList | null) => {
    if (files && files.length > 0) setAnexos((prev) => [...prev, ...Array.from(files)]);
  }, []);
  const handleRemoveAnexo = useCallback((index: number) => setAnexos((prev) => prev.filter((_, i) => i !== index)), []);

  const handleRemoveAnexoBackend = useCallback(
    async (idAnexo: number) => {
      if (!solicitacao?.idSolicitacao) return;
      try {
        await solicitacoesClient.removerAnexo(solicitacao.idSolicitacao, idAnexo);
        setAnexosBackend((prev) => prev.filter((a) => a.idAnexo !== idAnexo));
        toast.success('Documento removido com sucesso');
      } catch {
        toast.error('Erro ao remover documento');
      }
    },
    [solicitacao?.idSolicitacao]
  );

  const handleDownloadAnexoBackend = useCallback(async (anexo: AnexoListItem) => {
    try {
      if (!anexo.idObjeto || !anexo.idAnexo) return toast.error('Dados do documento incompletos');
      const blob = await solicitacoesClient.downloadAnexo(anexo.idObjeto, anexo.idAnexo);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = anexo.nmArquivo || anexo.name || 'documento';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Erro ao baixar documento');
    }
  }, []);

  const loadStatusPrazos = useCallback(async () => {
    if (!formData.idTema) return;
    try {
      setLoadingStatusPrazos(true);
      const prazos = await statusPrazoTemaClient.listarPrazosTema(formData.idTema);
      setStatusPrazos(prazos);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao carregar configurações de prazos');
    } finally {
      setLoadingStatusPrazos(false);
    }
  }, [formData.idTema]);

  const updateLocalPrazo = useCallback(
    (statusCodigo: string, valor: number) => {
      setStatusPrazos((prev) => {
        const found = prev.find((p) => String(p.statusCodigo) === statusCodigo);
        if (found) {
          return prev.map((p) => (String(p.statusCodigo) === statusCodigo ? { ...p, nrPrazoInterno: valor } : p));
        }
        return [
          ...prev,
          {
            idStatusSolicPrazoTema: 0,
            statusCodigo: parseInt(statusCodigo),
            nrPrazoInterno: valor,
            tema: { idTema: formData.idTema || 0, nmTema: getSelectedTema()?.nmTema || '' },
            flAtivo: 'S',
          } as StatusSolicPrazoTemaResponse,
        ];
      });
    },
    [formData.idTema, getSelectedTema]
  );

  const onPrazoFieldChange = useCallback(
    (name: 'nrPrazo' | 'tpPrazo', value: string) => {
      if (name === 'nrPrazo') {
        setFormData((p) => ({ ...p, nrPrazo: value === '' ? undefined : parseInt(value) }));
      } else {
        setFormData((p) => ({ ...p, tpPrazo: value }));
      }
    },
    []
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isStep1Valid()) return toast.error('Código de identificação é obrigatório');
    if (!isStep2Valid()) return toast.error('Tema é obrigatório');

    try {
      setLoading(true);
      const finalFormData: SolicitacaoRequest = {
        ...formData,
        idResponsavel: formData.idResponsavel || getResponsavelFromTema(formData.idTema!),
        dsAssunto: formData.dsAssunto?.trim() || undefined,
        dsSolicitacao: formData.dsSolicitacao?.trim() || undefined,
        dsObservacao: formData.dsObservacao?.trim() || undefined,
        nrOficio: formData.nrOficio?.trim() || undefined,
        nrProcesso: formData.nrProcesso?.trim() || undefined,
        nrPrazo: formData.nrPrazo && formData.nrPrazo > 0 ? formData.nrPrazo : undefined,
        tpPrazo: formData.tpPrazo?.trim() || undefined,
      } as SolicitacaoRequest;

      let solicitacaoId: number | undefined;
      if (solicitacao) {
        await solicitacoesClient.atualizar(solicitacao.idSolicitacao, finalFormData);
        solicitacaoId = solicitacao.idSolicitacao;
      } else {
        const created = await solicitacoesClient.criar(finalFormData);
        solicitacaoId = created.idSolicitacao;
      }

      if (formData.idTema && statusPrazos.length > 0) {
        try {
          for (const prazo of statusPrazos) {
            if (prazo.nrPrazoInterno > 0) {
              await statusPrazoTemaClient.upsertPrazoStatus(formData.idTema, prazo.statusCodigo, { nrPrazoInterno: prazo.nrPrazoInterno });
            }
          }
        } catch {
          toast.error('Erro ao salvar prazos internos');
        }
      }

      if (anexos.length > 0 && solicitacaoId) {
        const fd = new FormData();
        anexos.forEach((f) => fd.append('files', f));
        fd.append('idObjeto', String(solicitacaoId));
        fd.append('tpObjeto', 'S');
        await solicitacoesClient.uploadAnexos(fd);
      }

      toast.success('Solicitação salva com sucesso!');
      onSave();
      onClose();
    } catch {
      toast.error('Erro ao salvar solicitação');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentStep === 3 && formData.idTema) loadStatusPrazos();
  }, [currentStep, formData.idTema, loadStatusPrazos]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto space-y-8">
      <StepperNav currentStep={currentStep} canGoToStep={canGoToStep} onStepClick={handleStepClick} />

      <div className="h-[500px]">
        {currentStep === 1 && <Step1Dados formData={formData} onChange={handleInputChange} />}
        {currentStep === 2 && (
          <Step2TemaAreas
            formData={formData}
            temas={temas}
            onTemaPicked={fillDataFromTema}
            onAreasChange={handleAreasSelectionChange}
          />
        )}
        {currentStep === 3 && (
          <Step3StatusPrazos
            formData={formData}
            prazoExcepcional={prazoExcepcional}
            loadingStatusPrazos={loadingStatusPrazos}
            statusPrazos={statusPrazos}
            onTogglePrazoExcepcional={(v) => {
              setPrazoExcepcional(!!v);
              if (!v) setFormData((p) => ({ ...p, nrPrazo: undefined, tpPrazo: '' }));
            }}
            onPrazoFieldChange={onPrazoFieldChange}
            onUpdateLocalPrazo={updateLocalPrazo}
          />
        )}
        {currentStep === 4 && (
          <Step4Anexos
            anexos={anexos}
            anexosBackend={anexosBackend}
            onAddAnexos={handleAddAnexos}
            onRemoveAnexo={handleRemoveAnexo}
            onRemoveAnexoBackend={handleRemoveAnexoBackend}
            onDownloadAnexoBackend={handleDownloadAnexoBackend}
          />
        )}
        {currentStep === 5 && (
          <Step5Resumo
            formData={formData}
            responsaveis={responsaveis}
            getSelectedTema={getSelectedTema}
            anexosCount={anexos.length + anexosBackend.length}
          />
        )}
      </div>

      <div className="flex gap-3 pt-6 border-t mt-auto">
        <Button type="button" variant="outline" onClick={() => { setCurrentStep(1); onClose(); }} disabled={loading}>
          Cancelar
        </Button>

        {currentStep > 1 && (
          <Button type="button" variant="outline" onClick={handlePreviousStep} disabled={loading} className="flex items-center gap-2">
            <CaretLeftIcon size={16} />
            Anterior
          </Button>
        )}

        {currentStep < 5 && (
          <Button type="button" onClick={handleNextStep} disabled={loading || (currentStep === 2 && !isStep2Valid())} className="flex items-center gap-2">
            Próximo
            <CaretRightIcon size={16} />
          </Button>
        )}

        {currentStep === 5 && (
          <Button type="submit" disabled={loading} className="flex items-center gap-2">
            {solicitacao && <ArrowBendUpRightIcon className="h-4 w-4 mr-2" />}
            {loading ? 'Salvando...' : solicitacao ? 'Encaminhar Solicitação' : 'Criar Solicitação'}
          </Button>
        )}
      </div>
    </form>
  );
}

