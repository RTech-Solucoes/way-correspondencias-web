'use client';

import { useState, useEffect, FormEvent, useCallback, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { SolicitacaoResponse, SolicitacaoRequest } from '@/api/solicitacoes/types';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { TemaResponse } from '@/api/temas/types';
import { solicitacoesClient } from '@/api/solicitacoes/client';
import { toast } from 'sonner';
import { capitalize, getRows } from '@/utils/utils';
import { MultiSelectAreas } from '@/components/ui/multi-select-areas';
import { ArrowArcRightIcon, CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { Stepper } from '@/components/ui/stepper';
import { Input } from '@nextui-org/react';
import AnexoComponent from '../AnexoComponotent/AnexoComponent';
import AnexoList from '../AnexoComponotent/AnexoList/AnexoList';
import { statusSolicPrazoTemaClient } from '@/api/status-prazo-tema/client';
import { StatusSolicPrazoTemaForUI } from '@/api/status-prazo-tema/types';
import { statusSolicitacaoClient, StatusSolicitacaoResponse } from '@/api/status-solicitacao/client';
import { AnexoResponse } from '@/api/solicitacoes/anexos-client';
import { areasClient } from '@/api/areas/client';
import { anexosClient } from '@/api/anexos/client';
import { AreaResponse } from '@/api/areas/types';
import { TipoObjetoAnexo } from '@/api/anexos/type';

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
    nrProcesso: ''
  });
  const [loading, setLoading] = useState(false);
  const [anexos, setAnexos] = useState<File[]>([]);
  const [anexosBackend, setAnexosBackend] = useState<AnexoResponse[]>([]);
  const [anexosTypeE, setAnexosTypeE] = useState<AnexoResponse[]>([]);
  const [statusPrazos, setStatusPrazos] = useState<StatusSolicPrazoTemaForUI[]>([]);
  const [loadingStatusPrazos, setLoadingStatusPrazos] = useState(false);
  const [prazoExcepcional, setPrazoExcepcional] = useState(false);
  const [statusList, setStatusList] = useState<StatusSolicitacaoResponse[]>([]);
  const [createdSolicitacao, setCreatedSolicitacao] = useState<SolicitacaoResponse | null>(null);
  const [allAreas, setAllAreas] = useState<AreaResponse[]>([]);

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
        nrProcesso: solicitacao.nrProcesso || ''
      });
      // Corrigido: prazoExcepcional sempre inicia como false para evitar ser marcado por padrão
      setPrazoExcepcional(false);
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
        nrProcesso: ''
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


  const isStep1Valid = useCallback(() => {
    return formData.cdIdentificacao?.trim() !== '' && 
           (formData.flAnaliseGerenteDiretor === 'S' || formData.flAnaliseGerenteDiretor === 'N');
  }, [formData.cdIdentificacao, formData.flAnaliseGerenteDiretor]);

  const isStep2Valid = useCallback(() => {
    return (formData.idTema !== undefined && formData.idTema > 0 &&
      formData.idsAreas && formData.idsAreas.length > 0) || false;
  }, [formData.idTema, formData.idsAreas]);

  const getSelectedTema = useCallback(() => {
    return temas.find(tema => tema.idTema === formData.idTema);
  }, [temas, formData.idTema]);

  const handleNextStep = useCallback(async () => {
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

        await solicitacoesClient.etapaIdentificacao(solicitacao.idSolicitacao, {
          cdIdentificacao: formData.cdIdentificacao?.trim(),
          dsAssunto: formData.dsAssunto?.trim(),
          dsObservacao: formData.dsObservacao?.trim(),
          nrOficio: formData.nrOficio?.trim(),
          nrProcesso: formData.nrProcesso?.trim(),
        });

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

        await solicitacoesClient.etapaTema(solicitacao.idSolicitacao, {
          idTema: formData.idTema,
          tpPrazo: formData.tpPrazo || undefined,
          nrPrazoInterno: formData.nrPrazo,
          flExcepcional: prazoExcepcional ? 'S' : 'N',
          idsAreas: formData.idsAreas
        });

        setCurrentStep(3);
      } else if (currentStep === 3) {
        if (!solicitacao) {
          setCurrentStep(4);
          return;
        }

        const solicitacoesPrazos = statusPrazos
          .filter(p => p.nrPrazoInterno && p.nrPrazoInterno > 0 && p.idStatusSolicitacao)
          .map(p => ({
            idStatusSolicitacao: p.idStatusSolicitacao!,
            nrPrazoInterno: p.nrPrazoInterno,
            tpPrazo: formData.tpPrazo || undefined,
            flExcepcional: prazoExcepcional ? 'S' : 'N'
          }));

        await solicitacoesClient.etapaPrazo(solicitacao.idSolicitacao, {
          idTema: formData.idTema,
          nrPrazoInterno: formData.nrPrazo,
          solicitacoesPrazos
        });

        setCurrentStep(4);
      } else if (currentStep === 4) {
        if (!solicitacao) {
          setCurrentStep(5);
          return;
        }

        if (anexos.length > 0) {
          const arquivosDTO = await Promise.all(
            anexos.map(async (file) => {
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
                tipoArquivo: file.type || 'application/octet-stream'
              };
            })
          );

          try {
            await solicitacoesClient.uploadAnexos(solicitacao.idSolicitacao, arquivosDTO);
          } catch {
            toast.error('Erro ao anexar arquivos');
          }
        }

        setCurrentStep(5);
      }
    } catch (e) {
      console.error(e);
      toast.error('Erro ao avançar etapa');
    }
  }, [currentStep, formData, solicitacao, prazoExcepcional, statusPrazos, anexos]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    } else if (currentStep === 5) {
      setCurrentStep(4);
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
    } else if (step === 5 && isStep1Valid() && isStep2Valid()) {
      setCurrentStep(step);
    }
  }, [isStep1Valid, isStep2Valid]);

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
    console.log(idAnexo);
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
        const arquivo = arquivos[0];
        const byteCharacters = atob(arquivo.conteudoArquivo);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: arquivo.tipoArquivo });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = arquivo.nomeArquivo || anexo.name || 'documento';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
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
        await solicitacoesClient.etapaStatus(createdSolicitacao.idSolicitacao);
        toast.success('Solicitação criada com sucesso!');
      } else if (solicitacao?.idSolicitacao) {
        await solicitacoesClient.etapaStatus(solicitacao.idSolicitacao);
        toast.success('Solicitação encaminhada com sucesso!');
      } else {
        if (!formData.cdIdentificacao?.trim()) { toast.error('Código de identificação é obrigatório'); setLoading(false); return; }
        if (!formData.idTema || formData.idTema === 0) { toast.error('Tema é obrigatório'); setLoading(false); return; }
        if (!formData.flAnaliseGerenteDiretor || (formData.flAnaliseGerenteDiretor !== 'S' && formData.flAnaliseGerenteDiretor !== 'N')) { 
          toast.error('É obrigatório informar se exige análise do Gerente ou Diretor'); 
          setLoading(false); 
          return; 
        }

        const created = await solicitacoesClient.criar({
          cdIdentificacao: formData.cdIdentificacao?.trim(),
          dsAssunto: formData.dsAssunto?.trim(),
          dsSolicitacao: formData.dsSolicitacao?.trim(),
          dsObservacao: formData.dsObservacao?.trim(),
          nrOficio: formData.nrOficio?.trim(),
          nrProcesso: formData.nrProcesso?.trim(),
          flExcepcional: prazoExcepcional ? 'S' : 'N',
          flAnaliseGerenteDiretor: formData.flAnaliseGerenteDiretor,
        });
        id = created.idSolicitacao;

        await solicitacoesClient.etapaIdentificacao(id, {
          cdIdentificacao: formData.cdIdentificacao?.trim(),
          dsAssunto: formData.dsAssunto?.trim(),
          dsObservacao: formData.dsObservacao?.trim(),
          nrOficio: formData.nrOficio?.trim(),
          nrProcesso: formData.nrProcesso?.trim(),
        });

        await solicitacoesClient.etapaTema(id, {
          idTema: formData.idTema,
          tpPrazo: formData.tpPrazo || undefined,
          nrPrazoInterno: formData.nrPrazo,
          flExcepcional: prazoExcepcional ? 'S' : 'N',
          idsAreas: formData.idsAreas
        });

        if (statusPrazos.length > 0) {
          const solicitacoesPrazos = statusPrazos
            .filter(p => p.nrPrazoInterno && p.nrPrazoInterno > 0 && p.idStatusSolicitacao)
            .map(p => ({
              idStatusSolicitacao: p.idStatusSolicitacao!,
              idTema: formData.idTema,
              nrPrazoInterno: p.nrPrazoInterno,
              nrPrazoExterno: p.nrPrazoExterno,
              tpPrazo: formData.tpPrazo || undefined,
              flExcepcional: prazoExcepcional ? 'S' : 'N'
            }));
          if (solicitacoesPrazos.length > 0) {
            await solicitacoesClient.etapaPrazo(id, { nrPrazoInterno: formData.nrPrazo, solicitacoesPrazos });
          }
        }

        if (anexos.length > 0) {
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
                tipoArquivo: file.type || 'application/octet-stream'
              };
            })
          );
          await solicitacoesClient.uploadAnexos(id, arquivosDTO);
        }

        await solicitacoesClient.etapaStatus(id);
        toast.success('Solicitação criada com sucesso!');
      }

      onSave();
      onClose();
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error(solicitacao || createdSolicitacao ? 'Erro ao encaminhar solicitação' : 'Erro ao criar solicitação');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    setCurrentStep(1);
    setCreatedSolicitacao(null);
    onClose();
  }, [onClose]);

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
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tema" />
          </SelectTrigger>
          <SelectContent>
            {/* Show the current tema from solicitacao if it's not in the temas list */}
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
        disabled={false}
        label="Áreas *"
      />
    </div>
  ), [formData.idTema, formData.idsAreas, temas, getResponsavelFromTema, handleAreasSelectionChange, solicitacao]);

  const loadStatusPrazos = useCallback(async () => {
    if (!formData.idTema) return;

    try {
      setLoadingStatusPrazos(true);
      const prazos = await statusSolicPrazoTemaClient.listar(formData.idTema);

      const selectedTema = temas.find(t => t.idTema === formData.idTema);

      if (prazos.length === 0) {
        try {
          const prazosPadrao = await statusSolicPrazoTemaClient.buscarPrazosPadraoParaUI(formData.idTema);
          if (prazosPadrao.length > 0) {
            setStatusPrazos(prazosPadrao);
          } else {
            const defaultPrazos: StatusSolicPrazoTemaForUI[] = [
              {
                idStatusSolicPrazoTema: 0,
                idStatusSolicitacao: 1, // Pré-análise
                idTema: formData.idTema,
                nrPrazoInterno: 72,
                nrPrazoExterno: 0,
                tema: {
                  idTema: formData.idTema,
                  nmTema: selectedTema?.nmTema || ''
                },
                flAtivo: 'S'
              },
              {
                idStatusSolicPrazoTema: 0,
                idStatusSolicitacao: 5, // Análise Regulatória
                idTema: formData.idTema,
                nrPrazoInterno: 72,
                nrPrazoExterno: 0,
                tema: {
                  idTema: formData.idTema,
                  nmTema: selectedTema?.nmTema || ''
                },
                flAtivo: 'S'
              },
              {
                idStatusSolicPrazoTema: 0,
                idStatusSolicitacao: 6, // Em Aprovação
                idTema: formData.idTema,
                nrPrazoInterno: 48,
                nrPrazoExterno: 0,
                tema: {
                  idTema: formData.idTema,
                  nmTema: selectedTema?.nmTema || ''
                },
                flAtivo: 'S'
              },
              {
                idStatusSolicPrazoTema: 0,
                idStatusSolicitacao: 7, // Em Assinatura
                idTema: formData.idTema,
                nrPrazoInterno: 48,
                nrPrazoExterno: 0,
                tema: {
                  idTema: formData.idTema,
                  nmTema: selectedTema?.nmTema || ''
                },
                flAtivo: 'S'
              }
            ];
            setStatusPrazos(defaultPrazos);
          }
        } catch (errorPadrao) {
          console.error('Erro ao carregar prazos padrão:', errorPadrao);
          const defaultPrazos: StatusSolicPrazoTemaForUI[] = [
            {
              idStatusSolicPrazoTema: 0,
              idStatusSolicitacao: 1,
              idTema: formData.idTema,
              nrPrazoInterno: 72,
              nrPrazoExterno: 0,
              tema: {
                idTema: formData.idTema,
                nmTema: selectedTema?.nmTema || ''
              },
              flAtivo: 'S'
            }
          ];
          setStatusPrazos(defaultPrazos);
        }
      } else {
        setStatusPrazos(prazos);
      }
    } catch (error) {
      console.error('Erro ao carregar prazos por status:', error);
      toast.error('Erro ao carregar configurações de prazos');
    } finally {
      setLoadingStatusPrazos(false);
    }
  }, [formData.idTema, temas]);

  const updateLocalPrazo = useCallback((idStatus: number, valor: number) => {
    setStatusPrazos(prev => {
      const existing = prev.find(p => p.idStatusSolicitacao === idStatus);
      if (existing) {
        return prev.map(p =>
          p.idStatusSolicitacao === idStatus
            ? { ...p, nrPrazoInterno: valor }
            : p
        );
      } else {
        const newPrazo = {
          idStatusSolicPrazoTema: 0,
          idStatusSolicitacao: idStatus,
          nrPrazoInterno: valor,
          tema: {
            idTema: formData.idTema || 0,
            nmTema: getSelectedTema()?.nmTema || ''
          },
          flAtivo: 'S'
        } as StatusSolicPrazoTemaForUI;
        return [...prev, newPrazo];
      }
    });
  }, [formData.idTema, getSelectedTema]);

  const selectedTema = getSelectedTema();
  
  const currentPrazoTotal =
    statusPrazos.reduce((acc, curr) => acc + curr.nrPrazoInterno, 0)

  const renderStep3 = useCallback((): JSX.Element => {
    const statusOptions = statusList.length > 0 ? statusList.map(status => ({
      codigo: status.idStatusSolicitacao,
      nome: status.nmStatus
    })) : [
      { codigo: 1, nome: 'Pré-análise' },
      { codigo: 2, nome: 'Vencido Regulatório' },
      { codigo: 3, nome: 'Em análise Área Técnica' },
      { codigo: 4, nome: 'Vencido Área Técnica' },
      { codigo: 5, nome: 'Análise Regulatória' },
      { codigo: 6, nome: 'Em Aprovação' },
      { codigo: 7, nome: 'Em Assinatura' },
      { codigo: 8, nome: 'Concluído' },
      { codigo: 9, nome: 'Arquivado' }
    ];

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
                    onCheckedChange={async (checked) => {
                      const ativo = !!checked;
                      setPrazoExcepcional(ativo);

                      if (!ativo && formData.idTema) {
                        try {
                          await loadStatusPrazos();
                          setFormData(prev => ({
                            ...prev,
                            nrPrazo: selectedTema?.nrPrazo || undefined,
                            tpPrazo: 'H'
                          }));
                        } catch (error) {
                          console.error('Erro ao restaurar prazos padrão:', error);
                          toast.error('Erro ao restaurar configurações padrão');
                        }
                      }
                    }}
                  />
                  <Label htmlFor="prazoExcepcional" className="text-sm font-medium text-blue-600">
                    Prazo Excepcional
                  </Label>
                </div>
                <h3 className="text-blue-500 font-bold ml-auto text-2xl">
                  {currentPrazoTotal}h
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
                    const prazoConfig = statusPrazos.find(p => p.idStatusSolicitacao === status.codigo);
                    const prazoAtual = prazoConfig?.nrPrazoInterno || 0;
                    return (
                      <div key={index} className={`rounded-lg p-4 ${prazoExcepcional ? 'bg-gray-50' : 'bg-gray-100'}`}>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium ${prazoExcepcional ? 'text-gray-900' : 'text-gray-500'}`}>
                              {status.nome}
                            </h4>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updateLocalPrazo(status.codigo, Math.max(0, prazoAtual - 1))}
                                disabled={!prazoExcepcional}
                                className="w-8 h-8 p-0 flex items-center justify-center"
                              >-</Button>
                              <Input
                                key={`prazo-${status.codigo}`}
                                type="number"
                                value={prazoAtual.toString()}
                                onValueChange={(value) => {
                                  const numValue = parseInt(value || '0');
                                  if (numValue >= 0 && numValue <= 300) {
                                    updateLocalPrazo(status.codigo, numValue);
                                  }
                                }}
                                placeholder="0"
                                isDisabled={!prazoExcepcional}
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
                                onClick={() => updateLocalPrazo(status.codigo, prazoAtual + 1)}
                                disabled={!prazoExcepcional}
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
  }, [prazoExcepcional, formData.idTema, loadingStatusPrazos, statusPrazos, updateLocalPrazo, setFormData, statusList, getSelectedTema, loadStatusPrazos]);

  const renderStep4 = useCallback(() => (
    <div className="space-y-6">

      <div className="flex flex-col space-y-4">
        <AnexoComponent onAddAnexos={handleAddAnexos} />

        {anexos.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Anexos:</Label>
            <AnexoList anexos={anexos} onRemove={handleRemoveAnexo} />
          </div>
        )}

        {anexosBackend.length > 0 && (
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

        {anexosTypeE.length > 0 && (
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
              onRemove={(index) => {
                const anexo = anexosTypeE[index];
                if (anexo?.idAnexo) {
                  console.log('Remove anexo type E:', anexo.idAnexo);
                }
              }}
              onDownload={async (anexo) => {
                try {
                  if (!anexo.idObjeto || !anexo.nmArquivo) {
                    toast.error('Dados do documento incompletos');
                    return;
                  }

                  const arquivos = await anexosClient.download(anexo.idObjeto, TipoObjetoAnexo.E, anexo.nmArquivo);

                  if (arquivos.length > 0) {
                    const arquivo = arquivos[0];
                    const byteCharacters = atob(arquivo.conteudoArquivo);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                      byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray]);

                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = arquivo.nomeArquivo || anexo.name || 'documento';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                  } else {
                    toast.error('Arquivo não encontrado');
                  }
                } catch {
                  toast.error('Erro ao baixar documento');
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  ), [anexos, anexosBackend, anexosTypeE, handleAddAnexos, handleRemoveAnexo, handleRemoveAnexoBackend, handleDownloadAnexoBackend]);

  const renderStep5 = useCallback(() => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo da Solicitação</h3>

      {/* Informações Básicas */}
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
          <div className="p-3 bg-gray-50 border rounded-lg text-sm max-h-24 overflow-y-auto">
            {formData.dsSolicitacao || 'Não informado'}
          </div>
        </div>
      </div>

      {/* Tema e Responsável */}
      <div className="border-t pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold text-gray-700">Tema</Label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
              {getSelectedTema()?.nmTema || solicitacao?.tema?.nmTema || solicitacao?.nmTema || 'Não selecionado'}
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">Responsável</Label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
              {responsaveis.find(r => r.idResponsavel === formData.idResponsavel)?.nmResponsavel || 'Não definido'}
            </div>
          </div>
        </div>
      </div>

      {/* Áreas Envolvidas */}
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

      {/* Prazos */}
      <div className="border-t pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold text-gray-700">Prazo Principal</Label>
            <div className="p-3 border border-yellow-200 rounded-lg text-sm">
              {formData.nrPrazo && formData.nrPrazo > 0
                ? `${formData.nrPrazo} ${(() => { switch (formData.tpPrazo) { case 'H': return 'horas'; case 'D': return 'dias'; case 'U': return 'dias úteis'; case 'M': return 'meses'; default: return 'unid.'; } })()}`
                : 'Prazo padrão do tema'
              }
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
                return statusAtual?.nmStatus || 'Pré-análise';
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Prazos por Status */}
      {statusPrazos.length > 0 && (
        <div className="border-t pt-4">
          <Label className="text-sm font-semibold text-gray-700">Prazos Configurados por Status</Label>
          <div className="mt-2 space-y-2">
            {statusPrazos
              .filter(p => p.nrPrazoInterno && p.nrPrazoInterno > 0)
              .map(prazo => {
                const status = statusList.find(s => s.idStatusSolicitacao === prazo.idStatusSolicitacao);
                return (
                  <div key={prazo.idStatusSolicitacao} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                    <span className="font-medium">{status?.nmStatus || `Status ${prazo.idStatusSolicitacao}`}</span>
                    <span className="text-gray-600">{prazo.nrPrazoInterno} horas</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Anexos */}
      <div className="border-t pt-4">
        <Label className="text-sm font-semibold text-gray-700">Anexos ({anexos.length + anexosBackend.length})</Label>
        <div className="mt-2 space-y-2">
          {/* Anexos novos */}
          {anexos.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-2">Novos anexos a serem enviados:</div>
              {anexos.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border rounded text-sm">
                  <span className="font-medium">{file.name}</span>
                  <span className="text-xs">{Math.round(file.size / 1024)} KB</span>
                </div>
              ))}
            </div>
          )}

          {/* Anexos já salvos */}
          {anexosBackend.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-2">Anexos já salvos:</div>
              <div className="flex flex-col gap-2">
                {anexosBackend.map((anexo, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded text-sm">
                    <span className="font-medium text-gray-800">{anexo.nmArquivo}</span>
                    <span className="text-xs text-gray-600">Salvo</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {anexos.length === 0 && anexosBackend.length === 0 && (
            <div className="p-3 bg-gray-50 border rounded-lg text-sm text-gray-500 text-center">
              Nenhum anexo adicionado
            </div>
          )}
        </div>
      </div>
    </div>
  ), [formData, getSelectedTema, responsaveis, anexos, anexosBackend, statusPrazos, statusList, prazoExcepcional, solicitacao?.statusCodigo, solicitacao?.nmTema, solicitacao?.tema?.nmTema, solicitacao?.statusSolicitacao?.idStatusSolicitacao, solicitacao?.statusSolicitacao?.nmStatus, allAreas, getResponsavelByArea]);

  const renderStep1 = () => (
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
        />
        <TextField
          label="Nº Ofício"
          name="nrOficio"
          value={formData.nrOficio}
          onChange={handleInputChange}
          maxLength={50}
        />
        <TextField
          label="Nº Processo"
          name="nrProcesso"
          value={formData.nrProcesso}
          onChange={handleInputChange}
          maxLength={50}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="flAnaliseGerenteDiretor" className="text-sm font-medium text-gray-700">
            Exige análise do Gerente ou Diretor? <span className="text-red-500">*</span>
          </Label>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.flAnaliseGerenteDiretor === 'S'}
                onCheckedChange={() => setFormData(prev => ({
                  ...prev,
                  flAnaliseGerenteDiretor: 'S'
                }))}
              />
              <Label>Sim</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.flAnaliseGerenteDiretor === 'N'}
                onCheckedChange={() => setFormData(prev => ({
                  ...prev,
                  flAnaliseGerenteDiretor: 'N'
                }))}
              />
              <Label>Não</Label>
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
          rows={getRows(formData.dsAssunto)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dsObservacao">Observações</Label>
        <Textarea
          id="dsObservacao"
          name="dsObservacao"
          value={formData.dsObservacao}
          onChange={handleInputChange}
          rows={getRows(formData.dsObservacao)}
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
          disabled
        />
      </div>
    </div>
  );

  useEffect(() => {
    if (currentStep === 3 && formData.idTema) {
      loadStatusPrazos();
    }
  }, [currentStep, formData.idTema, loadStatusPrazos]);

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

  // Load anexos of type E when entering step 4
  useEffect(() => {
    const loadAnexosTypeE = async () => {
      if (currentStep === 4 && solicitacao?.idSolicitacao) {
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
              { title: 'Anexos', description: 'Documentos' },
              { title: 'Resumo', description: 'Finalização' }
            ]}
            onStepClick={handleStepClick}
            canNavigateToStep={(step: number): boolean => {
              if (step === 1) return true;
              if (step === 2) return isStep1Valid();
              if (step >= 3) return isStep1Valid() && isStep2Valid();
              return false; // Fallback para garantir que sempre retorna boolean
            }}
          />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto py-6">
          <form id="solicitacao-form" onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </form>
        </div>

        <DialogFooter className="flex gap-3 pt-6 border-t flex-shrink-0">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Sair
          </Button>

          {currentStep === 1 && (
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={!isStep1Valid()}
              className="flex items-center gap-2"
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
                onClick={handleNextStep}
                disabled={loading || !isStep2Valid()}
                className="flex items-center gap-2"
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
                onClick={handleNextStep}
                disabled={loading}
                className="flex items-center gap-2"
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
                onClick={handleNextStep}
                disabled={loading}
                className="flex items-center gap-2"
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
                type="submit"
                form="solicitacao-form"
                disabled={loading}
                className="flex items-center gap-2"
              >
                {solicitacao && <ArrowArcRightIcon className={"w-4 h-4 mr-1"} />}
                {loading ? 'Salvando...' : solicitacao ? 'Encaminhar solicitação' : 'Criar Solicitação'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
