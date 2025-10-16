'use client';

import {ChangeEvent, FormEvent, JSX, useCallback, useEffect, useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {TextField} from '@/components/ui/text-field';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Checkbox} from '@/components/ui/checkbox';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {SolicitacaoRequest, SolicitacaoResponse, SolicitacaoPrazoResponse} from '@/api/solicitacoes/types';
import {ResponsavelResponse} from '@/api/responsaveis/types';
import {TemaResponse} from '@/api/temas/types';
import {solicitacoesClient} from '@/api/solicitacoes/client';
import {toast} from 'sonner';
import {base64ToUint8Array, capitalize, getRows, hoursToDaysAndHours, saveBlob} from '@/utils/utils';
import {MultiSelectAreas} from '@/components/ui/multi-select-areas';
import {
  ArrowArcRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
  DownloadSimpleIcon,
} from '@phosphor-icons/react';
import {Stepper} from '@/components/ui/stepper';
import {Input} from '@nextui-org/react';
import AnexoComponent from '../AnexoComponotent/AnexoComponent';
import AnexoList from '../AnexoComponotent/AnexoList/AnexoList';
import {statusSolicPrazoTemaClient} from '@/api/status-prazo-tema/client';
import {StatusSolicPrazoTemaForUI} from '@/api/status-prazo-tema/types';
import {statusSolicitacaoClient, StatusSolicitacaoResponse} from '@/api/status-solicitacao/client';
import {AnexoResponse, TipoObjetoAnexo, TipoResponsavelAnexo} from '@/api/anexos/type';
import {areasClient} from '@/api/areas/client';
import tramitacoesClient from '@/api/tramitacoes/client';
import {anexosClient} from '@/api/anexos/client';
import {AreaResponse} from '@/api/areas/types';
import {usePermissoes} from "@/context/permissoes/PermissoesContext";
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { AnaliseGerenteDiretor } from '@/types/solicitacoes/types';
import { STATUS_LIST, statusList as statusListType } from '@/api/status-solicitacao/types';
import { MultiSelectAssinantes } from '../ui/multi-select-assinates';
import solicitacaoAssinanteClient from '@/api/solicitacao-assinante/client';

interface AnexoListItem {
  idAnexo?: number;
  idObjeto?: number;
  name: string;
  size?: number;
  nmArquivo?: string;
  dsCaminho?: string;
  tpObjeto?: string;
}

interface SolicitacaoModalProps {
  solicitacao: SolicitacaoResponse | null;
  open: boolean;

  onClose(): void;

  onSave(): void;

  responsaveis: ResponsavelResponse[];
  temas: TemaResponse[];
  initialSubject?: string;
  initialDescription?: string;
}

