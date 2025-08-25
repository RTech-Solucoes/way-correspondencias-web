'use client';

import {useState, useEffect, FormEvent, useCallback, ChangeEvent} from 'react';
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
import { capitalize } from '@/utils/utils';
import { MultiSelectAreas } from '@/components/ui/multi-select-areas';
import { CaretLeftIcon, CaretRightIcon, CheckIcon, ArrowBendUpRightIcon } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { useDropzone } from 'react-dropzone';
import AnexoComponent from '../AnexoComponotent/AnexoComponent';
import AnexoList from '../AnexoComponotent/AnexoList/AnexoList';

// Tipos para anexos
interface AnexoBackend {
  idAnexo: number;
  idObjeto: number;
  nmArquivo: string;
  dsCaminho: string;
  tpObjeto: string;
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
  const [anexosBackend, setAnexosBackend] = useState<AnexoBackend[]>([]);

  useEffect(() => {
    if (solicitacao) {
      setFormData({
        idEmail: solicitacao.idEmail,
        cdIdentificacao: solicitacao.cdIdentificacao,
        dsAssunto: solicitacao.dsAssunto || '',
        dsSolicitacao: solicitacao.dsSolicitacao || '',
        dsObservacao: solicitacao.dsObservacao || '',
        flStatus: solicitacao.flStatus,
        idResponsavel: solicitacao.idResponsavel,
        idTema: solicitacao.idTema,
        idsAreas: solicitacao.areas?.map(area => area.idArea) || [],
        nrPrazo: solicitacao.nrPrazo || undefined,
        tpPrazo: solicitacao.tpPrazo || '',
        nrOficio: solicitacao.nrOficio || '',
        nrProcesso: solicitacao.nrProcesso || ''
      });
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
    }
    setCurrentStep(1);
  }, [solicitacao, open, initialSubject, initialDescription]);

