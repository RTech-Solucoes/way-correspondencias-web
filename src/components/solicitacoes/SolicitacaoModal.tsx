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
    if (!formData.cdIdentificacao?.trim()) {
      toast.error("Código de identificação é obrigatório");
      return;
    }
    setCurrentStep(2);
  }, [formData.cdIdentificacao]);

  const handlePreviousStep = useCallback(() => {
    setCurrentStep(1);
  }, []);

  const handleStepClick = useCallback((step: number) => {
    if (step === 1 || (step === 2 && formData.cdIdentificacao?.trim())) {
      setCurrentStep(step);
    }
  }, [formData.cdIdentificacao]);

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

      if (solicitacao) {
        await solicitacoesClient.atualizar(solicitacao.idSolicitacao, finalFormData);
        toast.success("Solicitação encaminhada com sucesso");
      } else {
        await solicitacoesClient.criar(finalFormData);
        toast.success("Solicitação criada com sucesso");
      }

      onSave();
      onClose();
    } catch (error: unknown) {
      console.error('Erro ao salvar solicitação:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(solicitacao ? `Erro ao encaminhar solicitação: ${errorMessage}` : `Erro ao criar solicitação: ${errorMessage}`);
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

  const getAreasResponsaveis = useCallback(() => {
    if (!formData.idsAreas || !solicitacao?.areas) return [];
    return solicitacao.areas.filter(area =>
      formData.idsAreas?.includes(area.idArea)
    );
  }, [formData.idsAreas, solicitacao?.areas]);

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

      {solicitacao ? (
        <div className="space-y-4">
          <div>
            <Label>Áreas da Solicitação</Label>
            <div className="mt-2 space-y-2">
              {selectedAreas().map((area) => {
                const isChecked = formData.idsAreas?.includes(area.idArea) || false;
                return (
                  <div
                    key={area.idArea}
                    className="flex items-center justify-between p-3 bg-gray-50 border rounded-3xl cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleAreaToggle(area.idArea)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isChecked 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-gray-300'
                      }`}>
                        {isChecked && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {area.nmArea}
                      </span>
                    </div>
                    <Badge>
                      {solicitacao.nmResponsavel}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <MultiSelectAreas
          selectedAreaIds={formData.idsAreas || []}
          onSelectionChange={handleAreasSelectionChange}
        />
      )}

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
  ), [getSelectedTema, responsaveis, formData.idResponsavel, solicitacao, selectedAreas, formData.idsAreas, handleAreaToggle, handleAreasSelectionChange, formData.flStatus, handleSelectChange, formData.nrPrazo, handleInputChange, formData.tpPrazo]);

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-xl font-semibold">
            {solicitacao ? 'Encaminhar Solicitação' : 'Nova Solicitação'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-6">
              <div className="flex flex-col items-center space-y-2">
                <button
                  type="button"
                  onClick={() => handleStepClick(1)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    currentStep >= 1 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : 'border-gray-300 text-gray-400'
                  } ${currentStep === 1 ? 'ring-2 ring-blue-200' : ''}`}
                >
                  {currentStep > 1 ? <CheckIcon size={20} /> : '1'}
                </button>
                <span className={`text-xs font-medium ${
                  currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  Revisar Solicitação
                </span>
              </div>

              <div className={`w-20 h-1 transition-colors ${
                currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-300'
              }`}></div>

              <div className="flex flex-col items-center space-y-2">
                <button
                  type="button"
                  onClick={() => handleStepClick(2)}
                  disabled={!formData.cdIdentificacao?.trim()}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors disabled:cursor-not-allowed ${
                    currentStep >= 2
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'border-gray-300 text-gray-400'
                  } ${currentStep === 2 ? 'ring-2 ring-blue-200' : ''}`}
                >
                  {currentStep > 2 ? <CheckIcon size={20} /> : '2'}
                </button>
                <span className={`text-xs font-medium ${
                  currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  Alterar Solicitação
                </span>
              </div>
            </div>
          </div>

          <div className="min-h-[400px]">
            {currentStep === 1 ? renderStep1() : renderStep2()}
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
                  type="submit"
                  disabled={loading || !isStep2Valid()}
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