export default function SolicitacaoModal({
  solicitacao,
  open,
  onClose,
  onSave,
  responsaveis,
  temas,
  initialSubject,
  initialDescription
}: SolicitacaoModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(3);
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
    flAnaliseGerenteDiretor: '',
    flExcepcional: 'N',
    idsResponsaveisAssinates: []
  });
  const [loading, setLoading] = useState(false);
  const [anexos, setAnexos] = useState<File[]>([]);
  const [anexosBackend, setAnexosBackend] = useState<AnexoResponse[]>([]);
  const [anexosTypeE, setAnexosTypeE] = useState<AnexoResponse[]>([]);
  const [statusPrazos, setStatusPrazos] = useState<StatusSolicPrazoTemaForUI[]>([]);
  const [loadingStatusPrazos, setLoadingStatusPrazos] = useState(false);
  const [prazoExcepcional, setPrazoExcepcional] = useState(false);
  const [statusList, setStatusList] = useState<StatusSolicitacaoResponse[]>([]);
  const [createdSolicitacao] = useState<SolicitacaoResponse | null>(null);
  const [allAreas, setAllAreas] = useState<AreaResponse[]>([]);
  const {canListarAnexo, canInserirAnexo} = usePermissoes();
  const [hasLoadedStatusPrazos, setHasLoadedStatusPrazos] = useState(false);
  const [showConfirmSend, setShowConfirmSend] = useState(false);
  const [confirmSendId, setConfirmSendId] = useState<number | null>(null);
  const [confirmSendToast, setConfirmSendToast] = useState<string>('');
  const [hasTramitacoes, setHasTramitacoes] = useState(false);
  const [tramitacoesChecked, setTramitacoesChecked] = useState(false);
  const [prazosSolicitacaoPorStatus, setPrazosSolicitacaoPorStatus] = useState<SolicitacaoPrazoResponse[]>([]);

  const handleConfirmSend = useCallback(async () => {
    if (!confirmSendId) return;
    try {
      setLoading(true);
      await solicitacoesClient.etapaStatus(confirmSendId);
      toast.success(confirmSendToast || 'Solicitação enviada com sucesso!');
      onSave();
      onClose();
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao encaminhar solicitação');
    } finally {
      setLoading(false);
      setShowConfirmSend(false);
      setConfirmSendId(null);
      setConfirmSendToast('');
    }
  }, [confirmSendId, confirmSendToast, onClose, onSave, router]);

  
  useEffect(() => {
    const loadPrazos = async () => {
      const prazosSolicitacaoPorStatus = await solicitacoesClient.listarPrazos(solicitacao?.idSolicitacao || 0);
      setPrazosSolicitacaoPorStatus(prazosSolicitacaoPorStatus || []);
      
      if (solicitacao) {
        const isExcepcional = (solicitacao.flExcepcional || 'N') === 'S';
        setPrazoExcepcional(isExcepcional);
      }

      try {
        const temaId = formData.idTema || solicitacao?.idTema || solicitacao?.tema?.idTema || 0;
        const temaNome = getSelectedTema()?.nmTema || solicitacao?.tema?.nmTema || '';
        if ((prazosSolicitacaoPorStatus || []).length > 0) {
          const mapped = (prazosSolicitacaoPorStatus || []).map(p => ({
            idStatusSolicPrazoTema: 0,
            idStatusSolicitacao: p.idStatusSolicitacao,
            idTema: temaId,
            nrPrazoInterno: p.nrPrazoInterno || 0,
            tema: { idTema: temaId, nmTema: temaNome },
            flAtivo: 'S'
          })) as StatusSolicPrazoTemaForUI[];
          setStatusPrazos(mapped);
        }
      } catch {}
    };
    if (solicitacao?.idSolicitacao) {
      loadPrazos();
    }
  }, [solicitacao?.idSolicitacao]);

  useEffect(() => {
    const flExcepcionalValue = prazoExcepcional ? 'S' : 'N';
    setFormData(prev => ({
      ...prev,
      flExcepcional: flExcepcionalValue
    }));
  }, [prazoExcepcional]);

  useEffect(() => {
    const loadTramitacoes = async () => {
      try {
        const id = solicitacao?.idSolicitacao || createdSolicitacao?.idSolicitacao;
        if (id) {
          const list = await tramitacoesClient.listarPorSolicitacao(id);
          setHasTramitacoes((list?.length ?? 0) > 0);
        } else {
          setHasTramitacoes(false);
        }
      } catch {
        setHasTramitacoes(false);
      } finally {
        setTramitacoesChecked(true);
      }
    };
    if (open) {
      setTramitacoesChecked(false);
      loadTramitacoes();
    } else {
      setTramitacoesChecked(false);
    }
  }, [open, solicitacao?.idSolicitacao, createdSolicitacao?.idSolicitacao]);

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
        idTema: solicitacao.tema?.idTema || solicitacao.idTema || 0,
        idsAreas: [
          ...(solicitacao.area?.map(a => a.idArea) || []),
          ...(solicitacao.tema?.areas?.map(a => a.idArea) || [])
        ],
        nrPrazo: solicitacao.nrPrazo || undefined,
        tpPrazo: solicitacao.tpPrazo === 'C' ? 'H' : (solicitacao.tpPrazo || ''),
        nrOficio: solicitacao.nrOficio || '',
        nrProcesso: solicitacao.nrProcesso || '',
        flAnaliseGerenteDiretor: solicitacao.flAnaliseGerenteDiretor || '',
        flExcepcional: solicitacao.flExcepcional || 'N'
      });
      
      const isExcepcional = (solicitacao.flExcepcional || 'N') === 'S';
      setPrazoExcepcional(isExcepcional);

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
        flAnaliseGerenteDiretor: '',
        flExcepcional: 'N'
      });
      
      setPrazoExcepcional(false);

    }
    setCurrentStep(1);
    setAnexos([]);
  }, [solicitacao, open, initialSubject, initialDescription]);

  useEffect(() => {
    if (solicitacao && solicitacao.idSolicitacao && open) {
      solicitacoesClient.buscarAnexos(solicitacao.idSolicitacao).then((anexos) => {
        setAnexosBackend(anexos);
      });
    } else {
      setAnexosBackend([]);
    }
    if (!open) {
      setAnexos([]);
    }
  }, [solicitacao, open, initialSubject, initialDescription]);

  useEffect(() => {
    const loadAssinantes = async () => {
      if (solicitacao?.idSolicitacao && open) {
        try {
          const assinantes = await solicitacaoAssinanteClient.buscarPorIdSolicitacaoEIdStatusSolicitacao(
            solicitacao.idSolicitacao,
            [statusListType.EM_ASSINATURA_DIRETORIA.id]
          );
          const idsAssinantes = assinantes.map(a => a.idResponsavel);
          setFormData(prev => ({
            ...prev,
            idsResponsaveisAssinates: idsAssinantes
          }));
        } catch (error) {
          console.error('Erro ao carregar assinantes:', error);
        }
      }
    };

    loadAssinantes();
  }, [solicitacao?.idSolicitacao, open]);

  useEffect(() => {
    const loadAllAreas = async () => {
      try {
        const areaResponse = await areasClient.buscarPorFiltro({ size: 1000 });
        const areasAtivas = areaResponse.content.filter((area: AreaResponse) => area.flAtivo === 'S');
        setAllAreas(areasAtivas);
      } catch (error) {
        console.error('Erro ao carregar áreas:', error);
        setAllAreas([]);
      }
    };

    if (open) {
      loadAllAreas();
    }
  }, [open]);

  const getResponsavelFromTema = useCallback((temaId: number): number => {
    const tema = temas.find(t => t.idTema === temaId);
    if (tema && responsaveis.length > 0) {
      return responsaveis[0].idResponsavel;
    }
    return responsaveis.length > 0 ? responsaveis[0].idResponsavel : 0;
  }, [temas, responsaveis]);

  const getResponsavelByArea = useCallback((areaId: number) => {
    return responsaveis.find(resp =>
      resp.areas?.some(respArea => respArea.area.idArea === areaId)
    );
  }, [responsaveis]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number | undefined = value;

    if (name === 'dsAssunto') {
      processedValue = capitalize(value);
    } else if (name === 'nrPrazo') {
      processedValue = value === '' ? undefined : parseInt(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  }, []);

  const handleAreasSelectionChange = useCallback((selectedIds: number[]) => {
    setFormData(prev => ({
      ...prev,
      idsAreas: selectedIds
    }));
  }, []);

  const handleResponsaveisSelectionChange = useCallback((selectedIds: number[]) => {
    setFormData(prev => ({
      ...prev,
      idsResponsaveisAssinates: selectedIds
    }));
  }, []);

  const isStep1Valid = useCallback(() => {
    return formData.cdIdentificacao?.trim() !== '' && 
      ([
        AnaliseGerenteDiretor.D,
        AnaliseGerenteDiretor.G,
        AnaliseGerenteDiretor.N,
        AnaliseGerenteDiretor.A,
      ] as string[]).includes((formData.flAnaliseGerenteDiretor || '').toUpperCase());
  }, [formData.cdIdentificacao, formData.flAnaliseGerenteDiretor]);

  const isStep2Valid = useCallback(() => {
    return (formData.idTema !== undefined && formData.idTema > 0 &&
      formData.idsAreas && formData.idsAreas.length > 0) || false;
  }, [formData.idTema, formData.idsAreas]);

  const isStep4Valid = useCallback(() => {
    return !!(formData.idsResponsaveisAssinates && formData.idsResponsaveisAssinates.length === 2);
  }, [formData.idsResponsaveisAssinates]);

  const getSelectedTema = useCallback(() => {
    return temas.find(tema => tema.idTema === formData.idTema);
  }, [temas, formData.idTema]);

  const handleNextStep = useCallback(async (onFinish?: () => void) => {
    try {
      if (currentStep === 1) {
        if (!formData.cdIdentificacao?.trim()) {
          toast.error("Código de identificação é obrigatório");
          return;
        }
        if (!solicitacao) {
          setCurrentStep(2);
          return;
        }
        if (!hasTramitacoes) {
          await solicitacoesClient.etapaIdentificacao(solicitacao.idSolicitacao, {
            cdIdentificacao: formData.cdIdentificacao?.trim(),
            dsAssunto: formData.dsAssunto?.trim(),
            dsObservacao: formData.dsObservacao?.trim(),
            nrOficio: formData.nrOficio?.trim(),
            nrProcesso: formData.nrProcesso?.trim(),
            flAnaliseGerenteDiretor: formData.flAnaliseGerenteDiretor
          });
        }

        setCurrentStep(2);
      } else if (currentStep === 2) {
        if (!formData.idTema || formData.idTema === 0) {
          toast.error("Tema é obrigatório");
          return;
        }

        if (!formData.idsAreas || formData.idsAreas.length === 0) {
          toast.error("Selecione pelo menos uma área");
          return;
        }

        try {
          const prazosPadrao = await statusSolicPrazoTemaClient.buscarPrazosPadraoParaUI(formData.idTema);
          if (prazosPadrao.length > 0) {
            setStatusPrazos(prazosPadrao);
          }
        } catch (error) {
          console.error('Erro ao carregar prazos padrão:', error);
        }

        if (!solicitacao) {
          setCurrentStep(3);
          return;
        }
        if (!hasTramitacoes) {
          await solicitacoesClient.etapaTema(solicitacao.idSolicitacao, {
            idTema: formData.idTema,
            tpPrazo: formData.tpPrazo || undefined,
            nrPrazoInterno: formData.nrPrazo,
            flExcepcional: formData.flExcepcional === 'S' ? 'S' : 'N',
            idsAreas: formData.idsAreas
          });
        }

        setCurrentStep(3);
      } else if (currentStep === 3) {
        if (!solicitacao) {
          setCurrentStep(4);
          return;
        }
        if (!hasTramitacoes) {
          const solicitacoesPrazos = statusPrazos
            .filter(p => p.nrPrazoInterno && p.nrPrazoInterno > 0 && p.idStatusSolicitacao)
            .map(p => ({
              idStatusSolicitacao: p.idStatusSolicitacao!,
              nrPrazoInterno: p.nrPrazoInterno,
              tpPrazo: formData.tpPrazo || undefined,
              flExcepcional: formData.flExcepcional || 'N'
            }));


          await solicitacoesClient.etapaPrazo(solicitacao.idSolicitacao, {
            idTema: formData.idTema,
            nrPrazoInterno: formData.nrPrazo,
            flExcepcional: formData.flExcepcional,
            solicitacoesPrazos
          });
        }

        setCurrentStep(4);
      } else if (currentStep === 4) {
        if (!formData.idsResponsaveisAssinates || formData.idsResponsaveisAssinates.length !== 2) {
          toast.error("Selecione exatamente 2 validadores/assinantes para continuar");
          return;
        }

        if (!solicitacao) {
          setCurrentStep(5);
          return;
        }

        if (!hasTramitacoes && formData.idsResponsaveisAssinates && formData.idsResponsaveisAssinates.length > 0) {
          await solicitacaoAssinanteClient.criar(formData.idsResponsaveisAssinates.map(id => ({
            idSolicitacao: solicitacao.idSolicitacao,
            idStatusSolicitacao: statusListType.EM_ASSINATURA_DIRETORIA.id,
            idResponsavel: id
          })));
        }

        setCurrentStep(5);
      }
      else if (currentStep === 5) {
        if (!solicitacao) {
          setCurrentStep(6);
          return;
        }
        if (!hasTramitacoes) {
          if (anexos.length > 0) {
            const existingNames = new Set([
              ...anexosBackend.map(a => (a.nmArquivo || '').trim().toLowerCase()),
              ...anexosTypeE.map(a => (a.nmArquivo || '').trim().toLowerCase()),
            ]);

            const newNames = anexos
              .map(file => (file.name || '').trim().toLowerCase())
              .filter(name => name !== '');

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
              filesToUpload.map(async (file) => {
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
                  tpResponsavel: TipoResponsavelAnexo.A // TODO: Colocado apenas para remover erro, necessário ajustar depois
                };
              })
            );

            try {
              setLoading(true);
              await solicitacoesClient.uploadAnexos(solicitacao.idSolicitacao, arquivosDTO);
              try {
                const atualizados = await solicitacoesClient.buscarAnexos(solicitacao.idSolicitacao);
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
    } finally {
      if (!onFinish || typeof onFinish !== 'function') return;

      onFinish();
    }
  }, [currentStep, formData, solicitacao, statusPrazos, anexos, anexosBackend, anexosTypeE, hasTramitacoes]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    } else if (currentStep === 5) {
      setCurrentStep(4);
    } else if (currentStep === 6) {
      setCurrentStep(5);
    }
  }, [currentStep]);

  const handleStepClick = useCallback((step: number) => {
    if (step === 1) {
      setCurrentStep(step);
    } else if (step === 2 && isStep1Valid()) {
      setCurrentStep(step);
    } else if (step === 3 && isStep1Valid() && isStep2Valid()) {
      setCurrentStep(step);
    } else if (step === 4 && isStep1Valid() && isStep2Valid()) {
      setCurrentStep(step);
    } else if (step === 5 && isStep1Valid() && isStep2Valid() && isStep4Valid()) {
      setCurrentStep(step);
    } else if (step === 6 && isStep1Valid() && isStep2Valid() && isStep4Valid()) {
      setCurrentStep(step);
    }
  }, [isStep1Valid, isStep2Valid, isStep4Valid]);

  const handleAddAnexos = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setAnexos(prev => [...prev, ...fileArray]);
    }
  }, []);

  const handleRemoveAnexo = useCallback((index: number) => {
    setAnexos(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleRemoveAnexoBackend = useCallback(async (idAnexo: number) => {
    if (!solicitacao?.idSolicitacao) return;

    try {
      await solicitacoesClient.removerAnexo(solicitacao.idSolicitacao, idAnexo);
      setAnexosBackend(prev => prev.filter(anexo => anexo.idAnexo !== idAnexo));
      toast.success('Documento removido com sucesso');
    } catch {
      toast.error('Erro ao remover documento');
    }
  }, [solicitacao?.idSolicitacao]);

  const handleDownloadAnexoBackend = useCallback(async (anexo: AnexoListItem) => {
    try {
      if (!anexo.idObjeto || !anexo.nmArquivo) {
        toast.error('Dados do documento incompletos');
        return;
      }

      const arquivos = await solicitacoesClient.downloadAnexo(anexo.idObjeto, anexo.nmArquivo);

      if (arquivos.length > 0) {
        arquivos.forEach((arquivo) => {
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

      const arquivos = await anexosClient.download(anexo.idObjeto, TipoObjetoAnexo.E, anexo.nmArquivo);

      if (arquivos.length > 0) {
        arquivos.forEach((arquivo) => {
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      let id = solicitacao?.idSolicitacao || createdSolicitacao?.idSolicitacao;

      if (createdSolicitacao?.idSolicitacao) {
        if (hasTramitacoes) { toast.message('Esta solicitação já possui tramitações iniciadas. Edição bloqueada.'); setLoading(false); return; }
        setConfirmSendId(createdSolicitacao.idSolicitacao);
        setConfirmSendToast('Solicitação criada com sucesso!');
        setShowConfirmSend(true);
        setLoading(false);
        return;
      } else if (solicitacao?.idSolicitacao) {
        if (hasTramitacoes) { toast.message('Esta solicitação já possui tramitações iniciadas. Edição bloqueada.'); setLoading(false); return; }
        setConfirmSendId(solicitacao.idSolicitacao);
        setConfirmSendToast('Solicitação encaminhada com sucesso!');
        setShowConfirmSend(true);
        setLoading(false);
        return;
      } else {
        if (!formData.cdIdentificacao?.trim()) { toast.error('Código de identificação é obrigatório'); setLoading(false); return; }
        if (!formData.idTema || formData.idTema === 0) { toast.error('Tema é obrigatório'); setLoading(false); return; }
        if (!formData.flAnaliseGerenteDiretor || ![
          AnaliseGerenteDiretor.G,
          AnaliseGerenteDiretor.D,
          AnaliseGerenteDiretor.A,
          AnaliseGerenteDiretor.N,
        ].includes((formData.flAnaliseGerenteDiretor || '').toUpperCase() as AnaliseGerenteDiretor)) {
          toast.error('Selecione GERENTE, DIRETOR, AMBOS ou NÃO NECESSITA');
          setLoading(false);
          return;
        }

        const created = await solicitacoesClient.criar({
          idTema: formData.idTema,
          cdIdentificacao: formData.cdIdentificacao?.trim(),
          dsAssunto: formData.dsAssunto?.trim(),
          dsSolicitacao: formData.dsSolicitacao?.trim(),
          dsObservacao: formData.dsObservacao?.trim(),
          nrOficio: formData.nrOficio?.trim(),
          nrProcesso: formData.nrProcesso?.trim(),
          flExcepcional: formData.flExcepcional === 'S' ? 'S' : 'N',
          flAnaliseGerenteDiretor: formData.flAnaliseGerenteDiretor,
        });
        id = created.idSolicitacao;

        await solicitacoesClient.etapaIdentificacao(id, {
          cdIdentificacao: formData.cdIdentificacao?.trim(),
          dsAssunto: formData.dsAssunto?.trim(),
          dsObservacao: formData.dsObservacao?.trim(),
          nrOficio: formData.nrOficio?.trim(),
          nrProcesso: formData.nrProcesso?.trim(),
          flAnaliseGerenteDiretor: formData.flAnaliseGerenteDiretor
        });

        await solicitacoesClient.etapaTema(id, {
          idTema: formData.idTema,
          tpPrazo: formData.tpPrazo || undefined,
          nrPrazoInterno: formData.nrPrazo,
          flExcepcional: formData.flExcepcional === 'S' ? 'S' : 'N',
          idsAreas: formData.idsAreas
        });

        if (formData.flExcepcional === 'S') {
          const solicitacoesPrazos = statusPrazos
            .filter(p => p.nrPrazoInterno && p.nrPrazoInterno > 0 && p.idStatusSolicitacao)
            .map(p => ({
              idStatusSolicitacao: p.idStatusSolicitacao!,
              idTema: formData.idTema,
              nrPrazoInterno: p.nrPrazoInterno,
              nrPrazoExterno: p.nrPrazoExterno,
              tpPrazo: formData.tpPrazo || undefined,
              flExcepcional: 'S'
            }));
          await solicitacoesClient.etapaPrazo(id, {
            idTema: formData.idTema,
            nrPrazoInterno: formData.nrPrazo,
            flExcepcional: 'S',
            solicitacoesPrazos
          });
        } else {
          await solicitacoesClient.etapaPrazo(id, {
            idTema: formData.idTema,
            nrPrazoInterno: formData.nrPrazo,
            flExcepcional: 'N',
            solicitacoesPrazos: []
          });
        }

        if (anexos.length > 0) {
          const newNames = anexos
            .map(file => (file.name || '').trim().toLowerCase())
            .filter(name => name !== '');
          const duplicateWithinNew = newNames.filter((name, idx, arr) => arr.indexOf(name) !== idx);
          const duplicateNames = Array.from(new Set(duplicateWithinNew));
          if (duplicateNames.length > 0) {
            toast.error(`Já existe anexo com o mesmo nome: ${duplicateNames.join(', ')}`);
            setLoading(false);
            return;
          }
          const arquivosDTO = await Promise.all(
            anexos.map(async (file) => {
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
                tpResponsavel: TipoResponsavelAnexo.A // TODO: Colocado apenas para remover erro, necessário ajustar depois
              };
            })
          );
          await solicitacoesClient.uploadAnexos(id, arquivosDTO);
        }

        setConfirmSendId(id!);
        setConfirmSendToast('Solicitação criada com sucesso!');
        setShowConfirmSend(true);
        setLoading(false);
        return;
      }
      
    } catch (err) {
      console.error(err);
      toast.error(solicitacao || createdSolicitacao ? 'Erro ao encaminhar solicitação' : 'Erro ao criar solicitação');
    } finally {

    }
  };
  
  const renderStep1 = () =>   (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <TextField
          label="Código de Identificação *"
          name="cdIdentificacao"
          value={formData.cdIdentificacao}
          onChange={handleInputChange}
          required
          autoFocus
          maxLength={50}
          disabled={hasTramitacoes}
        />
        <TextField
          label="Nº Ofício"
          name="nrOficio"
          value={formData.nrOficio}
          onChange={handleInputChange}
          maxLength={50}
          disabled={hasTramitacoes}
        />
        <TextField
          label="Nº Processo"
          name="nrProcesso"
          value={formData.nrProcesso}
          onChange={handleInputChange}
          maxLength={50}
          disabled={hasTramitacoes}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="flAnaliseGerenteDiretor" className="text-sm font-medium">
            Exige aprovação especial? *
          </Label>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={(formData.flAnaliseGerenteDiretor || '').toUpperCase() === AnaliseGerenteDiretor.G}
                onCheckedChange={() => setFormData(prev => ({
                  ...prev,
                  flAnaliseGerenteDiretor: AnaliseGerenteDiretor.G
                }))}
                disabled={hasTramitacoes}
              />
              <Label className="text-sm font-light">Gerente</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={(formData.flAnaliseGerenteDiretor || '').toUpperCase() === AnaliseGerenteDiretor.D}
                onCheckedChange={() => setFormData(prev => ({
                  ...prev,
                  flAnaliseGerenteDiretor: AnaliseGerenteDiretor.D
                }))}
                disabled={hasTramitacoes}
              />
              <Label className="text-sm font-light ">Diretor</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={(formData.flAnaliseGerenteDiretor || '').toUpperCase() === AnaliseGerenteDiretor.A}
                onCheckedChange={() => setFormData(prev => ({
                  ...prev,
                  flAnaliseGerenteDiretor: AnaliseGerenteDiretor.A
                }))}
                disabled={hasTramitacoes}
              />
              <Label className="text-sm font-light">Ambos</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={(formData.flAnaliseGerenteDiretor || '').toUpperCase() === AnaliseGerenteDiretor.N}
                onCheckedChange={() => setFormData(prev => ({
                  ...prev,
                  flAnaliseGerenteDiretor: AnaliseGerenteDiretor.N
                }))}
                disabled={hasTramitacoes}
              />
              <Label className="text-sm font-light">Não necessita</Label>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dsAssunto">Assunto</Label>
        <Textarea
          id="dsAssunto"
          name="dsAssunto"
          value={formData.dsAssunto}
          onChange={handleInputChange}
          rows={4}
          disabled={hasTramitacoes}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dsObservacao">Observações</Label>
        <Textarea
          id="dsObservacao"
          name="dsObservacao"
          value={formData.dsObservacao}
          onChange={handleInputChange}
          rows={4}
          disabled={hasTramitacoes}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dsSolicitacao">Descrição da Solicitação</Label>
        <Textarea
          id="dsSolicitacao"
          name="dsSolicitacao"
          value={formData.dsSolicitacao}
          onChange={handleInputChange}
          rows={getRows(formData.dsSolicitacao)}
          disabled={solicitacao?.idSolicitacao !== undefined}
        />
      </div>
    </div>
  );

  const renderStep2 = useCallback(() => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="tema">Tema *</Label>
        <Select
          value={formData.idTema ? formData.idTema.toString() : ''}
          onValueChange={(value) => {
            const temaId = parseInt(value);
            setFormData(prev => ({
              ...prev,
              idTema: temaId,
              idResponsavel: getResponsavelFromTema(temaId),
              nrPrazo: temas.find(t => t.idTema === temaId)?.nrPrazo || undefined,
              tpPrazo: 'H'
            }));
          }}
          disabled={hasTramitacoes}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tema" />
          </SelectTrigger>
          <SelectContent>
            {solicitacao?.tema && !temas.find(t => t.idTema === solicitacao.tema!.idTema) && (
              <SelectItem key={solicitacao.tema.idTema} value={solicitacao.tema.idTema.toString()}>
                {solicitacao.tema.nmTema}
              </SelectItem>
            )}
            {temas.map((tema) => (
              <SelectItem key={tema.idTema} value={tema.idTema.toString()}>
                {tema.nmTema}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!tramitacoesChecked ? (
        <div className="text-sm text-gray-500">Verificando tramitações...</div>
      ) : (
        <MultiSelectAreas
          selectedAreaIds={formData.idsAreas || []}
          onSelectionChange={handleAreasSelectionChange}
          disabled={hasTramitacoes}
          label="Áreas *"
        />
      )}
    </div>
  ), [formData.idTema, formData.idsAreas, temas, getResponsavelFromTema, handleAreasSelectionChange, solicitacao, hasTramitacoes, tramitacoesChecked]);

  function horasParaDias(horas: number): number {
    return Math.floor(horas / 24);
  }
  const loadStatusPrazos = useCallback(async (isRefresh: boolean = false) => {
    if (!formData.idTema || (hasLoadedStatusPrazos && !isRefresh)) return;

    try {
      setLoadingStatusPrazos(true);
      const selectedTema = temas.find(t => t.idTema === formData.idTema);

        try {
          if (prazosSolicitacaoPorStatus.length > 0) {
            const temaId = formData.idTema || solicitacao?.idTema || solicitacao?.tema?.idTema || 0;
            const temaNome = selectedTema?.nmTema || solicitacao?.tema?.nmTema || '';
            const mapped = (prazosSolicitacaoPorStatus || []).map(p => ({
              idStatusSolicPrazoTema: 0,
              idStatusSolicitacao: p.idStatusSolicitacao,
              idTema: temaId,
              nrPrazoInterno: p.nrPrazoInterno || 0,
              tema: { idTema: temaId, nmTema: temaNome },
              flAtivo: 'S'
            })) as StatusSolicPrazoTemaForUI[];
            setStatusPrazos(mapped);
          } else {
            setStatusPrazos(getDefaultPrazos());
          }
        } catch (errorPadrao) {
          console.error('Erro ao carregar prazos padrão:', errorPadrao);
          setStatusPrazos(getDefaultPrazos());
        }
    } catch (error) {
      console.error('Erro ao carregar prazos por status:', error);
      toast.error('Erro ao carregar configurações de prazos');
    } finally {
      setLoadingStatusPrazos(false);
      setHasLoadedStatusPrazos(true);
    }
  }, [formData.idTema, temas]);

  const updateLocalPrazo = useCallback((idStatus: number, valor: number) => {
    setStatusPrazos(prev => {
      const existing = prev.find(p => p.idStatusSolicitacao === idStatus);
      if (existing) {
        const updated = prev.map(p =>
          p.idStatusSolicitacao === idStatus
            ? { ...p, nrPrazoInterno: valor }
            : p
        );
        return updated;
      } else {
        const newPrazo = {
          idStatusSolicPrazoTema: 0,
          idStatusSolicitacao: idStatus,
          nrPrazoInterno: valor,
          nrPrazoExterno: 0,
          idTema: formData.idTema || 0,
          flAtivo: 'S'
        } as StatusSolicPrazoTemaForUI;
        const newArray = [...prev, newPrazo];
        return newArray;
      }
    });
  }, [formData.idTema]);

  const selectedTema = getSelectedTema();

  const statusOcultos = [
    statusListType.PRE_ANALISE.id,
    statusListType.VENCIDO_REGULATORIO.id,
    statusListType.VENCIDO_AREA_TECNICA.id,
    statusListType.ARQUIVADO.id,
  ];

  const getDefaultPrazos = useCallback((): StatusSolicPrazoTemaForUI[] => {
    const defaultPrazosPorStatus: { [key: number]: number } = {
      [statusListType.ANALISE_REGULATORIA.id]: 72,
      [statusListType.EM_APROVACAO.id]: 48,
      [statusListType.EM_ASSINATURA_DIRETORIA.id]: 48,
    };
        
    const allStatus = statusList.length > 0 ? statusList : STATUS_LIST.map(status => ({
      idStatusSolicitacao: status.id,
      nmStatus: status.label
    }));

    const statusFiltrados = allStatus.filter(status => !statusOcultos.includes(status.idStatusSolicitacao));

    return statusFiltrados.map(status => ({
      idStatusSolicPrazoTema: 0,
      idStatusSolicitacao: status.idStatusSolicitacao,
      idTema: formData?.idTema || 0,
      nrPrazoInterno: defaultPrazosPorStatus[status.idStatusSolicitacao] || 0,
      nrPrazoExterno: 0,
      tema: {
        idTema: formData?.idTema || 0,
        nmTema: getSelectedTema()?.nmTema || ''
      },
      flAtivo: 'S'
    }));
  }, [formData?.idTema, statusList, getSelectedTema]);

  const currentPrazoTotal = useMemo(() => {
    const total = statusPrazos.reduce((acc, curr) => acc + curr.nrPrazoInterno, 0);

    return total;
  }, [statusPrazos, prazoExcepcional]);

  const renderStep3 = useCallback((): JSX.Element => {
    const statusOcultos = [
      statusListType.PRE_ANALISE.id,
      statusListType.VENCIDO_REGULATORIO.id,
      statusListType.VENCIDO_AREA_TECNICA.id,
      statusListType.ARQUIVADO.id,
    ];
    
    const allStatusOptions = statusList.length > 0 ? statusList.map(status => ({
      codigo: status.idStatusSolicitacao,
      nome: status.nmStatus
    })) : STATUS_LIST.map(status => ({
      codigo: status.id,
      nome: status.label
    }));
    
    const statusOptions = allStatusOptions.filter(status => !statusOcultos.includes(status.codigo));

    return (
      <div className="space-y-6">
        {formData.idTema ? (
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center w-full gap-3">
                <h3 className="text-lg font-medium text-gray-900">Configuração de Prazos por Status</h3>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="prazoExcepcional"
                    checked={prazoExcepcional}
                    disabled={hasTramitacoes}
                    onCheckedChange={async (checked) => {
                      if (hasTramitacoes) return;
                      const ativo = !!checked;
                      setPrazoExcepcional(ativo);

                      if (!ativo) {
                        setStatusPrazos(getDefaultPrazos());
                        if (formData.idTema) {
                          setFormData(prev => ({
                            ...prev,
                            nrPrazo: getSelectedTema()?.nrPrazo || undefined,
                            tpPrazo: 'H'
                          }));
                        }
                      }
                    }}
                  />
                  <Label htmlFor="prazoExcepcional" className="text-sm font-medium text-blue-600">
                    Prazo Excepcional
                  </Label>
                </div>
                <h3 className="text-blue-500 font-bold ml-auto text-2xl">
                  {prazoExcepcional ? `${currentPrazoTotal}h` : hoursToDaysAndHours(currentPrazoTotal)}
                </h3>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {prazoExcepcional
                ? "Modo excepcional ativo: Configure prazos personalizados para cada etapa abaixo. O prazo total será a soma de todos os prazos configurados."
                : "Modo padrão: O prazo total será o prazo padrão do tema selecionado. Ative o 'Prazo Excepcional' para personalizar prazos por status."
              }
            </p>
            <div className="space-y-4">
              {loadingStatusPrazos ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-sm text-gray-500">Carregando configurações...</div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                    {statusOptions.map((status, index) => {
                      let prazoFromConfig = statusPrazos.find(p => p.idStatusSolicitacao === status.codigo)?.nrPrazoInterno;
                      
                      if (prazoFromConfig === undefined) {
                        const defaultPrazosPorStatus: { [key: number]: number } = {
                          [statusListType.PRE_ANALISE.id]: 72,
                          [statusListType.ANALISE_REGULATORIA.id]: 72,
                          [statusListType.EM_APROVACAO.id]: 48,
                          [statusListType.EM_ASSINATURA_DIRETORIA.id]: 48,
                        };
                        
                        const valorPadrao = defaultPrazosPorStatus[status.codigo] || 0;
                        const newPrazo = {
                          idStatusSolicPrazoTema: 0,
                          idStatusSolicitacao: status.codigo,
                          nrPrazoInterno: valorPadrao,
                          nrPrazoExterno: 0,
                          idTema: formData.idTema || 0,
                          tema: {
                            idTema: formData.idTema || 0,
                            nmTema: selectedTema?.nmTema || ''
                          },
                          flAtivo: 'S'
                        } as StatusSolicPrazoTemaForUI;
                        
                        setTimeout(() => {
                          setStatusPrazos(prev => {
                            const exists = prev.find(p => p.idStatusSolicitacao === status.codigo);
                            if (!exists) {
                              return [...prev, newPrazo];
                            }
                            return prev;
                          });
                        }, 0);
                        
                        prazoFromConfig = valorPadrao;
                      }
                      
                      const prazoAtual = prazoFromConfig ?? 0;

                    return (
                      <div key={index} className={`rounded-lg p-4 bg-gray-50`}>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium text-gray-500'}`}>
                              {status.nome}
                            </h4>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const valorAtualExibido = prazoExcepcional ? prazoAtual : horasParaDias(prazoAtual);
                                  const novoValor = Math.max(0, valorAtualExibido - 1);
                                  const valorParaSalvar = prazoExcepcional ? novoValor : novoValor * 24;
                                  updateLocalPrazo(status.codigo, valorParaSalvar);
                                }}
                                disabled={hasTramitacoes}
                                className="w-8 h-8 p-0 flex items-center justify-center"
                              >-</Button>
                              <Input
                                type="number"
                                value={(prazoExcepcional ? prazoAtual : horasParaDias(prazoAtual)).toString()}
                                onValueChange={(value) => {
                                  const numValue = parseInt(value || '0');
                                  if (numValue >= 0 && numValue <= 300) {
                                    const valorParaSalvar = prazoExcepcional ? numValue : numValue * 24;
                                    updateLocalPrazo(status.codigo, valorParaSalvar);
                                  }
                                }}
                                placeholder="0"
                                isDisabled={hasTramitacoes}
                                className="flex-1"
                                classNames={{
                                  input: "text-center"
                                }}
                                size="sm"
                                variant="bordered"
                                min={0}
                                max={300}
                                step={1}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const valorAtualExibido = prazoExcepcional ? prazoAtual : horasParaDias(prazoAtual);
                                  const novoValor = Math.min(300, valorAtualExibido + 1);
                                  const valorParaSalvar = prazoExcepcional ? novoValor : novoValor * 24;
                                  updateLocalPrazo(status.codigo, valorParaSalvar);
                                }}
                                disabled={hasTramitacoes}
                                className="w-8 h-8 p-0 flex items-center justify-center"
                              >+</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    )
  }, [prazoExcepcional, formData.idTema, loadingStatusPrazos, statusPrazos, updateLocalPrazo, setFormData, statusList, getSelectedTema, loadStatusPrazos, anexosBackend, currentPrazoTotal, hasTramitacoes]);

  const renderStep4 = useCallback(() => (
    <div className="space-y-6">
      <MultiSelectAssinantes
          selectedResponsavelIds={formData.idsResponsaveisAssinates || []}
          onSelectionChange={handleResponsaveisSelectionChange}
          disabled={hasTramitacoes}
          label="Selecione os validadores em 'Em Assinatura Diretoria' *"
        />
    </div>
  ), [formData.idsResponsaveisAssinates, handleResponsaveisSelectionChange, hasTramitacoes]);

  const renderStep5 = useCallback(() => (
    <div className="space-y-6">

      <div className="flex flex-col space-y-4">
        {canInserirAnexo &&
          <AnexoComponent
            onAddAnexos={handleAddAnexos}
            disabled={hasTramitacoes}
          />
        }

        {canListarAnexo && anexos.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Anexos:</Label>
            <AnexoList anexos={anexos} onRemove={handleRemoveAnexo} />
          </div>
        )}

        {canListarAnexo && anexosBackend.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Documentos já anexados:</Label>
            <AnexoList
              anexos={anexosBackend.map(a => ({
                idAnexo: a.idAnexo,
                idObjeto: a.idObjeto,
                name: a.nmArquivo,
                nmArquivo: a.nmArquivo,
                dsCaminho: a.dsCaminho,
                tpObjeto: a.tpObjeto,
                size: 0
              }))}
              onRemove={(index) => {
                const anexo = anexosBackend[index];
                if (anexo?.idAnexo) {
                  handleRemoveAnexoBackend(anexo.idAnexo);
                }
              }}
              onDownload={handleDownloadAnexoBackend}
            />
          </div>
        )}

        {canListarAnexo && anexosTypeE.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Anexos do email</Label>
            <AnexoList
              anexos={anexosTypeE.map(a => ({
                idAnexo: a.idAnexo,
                idObjeto: a.idObjeto,
                name: a.nmArquivo,
                nmArquivo: a.nmArquivo,
                dsCaminho: a.dsCaminho,
                tpObjeto: a.tpObjeto,
                size: 0
              }))}
              onDownload={async (anexoListItem) => {
                const anexoOriginal = anexosTypeE.find(a => a.idAnexo === anexoListItem.idAnexo);
                if (anexoOriginal) {
                  await handleDownloadAnexoEmail(anexoOriginal);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  ), [anexos, anexosBackend, anexosTypeE, handleAddAnexos, handleRemoveAnexo, handleRemoveAnexoBackend, handleDownloadAnexoBackend, handleDownloadAnexoEmail, canListarAnexo, canInserirAnexo]);

  const renderStep6 = useCallback(() => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo da Solicitação</h3>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-semibold text-gray-700">Código de Identificação</Label>
            <div className="p-3 bg-gray-50 border rounded-lg text-sm">
              {formData.cdIdentificacao || 'Não informado'}
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">Nº Ofício</Label>
            <div className="p-3 bg-gray-50 border rounded-lg text-sm">
              {formData.nrOficio || 'Não informado'}
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">Nº Processo</Label>
            <div className="p-3 bg-gray-50 border rounded-lg text-sm">
              {formData.nrProcesso || 'Não informado'}
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold text-gray-700">Assunto</Label>
          <div className="p-3 bg-gray-50 border rounded-lg text-sm">
            {formData.dsAssunto || 'Não informado'}
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold text-gray-700">Observações</Label>
          <div className="p-3 bg-gray-50 border rounded-lg text-sm max-h-24 overflow-y-auto">
            {formData.dsObservacao || 'Não informado'}
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold text-gray-700">Descrição da Solicitação</Label>
          <div className="p-3 bg-gray-50 border rounded-lg text-sm h-fit max-h-72 overflow-y-auto">
            {formData.dsSolicitacao || 'Não informado'}
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label className="text-sm font-semibold text-gray-700">Tema</Label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
              {getSelectedTema()?.nmTema || solicitacao?.tema?.nmTema || solicitacao?.nmTema || 'Não selecionado'}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <Label className="text-sm font-semibold text-gray-700">Áreas Envolvidas</Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
          {formData.idsAreas && formData.idsAreas.length > 0 ? (
            <div className="space-y-3">
              {formData.idsAreas.map(areaId => {
                const area = allAreas.find(a => a.idArea === areaId);
                const responsavelArea = getResponsavelByArea(areaId);
                return area ? (
                  <div key={areaId} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{area.nmArea}</span>
                      <span className="text-xs text-gray-500">{area.cdArea}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-blue-600">
                        {responsavelArea?.nmResponsavel || 'Sem responsável'}
                      </span>
                      {responsavelArea && (
                        <div className="text-xs text-gray-500">
                          {responsavelArea.dsEmail}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          ) : (
            'Nenhuma área selecionada'
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <Label className="text-sm font-semibold text-gray-700">Validadores/Assinantes</Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
          {formData.idsResponsaveisAssinates && formData.idsResponsaveisAssinates.length > 0 ? (
            <div className="space-y-3">
              {formData.idsResponsaveisAssinates.map(responsavelId => {
                const responsavel = responsaveis.find(r => r.idResponsavel === responsavelId);
                return responsavel ? (
                  <div key={responsavelId} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{responsavel?.nmResponsavel}</span>
                      <span className="text-xs text-gray-500">{responsavel?.nmPerfil}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-blue-600">
                        {responsavel?.nmCargo || 'Sem cargo'}
                      </span>
                      {responsavel && (
                        <div className="text-xs text-gray-500">
                          {responsavel.dsEmail}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          ) : (
            'Nenhum validador/assinante selecionado'
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold text-gray-700">Prazo Principal</Label>
            <div className="p-3 border border-yellow-200 rounded-lg text-sm">
              {hoursToDaysAndHours(currentPrazoTotal)}
              {prazoExcepcional && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                  Excepcional
                </span>
              )}
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">Status</Label>
            <div className="p-3 bg-gray-50 border rounded-lg text-sm">
              {(() => {
                if (solicitacao?.statusSolicitacao?.idStatusSolicitacao) {
                  return solicitacao.statusSolicitacao.nmStatus;
                }
                if (solicitacao?.statusCodigo) {
                  const statusAtual = statusList.find(s => s.idStatusSolicitacao === solicitacao.statusCodigo);
                  return statusAtual?.nmStatus || solicitacao.statusCodigo;
                }
                const statusAtual = statusList.find(s => s.idStatusSolicitacao === 1);
                return statusAtual?.nmStatus || statusListType.PRE_ANALISE.label;
              })()}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <Label className="text-sm font-semibold text-gray-700">Prazos Configurados por Status</Label>
        <div className="mt-2 space-y-2">
          {(() => {

            
            const statusFiltrados = statusList.length > 0 ? statusList.map(status => ({
              codigo: status.idStatusSolicitacao,
              nome: status.nmStatus
            })) : STATUS_LIST.map(status => ({
              codigo: status.id,
              nome: status.label
            }));

            const opcaoStatusResumo = statusFiltrados.filter(status => !statusOcultos.includes(status.codigo));

            const items = opcaoStatusResumo
              .map((status) => {
                const prazoFromSolicitacao = prazosSolicitacaoPorStatus.find(p => p.idStatusSolicitacao === status.codigo)?.nrPrazoInterno;
                const prazoFromConfig = statusPrazos.find(p => p.idStatusSolicitacao === status.codigo)?.nrPrazoInterno;
                const horas = (prazoFromSolicitacao ?? prazoFromConfig ?? 0);
                return { status, horas };
              })
              .filter(item => (item.horas || 0) > 0)
              .map(({ status, horas }) => (
                <div key={status.codigo} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                  <span className="font-medium">{status.nome}</span>
                  <span className="text-gray-600">{horas} horas</span>
                </div>
              ));

            return items;
          })()}
        </div>
      </div>

      <div className="border-t pt-4">
        <Label className="text-sm font-semibold text-gray-700">Anexos ({anexos.length + anexosBackend.length + anexosTypeE.length})</Label>
        <div className="mt-2 space-y-2">
          {canListarAnexo && anexos.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-2">Novos anexos a serem enviados:</div>
              {anexos.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border rounded text-sm">
                  <span className="font-medium">{file.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{Math.round(file.size / 1024)} KB</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const fileURL = URL.createObjectURL(file);
                        const link = document.createElement('a');
                        link.href = fileURL;
                        link.download = file.name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(fileURL);
                      }}
                      className="h-6 w-6 p-0 hover:bg-gray-200"
                    >
                      <DownloadSimpleIcon size={14} className="text-gray-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {canListarAnexo && anexosBackend.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-2">Anexos já salvos:</div>
              <div className="flex flex-col gap-2">
                {anexosBackend.map((anexo, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded text-sm">
                    <span className="font-medium text-gray-800">{anexo.nmArquivo}</span>
                    <div className="flex items-center gap-2">
                    {/*<span className="text-xs">{Math.round(anexo.size / 1024)} KB</span>*/}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadAnexoBackend({
                            idAnexo: anexo.idAnexo,
                            idObjeto: anexo.idObjeto,
                            name: anexo.nmArquivo,
                            nmArquivo: anexo.nmArquivo,
                            dsCaminho: anexo.dsCaminho,
                            tpObjeto: anexo.tpObjeto,
                            size: 0
                          });
                        }}
                        className="h-6 w-6 p-0 hover:bg-gray-200"
                      >
                        {/*<span className="text-xs">{Math.round(anexo.size / 1024)} KB</span>*/}

                        <DownloadSimpleIcon size={14} className="text-gray-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {canListarAnexo && anexosTypeE.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-2">Anexos do email:</div>
              <div className="flex flex-col gap-2">
                {anexosTypeE.map((anexo, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded text-sm">
                  <span className="font-medium text-gray-800">{anexo.nmArquivo}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!canListarAnexo || (anexos.length === 0 && anexosBackend.length === 0 && anexosTypeE.length === 0)) && (
            <div className="p-3 bg-gray-50 border rounded-lg text-sm text-gray-500 text-center">
              {!canListarAnexo ? 'Sem permissão para visualizar anexos' : 'Nenhum anexo adicionado'}
            </div>
          )}
        </div>
      </div>
    </div>
  ), [formData.cdIdentificacao, formData.nrOficio, formData.nrProcesso, formData.dsAssunto, formData.dsObservacao, formData.dsSolicitacao, formData.idsAreas, formData.nrPrazo, formData.idResponsavel, formData.tpPrazo, getSelectedTema, solicitacao?.tema?.nmTema, solicitacao?.nmTema, responsaveis, statusPrazos, anexos, anexosBackend, anexosTypeE, canListarAnexo, allAreas, getResponsavelByArea, statusList, handleDownloadAnexoBackend, handleDownloadAnexoEmail]);

  useEffect(() => {
    const loadStatusList = async () => {
      try {
        const status = await statusSolicitacaoClient.listarTodos();
        setStatusList(status);
      } catch (error) {
        console.error('Erro ao carregar lista de status:', error);
      }
    };

    if (open) {
      loadStatusList();
    }
  }, [open]);

  useEffect(() => {
    if (formData.idTema && open) {
      loadStatusPrazos();
    }
  }, [formData.idTema, open, loadStatusPrazos]);
  useEffect(() => {
    const loadAnexosTypeE = async () => {
      if (( currentStep === 5 || currentStep === 6) && solicitacao?.idSolicitacao) {
        try {
          const anexosE = await anexosClient.buscarPorIdObjetoETipoObjeto(
            solicitacao.idSolicitacao,
            TipoObjetoAnexo.E
          );
          setAnexosTypeE(anexosE);
        } catch (error) {
          console.error('Erro ao carregar anexos tipo E:', error);
          setAnexosTypeE([]);
        }
      } else {
        setAnexosTypeE([]);
      }
    };

    if (open) {
      loadAnexosTypeE();
    }
  }, [currentStep, open, solicitacao?.idSolicitacao]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="h-full flex flex-col">
        <DialogHeader className="pb-6 flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">
            {solicitacao ? 'Editar Solicitação' : 'Nova Solicitação'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-shrink-0 border-b border-gray-200 pb-4">
          <Stepper
            currentStep={currentStep}
            steps={[
              { title: 'Dados da Solicitação', description: 'Informações básicas' },
              { title: 'Tema e Áreas', description: 'Configuração' },
              { title: 'Status e Prazos', description: 'Definições de tempo' },
              { title: 'Assinantes', description: 'Validador / Assinante' },
              { title: 'Anexos', description: 'Documentos' },
              { title: 'Resumo', description: 'Finalização' }
            ]}
            onStepClick={handleStepClick}
            canNavigateToStep={(step: number): boolean => {
              if (step === 1) return true;
              if (step === 2) return isStep1Valid();
              if (step === 3) return isStep1Valid() && isStep2Valid();
              if (step === 4) return isStep1Valid() && isStep2Valid();
              if (step >= 5) return isStep1Valid() && isStep2Valid() && isStep4Valid();
              return false;
            }}
          />
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          <form id="solicitacao-form" onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
            {currentStep === 6 && renderStep6()}
          </form>
        </div>

        <DialogFooter className="flex gap-3 pt-6 border-t flex-shrink-0">
          {/* <Button
            type="button"
            variant="outline"
            onClick={() => {
              handleNextStep(() => {
                onSave()
                onClose()
              })
            }}
            disabled={loading}
          >
            <FloppyDiskIcon size={16} className="mr-2"/>
            Salvar e sair
          </Button> */}

          {currentStep === 1 && (
            <Button
              type="button"
              onClick={() => handleNextStep()}
              disabled={!isStep1Valid()}
              className="flex items-center gap-2"
              tooltip={hasTramitacoes ? 'Esta solicitação já possui tramitações iniciadas. Edição bloqueada.' : ''}
            >
              Próximo
              <CaretRightIcon size={16} />
            </Button>
          )}

          {currentStep === 2 && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousStep}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <CaretLeftIcon size={16} />
                Anterior
              </Button>
              <Button
                type="button"
                onClick={() => handleNextStep()}
                disabled={loading || !isStep2Valid()}
                className="flex items-center gap-2"
                tooltip={hasTramitacoes ? 'Esta solicitação já possui tramitações iniciadas. Edição bloqueada.' : ''}
              >
                Próximo
                <CaretRightIcon size={16} />
              </Button>
            </>
          )}

          {currentStep === 3 && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousStep}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <CaretLeftIcon size={16} />
                Anterior
              </Button>
              <Button
                type="button"
                onClick={() => handleNextStep()}
                disabled={loading}
                className="flex items-center gap-2"
                tooltip={hasTramitacoes ? 'Esta solicitação já possui tramitações iniciadas. Edição bloqueada.' : ''}
              >
                Próximo
                <CaretRightIcon size={16} />
              </Button>
            </>
          )}

          {currentStep === 4 && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousStep}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <CaretLeftIcon size={16} />
                Anterior
              </Button>
              <Button
                type="button"
                onClick={() => handleNextStep()}
                disabled={loading || !isStep4Valid()}
                className="flex items-center gap-2"
                tooltip={
                  hasTramitacoes 
                    ? 'Esta solicitação já possui tramitações iniciadas. Edição bloqueada.'
                    : !isStep4Valid() 
                      ? 'Selecione exatamente 2 validadores/assinantes para continuar'
                      : undefined
                }
              >
                Próximo
                <CaretRightIcon size={16} />
              </Button>
            </>
          )}
          {currentStep === 5 && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousStep}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <CaretLeftIcon size={16} />
                Anterior
              </Button>
              <Button
                type="button"
                onClick={() => handleNextStep()}
                disabled={loading}
                className="flex items-center gap-2"
                tooltip={hasTramitacoes ? 'Esta solicitação já possui tramitações iniciadas. Edição bloqueada.' : ''}
              >
                Próximo
                <CaretRightIcon size={16} />
              </Button>
            </>
          )}

          {currentStep === 6 && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousStep}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <CaretLeftIcon size={16} />
                Anterior
              </Button>
              <Button
                type="submit"
                form="solicitacao-form"
                disabled={loading || hasTramitacoes}
                className="flex items-center gap-2"
                tooltip={hasTramitacoes ? 'Esta solicitação já possui tramitações iniciadas. Edição bloqueada.' : ''}
              >
                {solicitacao && <ArrowArcRightIcon className={"w-4 h-4 mr-1"} />}
                {loading ? 'Salvando...' : solicitacao ? 'Encaminhar solicitação' : 'Criar Solicitação'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
      <ConfirmationDialog
        open={showConfirmSend}
        onOpenChange={setShowConfirmSend}
        title="Confirmar envio"
        description={
          "Após o envio da Solicitação não será possível alterá-la. Deseja prosseguir com o envio?"
        }
        confirmText="Sim"
        cancelText="Voltar a solicitação"
        onConfirm={handleConfirmSend}
      />
    </Dialog>
  );
}
