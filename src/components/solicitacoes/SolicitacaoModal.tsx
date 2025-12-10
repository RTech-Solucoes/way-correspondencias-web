'use client';

import { anexosClient } from '@/api/anexos/client';
import { AnexoResponse, TipoObjetoAnexo } from '@/api/anexos/type';
import { areasClient } from '@/api/areas/client';
import { AreaResponse } from '@/api/areas/types';
import authClient from '@/api/auth/client';
import { computeTpResponsavel } from '@/api/perfis/types';
import responsaveisClient from '@/api/responsaveis/client';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import solicitacaoAssinanteClient from '@/api/solicitacao-assinante/client';
import { solicitacoesClient } from '@/api/solicitacoes/client';
import { SolicitacaoPrazoResponse, SolicitacaoRequest, SolicitacaoResponse } from '@/api/solicitacoes/types';
import { statusSolicPrazoTemaClient } from '@/api/status-prazo-tema/client';
import { StatusSolicPrazoTemaForUI } from '@/api/status-prazo-tema/types';
import { statusSolicitacaoClient, StatusSolicitacaoResponse } from '@/api/status-solicitacao/client';
import { STATUS_LIST, statusList as statusListType } from '@/api/status-solicitacao/types';
import { TemaResponse } from '@/api/temas/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MultiSelectAreas } from '@/components/ui/multi-select-areas';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stepper } from '@/components/ui/stepper';
import { TextField } from '@/components/ui/text-field';
import { Textarea } from '@/components/ui/textarea';
import { usePermissoes } from '@/context/permissoes/PermissoesContext';
import { AnaliseGerenteDiretor, getTipoAprovacaoLabel } from '@/types/solicitacoes/types';
import { base64ToUint8Array, capitalize, getRows, hoursToDaysAndHours, saveBlob } from '@/utils/utils';
import { Input } from '@nextui-org/react';
import { ArrowArcRightIcon, CaretLeftIcon, CaretRightIcon, DownloadSimpleIcon } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import AnexoComponent from '../AnexoComponotent/AnexoComponent';
import AnexoList from '../AnexoComponotent/AnexoList/AnexoList';
import { MultiSelectAssinantes } from '../ui/multi-select-assinates';

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
    idsResponsaveisAssinates: [],
    flExigeCienciaGerenteRegul: '',
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
  const [prazosSolicitacaoPorStatus, setPrazosSolicitacaoPorStatus] = useState<SolicitacaoPrazoResponse[]>([]);
  const [userResponsavelIdPerfil, setUserResponsavelIdPerfil] = useState<number>(0);
  const [isNewSolicitacao, setIsNewSolicitacao] = useState<boolean>(false);
  const [pendingCreateData, setPendingCreateData] = useState<{
    solicitacoesPrazos: unknown[];
    solicitacoesAssinantes: unknown[];
    arquivos: unknown[];
    cdIdentificacao: string | undefined;
  } | null>(null);
  
  const canEditSolicitacao = useMemo(() => {
    if (!solicitacao) return true; 
    
    const isPreAnalise = solicitacao.statusSolicitacao?.idStatusSolicitacao === statusListType.PRE_ANALISE.id || 
                         solicitacao.statusSolicitacao?.nmStatus === statusListType.PRE_ANALISE.label;
    
    return isPreAnalise;
  }, [solicitacao]);

  const handleConfirmSend = useCallback(async () => {
    try {
      setLoading(true);
      
      let idToSend = confirmSendId;
      
      // Se for nova solicitação, cria primeiro
      if (isNewSolicitacao && pendingCreateData) {
        const created = await solicitacoesClient.criar({
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
          arquivos: pendingCreateData.arquivos as []
        });
        idToSend = created.idSolicitacao;
      }
      
      if (!idToSend) return;
      
      // Encaminha a solicitação
      await solicitacoesClient.etapaStatus(idToSend);
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
        }
        else if ((err as { payload?: { message?: string; error?: string } }).payload) {
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
        flExcepcional: solicitacao.flExcepcional || 'N',
        flExigeCienciaGerenteRegul: solicitacao.flExigeCienciaGerenteRegul || '',
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
        flExcepcional: 'N',
        flExigeCienciaGerenteRegul: '',
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

  useEffect(() => {
    const loadUserResponsavel = async () => {
      const userName = authClient.getUserName();
      if (userName) {
        const resp = await responsaveisClient.buscarPorNmUsuarioLogin(userName);
        setUserResponsavelIdPerfil(resp?.idPerfil || 0);
      }
    };
    if (open) {
      loadUserResponsavel();
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
      ] as string[]).includes((formData.flAnaliseGerenteDiretor || '').toUpperCase()) &&
      (formData.flExigeCienciaGerenteRegul === 'S' || formData.flExigeCienciaGerenteRegul === 'N');
  }, [formData.cdIdentificacao, formData.flAnaliseGerenteDiretor, formData.flExigeCienciaGerenteRegul]);

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
        if (!formData.flExigeCienciaGerenteRegul || (formData.flExigeCienciaGerenteRegul !== 'S' && formData.flExigeCienciaGerenteRegul !== 'N')) {
          toast.error("É obrigatório selecionar se exige manifestação do Gerente do Regulatório");
          return;
        }
        if (!solicitacao) {
          setCurrentStep(2);
          return;
        }
        if (canEditSolicitacao) {
          await solicitacoesClient.etapaIdentificacao(solicitacao.idSolicitacao, {
            cdIdentificacao: formData.cdIdentificacao?.trim(),
            dsAssunto: formData.dsAssunto?.trim(),
            dsObservacao: formData.dsObservacao?.trim(),
            nrOficio: formData.nrOficio?.trim(),
            nrProcesso: formData.nrProcesso?.trim(),
            flAnaliseGerenteDiretor: formData.flAnaliseGerenteDiretor,
            flExigeCienciaGerenteRegul: formData.flExigeCienciaGerenteRegul
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
        if (canEditSolicitacao) {
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
        if (canEditSolicitacao) {
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

        if (canEditSolicitacao && formData.idsResponsaveisAssinates && formData.idsResponsaveisAssinates.length > 0) {
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
        if (canEditSolicitacao) {
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
                  tpResponsavel: computeTpResponsavel(userResponsavelIdPerfil)
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
  }, [currentStep, formData, solicitacao, statusPrazos, anexos, anexosBackend, anexosTypeE, canEditSolicitacao]);

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
      const id = solicitacao?.idSolicitacao || createdSolicitacao?.idSolicitacao;

      if (createdSolicitacao?.idSolicitacao) {
        if (!canEditSolicitacao) { toast.message('Esta solicitação não pode ser editada no status atual.'); setLoading(false); return; }
        setConfirmSendId(createdSolicitacao.idSolicitacao);
        setConfirmSendToast('Solicitação criada com sucesso!');
        setShowConfirmSend(true);
        setLoading(false);
        return;
      } else if (solicitacao?.idSolicitacao) {
        if (!canEditSolicitacao) { toast.message('Esta solicitação não pode ser editada no status atual.'); setLoading(false); return; }
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

        const cdIdentificacao = formData.cdIdentificacao?.trim();
        
        const solicitacoesPrazos = statusPrazos
          .filter(p => p.nrPrazoInterno && p.nrPrazoInterno > 0 && p.idStatusSolicitacao)
          .map(p => ({
            idStatusSolicitacao: p.idStatusSolicitacao!,
            idTema: formData.idTema,
            nrPrazoInterno: p.nrPrazoInterno,
            nrPrazoExterno: p.nrPrazoExterno,
            tpPrazo: formData.tpPrazo || undefined,
            flExcepcional: formData.flExcepcional === 'S' ? 'S' : 'N'
          }));
        
        if (id === undefined || solicitacao?.idSolicitacao === undefined) {

          const solicitacoesAssinantes = (formData.idsResponsaveisAssinates || []).map(idResp => ({
            idStatusSolicitacao: statusListType.EM_ASSINATURA_DIRETORIA.id,
            idResponsavel: idResp
          }));

          const arquivos = await Promise.all(
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
                tpResponsavel: computeTpResponsavel(userResponsavelIdPerfil)
              };
            })
          );
          
          setPendingCreateData({
            solicitacoesPrazos,
            solicitacoesAssinantes,
            arquivos,
            cdIdentificacao
          });
          setIsNewSolicitacao(true);
          setConfirmSendToast('Solicitação criada e encaminhada com sucesso!');
          setShowConfirmSend(true);
          setLoading(false);
          return;
        }        

        await solicitacoesClient.etapaIdentificacao(id, {
          ...(cdIdentificacao && { cdIdentificacao }),
          dsAssunto: formData.dsAssunto?.trim(),
          dsObservacao: formData.dsObservacao?.trim(),
          nrOficio: formData.nrOficio?.trim(),
          nrProcesso: formData.nrProcesso?.trim(),
          flAnaliseGerenteDiretor: formData.flAnaliseGerenteDiretor,
          flExigeCienciaGerenteRegul: formData.flExigeCienciaGerenteRegul
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
                tpResponsavel: computeTpResponsavel(userResponsavelIdPerfil)
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
      let errorMessage = solicitacao || createdSolicitacao ? 'Erro ao encaminhar solicitação' : 'Erro ao criar solicitação';
      
      if (err instanceof Error) {
        if (err.message) {
          errorMessage = err.message;
        }
        else if ((err as { payload?: { message?: string; error?: string } }).payload) {
          const payload = (err as { payload?: { message?: string; error?: string } }).payload;
          errorMessage = payload?.message || payload?.error || errorMessage;
        }
      }
      
      toast.error(errorMessage);
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
          disabled={!canEditSolicitacao}
        />
        <TextField
          label="Nº Ofício"
          name="nrOficio"
          value={formData.nrOficio}
          onChange={handleInputChange}
          maxLength={50}
          disabled={!canEditSolicitacao}
        />
        <TextField
          label="Nº Processo"
          name="nrProcesso"
          value={formData.nrProcesso}
          onChange={handleInputChange}
          maxLength={50}
          disabled={!canEditSolicitacao}
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
                disabled={!canEditSolicitacao}
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
                disabled={!canEditSolicitacao}
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
                disabled={!canEditSolicitacao}
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
                disabled={!canEditSolicitacao}
              />
              <Label className="text-sm font-light">Não necessita</Label>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="flExigeCienciaGerenteRegul" className="text-sm font-medium">
            Exige manifestação do Gerente do Regulatório? *
          </Label>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={(formData.flExigeCienciaGerenteRegul || '').toUpperCase() === 'S'}
                onCheckedChange={() => setFormData(prev => ({
                  ...prev,
                  flExigeCienciaGerenteRegul: 'S'
                }))}
                disabled={!canEditSolicitacao}
              />
              <Label className="text-sm font-light">Sim</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={(formData.flExigeCienciaGerenteRegul || '').toUpperCase() === 'N'}
                onCheckedChange={() => setFormData(prev => ({
                  ...prev,
                  flExigeCienciaGerenteRegul: 'N'
                }))}
                disabled={!canEditSolicitacao}
              />
              <Label className="text-sm font-light ">Não, apenas ciência</Label>
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
          disabled={!canEditSolicitacao}
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
          disabled={!canEditSolicitacao}
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
          disabled={!canEditSolicitacao}
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
          disabled={!canEditSolicitacao}
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

        <MultiSelectAreas
          selectedAreaIds={formData.idsAreas || []}
          onSelectionChange={handleAreasSelectionChange}
          disabled={!canEditSolicitacao}
          label="Áreas *"
        />
    </div>
  ), [formData.idTema, formData.idsAreas, temas, getResponsavelFromTema, handleAreasSelectionChange, solicitacao, canEditSolicitacao]);

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
      [statusListType.EM_ANALISE_GERENTE_REGULATORIO.id]: 48,
      [statusListType.EM_ANALISE_AREA_TECNICA.id]: 72,
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
    
    const statusOptions = allStatusOptions
      .filter(status => !statusOcultos.includes(status.codigo))
      .sort((a, b) => {
        if (a.codigo === statusListType.EM_ANALISE_GERENTE_REGULATORIO.id) return -1;
        if (b.codigo === statusListType.EM_ANALISE_GERENTE_REGULATORIO.id) return 1;
        
        return a.codigo - b.codigo;
      });

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
                    disabled={!canEditSolicitacao}
                    onCheckedChange={async (checked) => {
                      if (!canEditSolicitacao) return;
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
                          [statusListType.EM_ANALISE_GERENTE_REGULATORIO.id]: 48,
                          [statusListType.EM_ANALISE_AREA_TECNICA.id]: 72,
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
                                disabled={!canEditSolicitacao}
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
                                isDisabled={!canEditSolicitacao}
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
                                disabled={!canEditSolicitacao}
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
  }, [prazoExcepcional, formData.idTema, loadingStatusPrazos, statusPrazos, updateLocalPrazo, setFormData, statusList, getSelectedTema, loadStatusPrazos, anexosBackend, currentPrazoTotal, canEditSolicitacao]);

  const renderStep4 = useCallback(() => (
    <div className="space-y-6">
      <MultiSelectAssinantes
          selectedResponsavelIds={formData.idsResponsaveisAssinates || []}
          onSelectionChange={handleResponsaveisSelectionChange}
          disabled={!canEditSolicitacao}
          label="Selecione os validadores em 'Em Assinatura Diretoria' *"
        />
    </div>
  ), [formData.idsResponsaveisAssinates, handleResponsaveisSelectionChange]);

  const renderStep5 = useCallback(() => (
    <div className="space-y-6">

      <div className="flex flex-col space-y-4">
        {canInserirAnexo &&
          <AnexoComponent
            onAddAnexos={handleAddAnexos}
            disabled={!canEditSolicitacao}
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
  ), [anexos, anexosBackend, anexosTypeE, handleAddAnexos, handleRemoveAnexo, handleRemoveAnexoBackend, handleDownloadAnexoBackend, handleDownloadAnexoEmail, canListarAnexo, canInserirAnexo, canEditSolicitacao]);

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
        <div className="grid grid-cols-3 gap-4">
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
            <Label className="text-sm font-semibold text-gray-700">Exige aprovação especial</Label>
            <div className="p-3 border rounded-lg text-sm">
              {getTipoAprovacaoLabel(formData.flAnaliseGerenteDiretor ?? '')}
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">Exige manifestação do Gerente do Regulatório</Label>
            <div className="p-3 border rounded-lg text-sm">
              {formData.flExigeCienciaGerenteRegul === 'S' ? 'Sim' : 
               formData.flExigeCienciaGerenteRegul === 'N' ? 'Não, apenas ciência' : '—'}
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
                  <span className="text-gray-600">
                    {prazoExcepcional ? `${horas} horas` : `${horasParaDias(horas)} dias`}
                  </span>
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
  ), [formData.cdIdentificacao, formData.nrOficio, formData.nrProcesso, formData.dsAssunto, formData.dsObservacao, formData.dsSolicitacao, formData.idsAreas, formData.nrPrazo, formData.idResponsavel, formData.tpPrazo, formData.idsResponsaveisAssinates, formData.flAnaliseGerenteDiretor, formData.flExigeCienciaGerenteRegul, getSelectedTema, solicitacao?.tema?.nmTema, solicitacao?.nmTema, solicitacao?.statusSolicitacao?.idStatusSolicitacao, solicitacao?.statusSolicitacao?.nmStatus, solicitacao?.statusCodigo, responsaveis, statusPrazos, anexos, anexosBackend, anexosTypeE, canListarAnexo, allAreas, getResponsavelByArea, statusList, handleDownloadAnexoBackend, handleDownloadAnexoEmail, currentPrazoTotal, prazoExcepcional, prazosSolicitacaoPorStatus, statusOcultos]);

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
              tooltip={!canEditSolicitacao ? 'Esta solicitação não pode ser editada no status atual.' : ''}
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
                tooltip={!canEditSolicitacao ? 'Esta solicitação não pode ser editada no status atual.' : ''}
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
                tooltip={!canEditSolicitacao ? 'Esta solicitação não pode ser editada no status atual.' : ''}
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
                  !canEditSolicitacao 
                    ? 'Esta solicitação não pode ser editada no status atual.'
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
                tooltip={!canEditSolicitacao ? 'Esta solicitação não pode ser editada no status atual.' : ''}
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
                disabled={loading || !canEditSolicitacao}
                className="flex items-center gap-2"
                tooltip={!canEditSolicitacao ? 'Esta solicitação não pode ser editada no status atual.' : ''}
              >
                {solicitacao && <ArrowArcRightIcon className={"w-4 h-4 mr-1"} />}
                {loading ? 'Salvando...' : solicitacao ? 'Encaminhar para Gerente do Regulatório' : 'Criar Solicitação'}
              </Button>
            </>
          )}
        </DialogFooter>
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
