'use client';

import { useState, useEffect, FormEvent, useCallback } from 'react';
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

interface SolicitacaoModalProps {
  solicitacao: SolicitacaoResponse | null;
  open: boolean;
  onClose(): void;
  onSave(): void;
  responsaveis: ResponsavelResponse[];
  temas: TemaResponse[];
}

export default function SolicitacaoModal({
  solicitacao,
  open,
  onClose,
  onSave,
  responsaveis,
  temas
}: SolicitacaoModalProps) {
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
    tpPrazo: ''
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
        tpPrazo: solicitacao.tpPrazo || ''
      });
    } else {
      setFormData({
        cdIdentificacao: '',
        dsAssunto: '',
        dsSolicitacao: '',
        dsObservacao: '',
        flStatus: 'P',
        idResponsavel: 0,
        idTema: 0,
        idsAreas: [],
        nrPrazo: undefined,
        tpPrazo: ''
      });
    }
  }, [solicitacao, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
  };

  const handleAreasSelectionChange = (selectedIds: number[]) => {
    setFormData(prev => ({
      ...prev,
      idsAreas: selectedIds
    }));
  };

  const handleSelectChange = (field: keyof SolicitacaoRequest, value: string) => {
    let processedValue: string | number | undefined = value;

    if (field.includes('id') && field !== 'cdIdentificacao') {
      processedValue = value ? parseInt(value) : 0;
    }

    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.cdIdentificacao?.trim()) {
      toast.error("Código de identificação é obrigatório");
      return;
    }

    if (!formData.idResponsavel || formData.idResponsavel === 0) {
      toast.error("Responsável é obrigatório");
      return;
    }

    if (!formData.idTema || formData.idTema === 0) {
      toast.error("Tema é obrigatório");
      return;
    }

    try {
      setLoading(true);

      const requestData: SolicitacaoRequest = {
        ...formData,
        dsAssunto: formData.dsAssunto?.trim() || undefined,
        dsSolicitacao: formData.dsSolicitacao?.trim() || undefined,
        dsObservacao: formData.dsObservacao?.trim() || undefined,
        nrPrazo: formData.nrPrazo && formData.nrPrazo > 0 ? formData.nrPrazo : undefined,
        tpPrazo: formData.tpPrazo?.trim() || undefined,
      };

      if (solicitacao) {
        await solicitacoesClient.atualizar(solicitacao.idSolicitacao, requestData);
        toast.success("Solicitação atualizada com sucesso");
      } else {
        await solicitacoesClient.criar(requestData);
        toast.success("Solicitação criada com sucesso");
      }

      onSave();
      onClose();
    } catch (error: unknown) {
      console.error('Erro ao salvar solicitação:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(solicitacao ? `Erro ao atualizar solicitação: ${errorMessage}` : `Erro ao criar solicitação: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const isFormValid = useCallback(() => {
    return formData.cdIdentificacao?.trim() !== '' &&
      formData.idResponsavel > 0 &&
      formData.idTema > 0;
  }, [formData]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {solicitacao ? 'Editar Solicitação' : 'Nova Solicitação'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto">
          <div className="flex gap-2 w-full">
            <TextField
              label="Código de Identificação *"
              name="cdIdentificacao"
              value={formData.cdIdentificacao}
              onChange={handleInputChange}
              placeholder="Digite o código de identificação (máx. 50 caracteres)"
              required
              autoFocus
              maxLength={50}
              className="w-full"
            />

            <TextField
              label="Assunto"
              name="dsAssunto"
              value={formData.dsAssunto}
              onChange={handleInputChange}
              placeholder="Digite o assunto da solicitação (máx. 500 caracteres)"
              maxLength={500}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <div className="w-full space-y-2">
              <Label htmlFor="dsSolicitacao">Descrição da Solicitação</Label>
              <Textarea
                id="dsSolicitacao"
                name="dsSolicitacao"
                value={formData.dsSolicitacao}
                onChange={handleInputChange}
                placeholder="Descreva detalhadamente sua solicitação (máx. 10000 caracteres)..."
                rows={4}
                maxLength={10000}
                className="w-full"
              />
            </div>

            <div className="w-full space-y-2">
              <Label htmlFor="dsObservacao">Observações</Label>
              <Textarea
                id="dsObservacao"
                name="dsObservacao"
                value={formData.dsObservacao}
                onChange={handleInputChange}
                placeholder="Observações adicionais (máx. 10000 caracteres)..."
                rows={3}
                maxLength={10000}
                className="w-full"
              />
            </div>
          </div>


          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável *</Label>
              <Select
                value={formData.idResponsavel ? formData.idResponsavel.toString() : ''}
                onValueChange={(value) => handleSelectChange('idResponsavel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {responsaveis.map((responsavel) => (
                    <SelectItem key={responsavel.idResponsavel} value={responsavel.idResponsavel.toString()}>
                      {responsavel.nmResponsavel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tema">Tema *</Label>
              <Select
                value={formData.idTema ? formData.idTema.toString() : ''}
                onValueChange={(value) => handleSelectChange('idTema', value)}
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

          <MultiSelectAreas
            selectedAreaIds={formData.idsAreas || []}
            onSelectionChange={handleAreasSelectionChange}
          />

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
              <Label htmlFor="nrPrazo">Número do Prazo</Label>
              <TextField
                id="nrPrazo"
                name="nrPrazo"
                type="number"
                value={formData.nrPrazo && formData.nrPrazo > 0 ? formData.nrPrazo.toString() : ''}
                onChange={handleInputChange}
                placeholder="Dias"
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

          <DialogFooter className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !isFormValid()}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : solicitacao ? 'Salvar Alterações' : 'Criar Solicitação'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
