'use client';

import {useState, useEffect, FormEvent, useCallback, ChangeEvent} from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {TextField} from '@/components/ui/text-field';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Checkbox} from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {SolicitacaoResponse, SolicitacaoRequest} from '@/api/solicitacoes/types';
import {ResponsavelResponse} from '@/api/responsaveis/types';
import {TemaResponse} from '@/api/temas/types';
import {solicitacoesClient} from '@/api/solicitacoes/client';
import {toast} from 'sonner';
import {capitalize} from '@/utils/utils';
import {MultiSelectAreas} from '@/components/ui/multi-select-areas';
import {CaretLeftIcon, CaretRightIcon, CheckIcon, ArrowBendUpRightIcon} from '@phosphor-icons/react';
import AnexoComponent from '../AnexoComponotent/AnexoComponent';
import AnexoList from '../AnexoComponotent/AnexoList/AnexoList';
import {statusSolicPrazoTemaClient} from '@/api/status-prazo-tema/client';
import {StatusSolicitacaoPrazoTema, StatusSolicPrazoTemaResponse} from '@/api/status-prazo-tema/types';

interface AnexoFromBackend {
  idAnexo: number;
  idObjeto: number;
  nmArquivo: string;
  dsCaminho: string;
  tpObjeto: string;
}

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
  const [currentStep, setCurrentStep] = useState(1);
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
  const [anexosBackend, setAnexosBackend] = useState<AnexoFromBackend[]>([]);
  const [statusPrazos, setStatusPrazos] = useState<StatusSolicPrazoTemaResponse[]>([]);
  const [loadingStatusPrazos, setLoadingStatusPrazos] = useState(false);
  const [prazoExcepcional, setPrazoExcepcional] = useState(false);

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
        idsAreas: solicitacao.areas?.map(area => area.idArea) || [],
        nrPrazo: solicitacao.nrPrazo || undefined,
        tpPrazo: solicitacao.tpPrazo || '',
        nrOficio: solicitacao.nrOficio || '',
        nrProcesso: solicitacao.nrProcesso || ''
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

  const getResponsavelFromTema = useCallback((temaId: number): number => {
    const tema = temas.find(t => t.idTema === temaId);
    if (tema && responsaveis.length > 0) {
      return responsaveis[0].idResponsavel;
    }
    return responsaveis.length > 0 ? responsaveis[0].idResponsavel : 0;
  }, [temas, responsaveis]);

  const fillDataFromTema = useCallback((temaId: number) => {
    const tema = temas.find(t => t.idTema === temaId);
    if (tema) {
      const areasIds = tema.areas?.map(area => area.idArea) || [];
      const responsavelId = getResponsavelFromTema(temaId);

      setFormData(prev => ({
        ...prev,
        idTema: temaId,
        idResponsavel: responsavelId,
        idsAreas: areasIds,
        nrPrazo: tema.nrPrazo || undefined,
        tpPrazo: tema.tpPrazo || ''
      }));
    }
  }, [temas, getResponsavelFromTema]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {name, value} = e.target;
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

  const handleSelectChange = useCallback((field: keyof SolicitacaoRequest, value: string) => {
    let processedValue: string | number | undefined = value;

    if (field.includes('id') && field !== 'cdIdentificacao') {
      processedValue = value ? parseInt(value) : 0;
    }

    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: processedValue
      };

      if (field === 'idTema' && processedValue) {
        newFormData.idResponsavel = getResponsavelFromTema(processedValue as number);
      }

      return newFormData;
    });
  }, [getResponsavelFromTema]);

  const statusLetterToId = (letter?: string): number | undefined => {
    if (!letter) return undefined;
    const map: Record<string, number> = { P:1, V:2, A:3, T:4, R:5, O:6, S:7, C:8, X:9 };
    return map[letter.toUpperCase()];
  };

  const handleNextStep = useCallback(async () => {
    try {
      if (currentStep === 1) {
        if (!formData.cdIdentificacao?.trim()) {
          toast.error("Código de identificação é obrigatório");
          return;
        }
        // Apenas atualizar identificação se edição; novo só segue local
        if (solicitacao) {
          await solicitacoesClient.etapaIdentificacao(solicitacao.idSolicitacao, {
            cdIdentificacao: formData.cdIdentificacao?.trim(),
            dsAssunto: formData.dsAssunto?.trim(),
            dsObservacao: formData.dsObservacao?.trim(),
            nrOficio: formData.nrOficio?.trim(),
            nrProcesso: formData.nrProcesso?.trim(),
          });
        }
        setCurrentStep(2);
      } else if (currentStep === 2) {
        if (!formData.idTema || formData.idTema === 0) {
          toast.error("Tema é obrigatório");
          return;
        }
        if (solicitacao) {
          await solicitacoesClient.etapaTema(solicitacao.idSolicitacao, {
            idTema: formData.idTema,
            tpPrazo: formData.tpPrazo || undefined,
            nrPrazoInterno: formData.nrPrazo,
            flExcepcional: prazoExcepcional ? 'S' : 'N',
            idsAreas: formData.idsAreas
          });
        }
        setCurrentStep(3);
      } else if (currentStep === 3) {
        if (solicitacao) {
          const solicitacoesPrazos = statusPrazos
            .filter(p => p.nrPrazoInterno && p.nrPrazoInterno > 0)
            .map(p => ({
              idStatusSolicitacao: p.idStatusSolicitacao,
              nrPrazoInterno: p.nrPrazoInterno,
              tpPrazo: formData.tpPrazo || undefined,
              flExcepcional: prazoExcepcional ? 'S' : 'N'
            }));
          await solicitacoesClient.etapaPrazo(solicitacao.idSolicitacao, {
            nrPrazoInterno: formData.nrPrazo,
            solicitacoesPrazos
          });
        }
        setCurrentStep(4);
      } else if (currentStep === 4) {
        if (solicitacao) {
          if (anexos.length > 0) {
            const formDataAnexos = new FormData();
            anexos.forEach((file) => formDataAnexos.append('files', file));
            formDataAnexos.append('idObjeto', String(solicitacao.idSolicitacao));
            formDataAnexos.append('tpObjeto', 'S');
            try { await solicitacoesClient.uploadAnexos(formDataAnexos); } catch { toast.error('Erro ao anexar arquivos'); }
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
    } else if (step === 2 && formData.cdIdentificacao?.trim()) {
      setCurrentStep(step);
    } else if (step === 3 && formData.cdIdentificacao?.trim() && (formData.idTema && formData.idTema > 0)) {
      setCurrentStep(step);
    } else if (step === 4 && formData.cdIdentificacao?.trim() && (formData.idTema && formData.idTema > 0)) {
      setCurrentStep(step);
    } else if (step === 5 && formData.cdIdentificacao?.trim() && (formData.idTema && formData.idTema > 0)) {
      setCurrentStep(step);
    }
  }, [formData.cdIdentificacao, formData.idTema]);

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
      // Garantir que temos os dados necessários do anexo
      if (!anexo.idObjeto || !anexo.idAnexo) {
        toast.error('Dados do documento incompletos');
        return;
      }

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      let id = solicitacao?.idSolicitacao;

      // Criação consolidada para nova solicitação
      if (!id) {
        if (!formData.cdIdentificacao?.trim()) { toast.error('Código de identificação é obrigatório'); setLoading(false); return; }
        if (!formData.idTema || formData.idTema === 0) { toast.error('Tema é obrigatório'); setLoading(false); return; }

        const created = await solicitacoesClient.criar({
          cdIdentificacao: formData.cdIdentificacao?.trim(),
          dsAssunto: formData.dsAssunto?.trim(),
            dsSolicitacao: formData.dsSolicitacao?.trim(),
            dsObservacao: formData.dsObservacao?.trim(),
            nrOficio: formData.nrOficio?.trim(),
            nrProcesso: formData.nrProcesso?.trim(),
            idTema: formData.idTema,
            nrPrazo: formData.nrPrazo,
            tpPrazo: formData.tpPrazo || undefined,
        });
        id = created.idSolicitacao;

        // Aplica prazos por status se configurados
        if (statusPrazos.length > 0) {
          const solicitacoesPrazos = statusPrazos
            .filter(p => p.nrPrazoInterno && p.nrPrazoInterno > 0)
            .map(p => ({
              idStatusSolicitacao: p.idStatusSolicitacao,
              nrPrazoInterno: p.nrPrazoInterno,
              tpPrazo: formData.tpPrazo || undefined,
              flExcepcional: prazoExcepcional ? 'S' : 'N'
            }));
          if (solicitacoesPrazos.length > 0) {
            await solicitacoesClient.etapaPrazo(id, { nrPrazoInterno: formData.nrPrazo, solicitacoesPrazos });
          }
        }

        // Upload anexos novos
        if (anexos.length > 0) {
          const formDataAnexos = new FormData();
          anexos.forEach(f => formDataAnexos.append('files', f));
          formDataAnexos.append('idObjeto', String(id));
          formDataAnexos.append('tpObjeto', 'S');
          try { await solicitacoesClient.uploadAnexos(formDataAnexos); } catch { toast.error('Erro ao anexar arquivos'); }
        }
      } else {
        // Em edição: aplicar status final após etapas já salvas
        const statusId = statusLetterToId(formData.flStatus);
        if (statusId) {
          try {
            await solicitacoesClient.etapaStatus(id, statusId);
            await solicitacoesClient.aplicarStatus(id, statusId);
          } catch { toast.error('Erro ao aplicar status'); }
        }
      }

      toast.success('Solicitação salva com sucesso!');
      onSave();
      onClose();
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar solicitação');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    setCurrentStep(1);
    onClose();
  }, [onClose]);

  const isStep1Valid = useCallback(() => {
    return formData.cdIdentificacao?.trim() !== '';
  }, [formData.cdIdentificacao]);

  const isStep2Valid = useCallback(() => {
    return formData.idTema !== undefined && formData.idTema > 0;
  }, [formData.idTema]);

  const getSelectedTema = useCallback(() => {
    return temas.find(tema => tema.idTema === formData.idTema);
  }, [temas, formData.idTema]);

  const renderStep2 = useCallback(() => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="tema">Tema *</Label>
        <Select
          value={formData.idTema ? formData.idTema.toString() : ''}
          onValueChange={(value) => {
            const temaId = parseInt(value);
            fillDataFromTema(temaId);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tema"/>
          </SelectTrigger>
          <SelectContent>
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
        disabled={formData.idTema === 0 || formData.idTema === null}
      />
    </div>
  ), [formData.idTema, fillDataFromTema, temas, formData.idsAreas, handleAreasSelectionChange]);

  const loadStatusPrazos = useCallback(async () => {
    if (!formData.idTema) return;

    try {
      setLoadingStatusPrazos(true);
      const prazos = await statusSolicPrazoTemaClient.listar(formData.idTema);
      setStatusPrazos(prazos);
    } catch (error) {
      console.error('Erro ao carregar prazos por status:', error);
      toast.error('Erro ao carregar configurações de prazos');
    } finally {
      setLoadingStatusPrazos(false);
    }
  }, [formData.idTema]);

  const updateLocalPrazo = useCallback((idStatus: number, valor: number) => {
    setStatusPrazos(prev => {
      const existing = prev.find(p => p.idStatusSolicitacao === idStatus);
      if (existing) {
        return prev.map(p =>
          p.idStatusSolicitacao === idStatus
            ? {...p, nrPrazoInterno: valor}
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
        } as StatusSolicPrazoTemaResponse;
        return [...prev, newPrazo];
      }
    });
  }, [formData.idTema, getSelectedTema]);

  const renderStep3 = useCallback((): JSX.Element => {
    const statusOptions = [
      {codigo: 1, nome: 'Pré-análise'},
      {codigo: 2, nome: 'Vencido Regulatório'},
      {codigo: 3, nome: 'Em análise Área Técnica'},
      {codigo: 4, nome: 'Vencido Área Técnica'},
      {codigo: 5, nome: 'Análise Regulatória'},
      {codigo: 6, nome: 'Em Aprovação'},
      {codigo: 7, nome: 'Em Assinatura'},
      {codigo: 8, nome: 'Concluído'},
      {codigo: 9, nome: 'Arquivado'}
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="prazoExcepcional"
            checked={prazoExcepcional}
            onCheckedChange={(checked) => {
              const ativo = !!checked;
              setPrazoExcepcional(ativo);
              if (!ativo) {
                setFormData(prev => ({
                  ...prev,
                  nrPrazo: undefined,
                  tpPrazo: ''
                }));
              }
            }}
          />
          <Label htmlFor="prazoExcepcional" className="text-sm font-medium text-gray-700">
            Prazo Excepcional
          </Label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextField
            id="nrPrazo"
            label="Prazo"
            name="nrPrazo"
            type="number"
            value={formData.nrPrazo && formData.nrPrazo > 0 ? formData.nrPrazo.toString() : ''}
            onChange={handleInputChange}
            placeholder="Horas"
            disabled={!prazoExcepcional}
          />
          <div className="flex flex-col gap-1">
            <Label htmlFor="tpPrazo">Tipo de Prazo</Label>
            <Select
              value={formData.tpPrazo}
              onValueChange={(value) => handleSelectChange('tpPrazo', value)}
              disabled={!prazoExcepcional}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="U">Horas úteis</SelectItem>
                <SelectItem value="C">Horas corridas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {formData.idTema ? (
          <div className="flex flex-col">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuração de Prazos Internos</h3>
            <div className="space-y-4">
              {loadingStatusPrazos ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-sm text-gray-500">Carregando configurações...</div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {statusOptions.map(status => {
                    const prazoConfig = statusPrazos.find(p => p.idStatusSolicitacao === status.codigo);
                    const prazoAtual = prazoConfig?.nrPrazoInterno || 0;
                    return (
                      <div key={status.codigo} className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{status.nome}</h4>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">Prazo Interno (horas)</Label>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updateLocalPrazo(status.codigo, Math.max(0, prazoAtual - 1))}
                                disabled={!prazoExcepcional}
                                className="w-8 h-8 p-0 flex items-center justify-center"
                              >-</Button>
                              <TextField
                                key={`prazo-${status.codigo}`}
                                type="number"
                                value={prazoAtual.toString()}
                                onChange={(e) => updateLocalPrazo(status.codigo, parseInt(e.target.value) || 0)}
                                placeholder="0"
                                disabled={!prazoExcepcional}
                                className="flex-1 text-center"
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
    );
  }, [prazoExcepcional, formData.nrPrazo, formData.tpPrazo, formData.idTema, handleInputChange, handleSelectChange, loadingStatusPrazos, statusPrazos, updateLocalPrazo, setFormData]);

  const renderStep4 = useCallback(() => (
    <div className="space-y-6">

      <div className="flex flex-col space-y-4">
        <AnexoComponent onAddAnexos={handleAddAnexos}/>

        {anexos.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Anexos:</Label>
            <AnexoList anexos={anexos} onRemove={handleRemoveAnexo}/>
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
      </div>
    </div>
  ), [anexos, anexosBackend, handleAddAnexos, handleRemoveAnexo, handleRemoveAnexoBackend, handleDownloadAnexoBackend]);

  const renderStep5 = useCallback(() => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Código de Identificação</Label>
            <div className="p-4 bg-gray-50 border rounded-lg">
              {formData.cdIdentificacao}
            </div>
          </div>
          <div>
            <Label>Tema</Label>
            <div className="p-4 bg-gray-50 border rounded-lg">
              {getSelectedTema()?.nmTema}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Responsável</Label>
            <div className="p-4 bg-gray-50 border rounded-lg">
              {responsaveis.find(r => r.idResponsavel === formData.idResponsavel)?.nmResponsavel || 'N/A'}
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <div className="p-4 bg-gray-50 border rounded-lg">
              {formData.flStatus}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Prazos</Label>
            <div className="p-4 bg-gray-50 border rounded-lg">
              {formData.nrPrazo ? `${formData.nrPrazo} horas` : 'Não definido'} {formData.tpPrazo === 'U' ? '(Horas úteis)' : formData.tpPrazo === 'C' ? '(Horas corridas)' : ''}
            </div>
          </div>
          <div>
            <Label>Anexos</Label>
            <div className="p-4 bg-gray-50 border rounded-lg">
              {anexos.length + anexosBackend.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  ), [formData, getSelectedTema, responsaveis, anexos, anexosBackend]);

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
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
          label="Assunto"
          name="dsAssunto"
          value={formData.dsAssunto}
          onChange={handleInputChange}
          maxLength={500}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
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

      <div className="space-y-2">
        <Label htmlFor="dsSolicitacao">Descrição da Solicitação</Label>
        <Textarea
          id="dsSolicitacao"
          name="dsSolicitacao"
          value={formData.dsSolicitacao}
          onChange={handleInputChange}
          rows={3}
          maxLength={1000}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dsObservacao">Observações</Label>
        <Textarea
          id="dsObservacao"
          name="dsObservacao"
          value={formData.dsObservacao}
          onChange={handleInputChange}
          rows={3}
          maxLength={1000}
        />
      </div>
    </div>
  );

  useEffect(() => {
    if (currentStep === 3 && formData.idTema) {
      loadStatusPrazos();
    }
  }, [currentStep, formData.idTema, loadStatusPrazos]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="overflow-y-auto h-full">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-xl font-semibold">
            {solicitacao ? 'Encaminhar Solicitação' : 'Nova Solicitação'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto space-y-8">
          {/* Stepper Navigation */}
          <div className="flex justify-center mb-8 pt-1">
            <div className="flex items-start space-x-4">
              {/* Etapa 1 */}
              <div className="flex flex-col items-center space-y-2">
                <button
                  type="button"
                  onClick={() => handleStepClick(1)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    currentStep === 1
                      ? 'bg-blue-500 border-blue-500 text-white ring-2 ring-blue-200'
                      : currentStep > 1
                        ? 'bg-blue-100 border-blue-300 text-primary'
                        : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {currentStep > 1 ? <CheckIcon size={20}/> : '1'}
                </button>
                <span className={`text-xs font-medium text-center ${
                  currentStep === 1
                    ? 'text-primary'
                    : currentStep > 1
                      ? 'text-blue-500'
                      : 'text-gray-400'
                }`}>
                  Dados da<br/>Solicitação
                </span>
              </div>

              {/* Linha conectora 1-2 */}
              <div className={`w-16 my-auto h-1 transition-colors ${
                currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-300'
              }`}></div>

              {/* Etapa 2 */}
              <div className="flex flex-col items-center space-y-2">
                <button
                  type="button"
                  onClick={() => handleStepClick(2)}
                  disabled={!isStep1Valid()}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors disabled:cursor-not-allowed ${
                    currentStep === 2
                      ? 'bg-blue-500 border-blue-500 text-white ring-2 ring-blue-200'
                      : currentStep > 2
                        ? 'bg-blue-100 border-blue-300 text-primary'
                        : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {currentStep > 2 ? <CheckIcon size={20}/> : '2'}
                </button>
                <span className={`text-xs font-medium text-center ${
                  currentStep === 2
                    ? 'text-primary'
                    : currentStep > 2
                      ? 'text-blue-500'
                      : currentStep >= 2
                        ? 'text-primary'
                        : 'text-gray-400'
                }`}>
                  Tema e<br/>Áreas
                </span>
              </div>

              {/* Linha conectora 2-3 */}
              <div className={`w-16 my-auto h-1 transition-colors ${
                currentStep >= 3 ? 'bg-blue-500' : 'bg-gray-300'
              }`}></div>

              {/* Etapa 3 */}
              <div className="flex flex-col items-center space-y-2">
                <button
                  type="button"
                  onClick={() => handleStepClick(3)}
                  disabled={!isStep1Valid()}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors disabled:cursor-not-allowed ${
                    currentStep === 3
                      ? 'bg-blue-500 border-blue-500 text-white ring-2 ring-blue-200'
                      : currentStep > 3
                        ? 'bg-blue-100 border-blue-300 text-primary'
                        : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {currentStep > 3 ? <CheckIcon size={20}/> : '3'}
                </button>
                <span className={`text-xs font-medium text-center ${
                  currentStep === 3
                    ? 'text-primary'
                    : currentStep > 3
                      ? 'text-blue-500'
                      : currentStep >= 3
                        ? 'text-primary'
                        : 'text-gray-400'
                }`}>
                  Status e<br/>Prazos
                </span>
              </div>

              {/* Linha conectora 3-4 */}
              <div className={`w-16 my-auto h-1 transition-colors ${
                currentStep >= 4 ? 'bg-blue-500' : 'bg-gray-300'
              }`}></div>

              {/* Etapa 4 */}
              <div className="flex flex-col items-center space-y-2">
                <button
                  type="button"
                  onClick={() => handleStepClick(4)}
                  disabled={!isStep1Valid()}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors disabled:cursor-not-allowed ${
                    currentStep === 4
                      ? 'bg-blue-500 border-blue-500 text-white ring-2 ring-blue-200'
                      : currentStep > 4
                        ? 'bg-blue-100 border-blue-300 text-primary'
                        : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {currentStep > 4 ? <CheckIcon size={20}/> : '4'}
                </button>
                <span className={`text-xs font-medium text-center ${
                  currentStep === 4
                    ? 'text-primary'
                    : currentStep > 4
                      ? 'text-blue-500'
                      : currentStep >= 4
                        ? 'text-primary'
                        : 'text-gray-400'
                }`}>
                  Anexos
                </span>
              </div>

              {/* Linha conectora 4-5 */}
              <div className={`w-16 my-auto h-1 transition-colors ${
                currentStep >= 5 ? 'bg-blue-500' : 'bg-gray-300'
              }`}></div>

              {/* Etapa 5 */}
              <div className="flex flex-col items-center space-y-2">
                <button
                  type="button"
                  onClick={() => handleStepClick(5)}
                  disabled={!isStep1Valid()}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors disabled:cursor-not-allowed ${
                    currentStep === 5
                      ? 'bg-blue-500 border-blue-500 text-white ring-2 ring-blue-200'
                      : currentStep > 5
                        ? 'bg-blue-100 border-blue-300 text-primary'
                        : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {currentStep > 5 ? <CheckIcon size={20}/> : '5'}
                </button>
                <span className={`text-xs font-medium text-center ${
                  currentStep === 5
                    ? 'text-primary'
                    : currentStep > 5
                      ? 'text-blue-500'
                      : currentStep >= 5
                        ? 'text-primary'
                        : 'text-gray-400'
                }`}>
                  Resumo
                </span>
              </div>
            </div>
          </div>

          <div className="h-[500px]">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </div>

        </form>
        <DialogFooter className="flex gap-3 pt-6 border-t mt-auto">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>

          {currentStep === 1 && (
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={!isStep1Valid()}
              className="flex items-center gap-2"
            >
              Próximo
              <CaretRightIcon size={16}/>
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
                <CaretLeftIcon size={16}/>
                Anterior
              </Button>
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={loading || !isStep2Valid()}
                className="flex items-center gap-2"
              >
                Próximo
                <CaretRightIcon size={16}/>
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
                <CaretLeftIcon size={16}/>
                Anterior
              </Button>
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={loading}
                className="flex items-center gap-2"
              >
                Próximo
                <CaretRightIcon size={16}/>
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
                <CaretLeftIcon size={16}/>
                Anterior
              </Button>
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={loading}
                className="flex items-center gap-2"
              >
                Próximo
                <CaretRightIcon size={16}/>
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
                <CaretLeftIcon size={16}/>
                Anterior
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                {solicitacao && <ArrowBendUpRightIcon className="h-4 w-4 mr-2"/>}
                {loading ? 'Salvando...' : solicitacao ? 'Encaminhar Solicitação' : 'Criar Solicitação'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