  useEffect(() => {
    if (solicitacao && solicitacao.idSolicitacao) {
      solicitacoesClient.buscarAnexos(solicitacao.idSolicitacao).then(setAnexosBackend);
    } else {
      setAnexosBackend([]);
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

  const handleAreaToggle = useCallback((areaId: number) => {
    setFormData(prev => {
      const currentAreas = prev.idsAreas || [];
      const isChecked = currentAreas.includes(areaId);
      return {
        ...prev,
        idsAreas: isChecked
          ? currentAreas.filter(id => id !== areaId)
          : [...currentAreas, areaId]
      };
    });
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

      // Se estamos alterando o tema, atualiza o responsável automaticamente
      if (field === 'idTema' && processedValue) {
        newFormData.idResponsavel = getResponsavelFromTema(processedValue as number);
      }

      return newFormData;
    });
  }, [getResponsavelFromTema]);

  const handleNextStep = useCallback(() => {
    if (currentStep === 1) {
      if (!formData.cdIdentificacao?.trim()) {
        toast.error("Código de identificação é obrigatório");
        return;
      }
      if (!formData.idTema || formData.idTema === 0) {
        toast.error("Tema é obrigatório");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep(5);
    }
  }, [formData.cdIdentificacao, formData.idTema, currentStep]);

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
    } else if (step === 2 && formData.cdIdentificacao?.trim() && formData.idTema > 0) {
      setCurrentStep(step);
    } else if (step === 3 && formData.cdIdentificacao?.trim() && formData.idTema > 0) {
      setCurrentStep(step);
    } else if (step === 4 && formData.cdIdentificacao?.trim() && formData.idTema > 0) {
      setCurrentStep(step);
    } else if (step === 5 && formData.cdIdentificacao?.trim() && formData.idTema > 0) {
      setCurrentStep(step);
    }
  }, [formData.cdIdentificacao, formData.idTema]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setAnexos(prev => [...prev, ...acceptedFiles]);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.cdIdentificacao?.trim()) {
      toast.error("Código de identificação é obrigatório");
      return;
    }

    if (!formData.idTema || formData.idTema === 0) {
      toast.error("Tema é obrigatório");
      return;
    }

    try {
      setLoading(true);
      const finalFormData = {
        ...formData,
        idResponsavel: formData.idResponsavel || getResponsavelFromTema(formData.idTema),
        dsAssunto: formData.dsAssunto?.trim() || undefined,
        dsSolicitacao: formData.dsSolicitacao?.trim() || undefined,
        dsObservacao: formData.dsObservacao?.trim() || undefined,
        nrOficio: formData.nrOficio?.trim() || undefined,
        nrProcesso: formData.nrProcesso?.trim() || undefined,
        nrPrazo: formData.nrPrazo && formData.nrPrazo > 0 ? formData.nrPrazo : undefined,
        tpPrazo: formData.tpPrazo?.trim() || undefined,
      };
      let solicitacaoId;
      if (solicitacao) {
        // Atualização
        await solicitacoesClient.atualizar(solicitacao.idSolicitacao, finalFormData);
        solicitacaoId = solicitacao.idSolicitacao;
      } else {
        // Criação
        const created = await solicitacoesClient.criar(finalFormData);
        solicitacaoId = created.idSolicitacao;
      }
      // Enviar anexos após criar/atualizar solicitação
      if (anexos.length > 0 && solicitacaoId) {
        const formDataAnexos = new FormData();
        anexos.forEach((file) => {
          formDataAnexos.append('files', file);
        });
        formDataAnexos.append('idObjeto', String(solicitacaoId));
        formDataAnexos.append('tpObjeto', 'S');
        await solicitacoesClient.uploadAnexos(formDataAnexos);
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

  const handleClose = useCallback(() => {
    setCurrentStep(1);
    onClose();
  }, [onClose]);

  const isStep1Valid = useCallback(() => {
    return formData.cdIdentificacao?.trim() !== '' && formData.idTema > 0;
  }, [formData.cdIdentificacao, formData.idTema]);

  const isStep2Valid = useCallback(() => {
    return formData.idTema > 0;
  }, [formData.idTema]);

  const getSelectedTema = useCallback(() => {
    return temas.find(tema => tema.idTema === formData.idTema);
  }, [temas, formData.idTema]);

  const selectedAreas = useCallback(() => {
    return solicitacao?.areas || [];
  }, [solicitacao?.areas]);

  const renderStep2 = useCallback(() => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Tema Selecionado</Label>
        <div className="p-4 bg-gray-50 border rounded-3xl">
          {getSelectedTema() ? (
            <div className="flex items-center justify-between">
              <span className="font-medium">{getSelectedTema()?.nmTema}</span>
              <Badge>{responsaveis.find(r => r.idResponsavel === formData.idResponsavel)?.nmResponsavel || 'N/A'}</Badge>
            </div>
          ) : (
            <span className="text-sm text-gray-500">Nenhum tema selecionado.</span>
          )}
        </div>
      </div>

      <MultiSelectAreas
        selectedAreaIds={formData.idsAreas || []}
        onSelectionChange={handleAreasSelectionChange}
      />
    </div>
  ), [getSelectedTema, responsaveis, formData.idResponsavel, formData.idsAreas, handleAreasSelectionChange]);

  const renderStep3 = useCallback(() => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={formData.flStatus}
            onValueChange={(value) => handleSelectChange('flStatus', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="P">Pré-análise</SelectItem>
              <SelectItem value="V">Vencido Regulatório</SelectItem>
              <SelectItem value="A">Em análise Área Técnica</SelectItem>
              <SelectItem value="T">Vencido Área Técnica</SelectItem>
              <SelectItem value="R">Análise Regulatória</SelectItem>
              <SelectItem value="O">Em Aprovação</SelectItem>
              <SelectItem value="S">Em Assinatura</SelectItem>
              <SelectItem value="C">Concluído</SelectItem>
              <SelectItem value="X">Arquivado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nrPrazo">Prazo</Label>
          <TextField
            id="nrPrazo"
            name="nrPrazo"
            type="number"
            value={formData.nrPrazo && formData.nrPrazo > 0 ? formData.nrPrazo.toString() : ''}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tpPrazo">Tipo de Prazo</Label>
          <Select
            value={formData.tpPrazo}
            onValueChange={(value) => handleSelectChange('tpPrazo', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="U">Dias Úteis</SelectItem>
              <SelectItem value="C">Dias Corridos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  ), [formData.flStatus, handleSelectChange, formData.nrPrazo, handleInputChange, formData.tpPrazo]);

  const renderStep4 = useCallback(() => (
    <div className="space-y-6">
      <div className="text-center">
        <Label className="text-xl font-semibold">Documentos da Solicitação</Label>
        <p className="text-sm text-gray-600 mt-2">
          Anexe documentos relacionados à sua solicitação
        </p>
      </div>

      {/* Componente de Upload de Anexos */}
      <div className="flex flex-col space-y-4">
        <AnexoComponent onAddAnexos={handleAddAnexos} />

        {/* Lista de Anexos Novos (a serem enviados) */}
        {anexos.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Novos documentos:</Label>
            <AnexoList anexos={anexos} onRemove={handleRemoveAnexo} />
          </div>
        )}

        {/* Lista de Anexos já Vinculados (do backend) */}
        {anexosBackend.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Documentos já anexados:</Label>
            <AnexoList
              anexos={anexosBackend.map(a => ({
                name: a.nmArquivo,
                size: 0,
                idAnexo: a.idAnexo,
                idObjeto: a.idObjeto,
                nmArquivo: a.nmArquivo,
                dsCaminho: a.dsCaminho,
                tpObjeto: a.tpObjeto
              }))}
              onRemove={handleRemoveAnexoBackend}
              onDownload={handleDownloadAnexoBackend}
            />
          </div>
        )}

        {anexos.length === 0 && anexosBackend.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Nenhum documento anexado ainda</p>
            <p className="text-sm text-gray-400 mt-1">
              Use o botão <strong>Anexar Documento</strong> acima para adicionar arquivos
            </p>
          </div>
        )}
      </div>
    </div>
  ), [anexos, anexosBackend]);

  const renderStep5 = useCallback(() => (
    <div className="space-y-6">
      <div className="text-center">
        <Label className="text-xl font-semibold">Resumo da Solicitação</Label>
        <p className="text-sm text-gray-600 mt-2">
          Revise as informações da sua solicitação antes de enviar
        </p>
      </div>

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
              {formData.nrPrazo} {formData.tpPrazo === 'U' ? 'dias úteis' : 'dias corridos'}
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
            <SelectValue placeholder="Selecione o tema" />
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
    </div>
  );

  const handleRemoveAnexo = (index: number) => {
    setAnexos(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddAnexos = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setAnexos(prev => [...prev, ...fileArray]);
    }
  };

  const handleRemoveAnexoBackend = async (index: number) => {
    const anexo = anexosBackend[index];
    if (!anexo) return;
    try {
      await solicitacoesClient.deletarAnexo(anexo.idAnexo);
      setAnexosBackend(prev => prev.filter((_, i) => i !== index));
      toast.success('Anexo removido com sucesso!');
    } catch {
      toast.error('Erro ao remover anexo');
    }
  };

  const handleDownloadAnexoBackend = async (anexo: any) => {
    if (!anexo || !anexo.idObjeto || !anexo.nmArquivo) return;
    try {
      const blob = await solicitacoesClient.downloadAnexo(anexo.idObjeto, anexo.nmArquivo);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = anexo.nmArquivo;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Erro ao baixar anexo');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="pb-6">
          <DialogTitle className="text-xl font-semibold">
            {solicitacao ? 'Encaminhar Solicitação' : 'Nova Solicitação'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Stepper Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {/* Etapa 1 */}
              <div className="flex flex-col items-center space-y-2">
                <button
                  type="button"
                  onClick={() => handleStepClick(1)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    currentStep === 1
                      ? 'bg-blue-500 border-blue-500 text-white ring-2 ring-blue-200'
                      : currentStep > 1
                        ? 'bg-blue-100 border-blue-300 text-blue-600'
                        : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {currentStep > 1 ? <CheckIcon size={20} /> : '1'}
                </button>
                <span className={`text-xs font-medium text-center ${
                  currentStep === 1 
                    ? 'text-blue-600' 
                    : currentStep > 1 
                      ? 'text-blue-500' 
                      : 'text-gray-400'
                }`}>
                  Dados da<br/>Solicitação
                </span>
              </div>

              {/* Linha conectora 1-2 */}
              <div className={`w-16 h-1 transition-colors ${
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
                        ? 'bg-blue-100 border-blue-300 text-blue-600'
                        : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {currentStep > 2 ? <CheckIcon size={20} /> : '2'}
                </button>
                <span className={`text-xs font-medium text-center ${
                  currentStep === 2 
                    ? 'text-blue-600' 
                    : currentStep > 2 
                      ? 'text-blue-500' 
                      : currentStep >= 2 
                        ? 'text-blue-600' 
                        : 'text-gray-400'
                }`}>
                  Tema e<br/>Áreas
                </span>
              </div>

              {/* Linha conectora 2-3 */}
              <div className={`w-16 h-1 transition-colors ${
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
                        ? 'bg-blue-100 border-blue-300 text-blue-600'
                        : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {currentStep > 3 ? <CheckIcon size={20} /> : '3'}
                </button>
                <span className={`text-xs font-medium text-center ${
                  currentStep === 3 
                    ? 'text-blue-600' 
                    : currentStep > 3 
                      ? 'text-blue-500' 
                      : currentStep >= 3 
                        ? 'text-blue-600'
                        : 'text-gray-400'
                }`}>
                  Status e<br/>Prazos
                </span>
              </div>

              {/* Linha conectora 3-4 */}
              <div className={`w-16 h-1 transition-colors ${
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
                        ? 'bg-blue-100 border-blue-300 text-blue-600'
                        : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {currentStep > 4 ? <CheckIcon size={20} /> : '4'}
                </button>
                <span className={`text-xs font-medium text-center ${
                  currentStep === 4 
                    ? 'text-blue-600' 
                    : currentStep > 4 
                      ? 'text-blue-500' 
                      : currentStep >= 4 
                        ? 'text-blue-600' 
                        : 'text-gray-400'
                }`}>
                  Anexos
                </span>
              </div>

              {/* Linha conectora 4-5 */}
              <div className={`w-16 h-1 transition-colors ${
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
                        ? 'bg-blue-100 border-blue-300 text-blue-600'
                        : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {currentStep > 5 ? <CheckIcon size={20} /> : '5'}
                </button>
                <span className={`text-xs font-medium text-center ${
                  currentStep === 5 
                    ? 'text-blue-600' 
                    : currentStep > 5 
                      ? 'text-blue-500' 
                      : currentStep >= 5 
                        ? 'text-blue-600' 
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

          <DialogFooter className="flex gap-3 pt-6 border-t">
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
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  { solicitacao && <ArrowBendUpRightIcon className="h-4 w-4 mr-2"/>}
                  {loading ? 'Salvando...' : solicitacao ? 'Encaminhar Solicitação' : 'Criar Solicitação'}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
