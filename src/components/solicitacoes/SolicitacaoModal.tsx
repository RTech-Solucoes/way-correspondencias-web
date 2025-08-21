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
import { AreaResponse } from '@/api/areas/types';
import { solicitacoesClient } from '@/api/solicitacoes/client';
import { toast } from 'sonner';
import { capitalize } from '@/utils/utils';
import useModal from '@/context/modal/ModalContext';
import ModalWord from './ModalWord/ModalWord';

interface SolicitacaoModalProps {
  solicitacao: SolicitacaoResponse | null;
  open: boolean;
  onClose(): void;
  onSave(): void;
  responsaveis: ResponsavelResponse[];
  temas: TemaResponse[];
  areas: AreaResponse[];
}

export default function SolicitacaoModal({
  solicitacao,
  open,
  onClose,
  onSave,
  responsaveis,
  temas,
  areas
}: SolicitacaoModalProps) {
  const { setModalContent } = useModal();

  const [formData, setFormData] = useState<SolicitacaoRequest>({
    dsAssunto: '',
    dsCorpo: '',
    flAtivo: 'PENDENTE',
    idResponsavel: 0,
    idTema: 0,
    idArea: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (solicitacao) {
      setFormData({
        dsAssunto: solicitacao.dsAssunto,
        dsCorpo: solicitacao.dsCorpo,
        flAtivo: solicitacao.flAtivo,
        idResponsavel: solicitacao.responsavel.id,
        idTema: solicitacao.tema.id,
        idArea: solicitacao.area.id
      });
    } else {
      setFormData({
        dsAssunto: '',
        dsCorpo: '',
        flAtivo: 'PENDENTE',
        idResponsavel: 0,
        idTema: 0,
        idArea: 0
      });
    }
  }, [solicitacao, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'dsAssunto') {
      processedValue = capitalize(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSelectChange = (field: keyof SolicitacaoRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field.includes('id') ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.dsAssunto.trim() || !formData.dsCorpo.trim() ||
      !formData.idResponsavel || !formData.idTema || !formData.idArea) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      setLoading(true);

      if (solicitacao) {
        await solicitacoesClient.atualizar(solicitacao.id, formData);
        toast.success("Solicitação atualizada com sucesso");
      } else {
        await solicitacoesClient.criar(formData);
        toast.success("Solicitação criada com sucesso");
      }

      onSave();
      onClose();
    } catch {
      toast.error(solicitacao ? "Erro ao atualizar solicitação" : "Erro ao criar solicitação");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const isFormValid = useCallback(() => {
    return formData.dsAssunto.trim() !== '' &&
      formData.dsCorpo.trim() !== '' &&
      formData.idResponsavel > 0 &&
      formData.idTema > 0 &&
      formData.idArea > 0;
  }, [formData]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {solicitacao ? 'Editar Solicitação' : 'Nova Solicitação'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/*<div className='w-full flex justify-end -mb-2'>*/}
          {/*  <Button*/}
          {/*    type="button"*/}
          {/*    onClick={() => setModalContent(<ModalWord />)}*/}
          {/*  >*/}
          {/*    Criar Documento*/}
          {/*  </Button>*/}
          {/*</div>*/}

          <TextField
            label="Assunto *"
            name="dsAssunto"
            value={formData.dsAssunto}
            onChange={handleInputChange}
            placeholder="Digite o assunto da solicitação"
            required
            autoFocus
          />

          <div className="space-y-2">
            <Label htmlFor="dsCorpo">Conteúdo *</Label>
            <Textarea
              id="dsCorpo"
              name="dsCorpo"
              value={formData.dsCorpo}
              onChange={handleInputChange}
              placeholder="Descreva detalhadamente sua solicitação..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável *</Label>
              <Select
                value={formData.idResponsavel.toString()}
                onValueChange={(value) => handleSelectChange('idResponsavel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {responsaveis.map((responsavel) => (
                    <SelectItem key={responsavel.id} value={responsavel.id.toString()}>
                      {responsavel.nmResponsavel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.flAtivo}
                onValueChange={(value) => handleSelectChange('flAtivo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                  <SelectItem value="CONCLUIDA">Concluída</SelectItem>
                  <SelectItem value="CANCELADA">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tema">Tema *</Label>
              <Select
                value={formData.idTema.toString()}
                onValueChange={(value) => handleSelectChange('idTema', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tema" />
                </SelectTrigger>
                <SelectContent>
                  {temas.map((tema) => (
                    <SelectItem key={tema.id} value={tema.id.toString()}>
                      {tema.nmTema}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Área *</Label>
              <Select
                value={formData.idArea.toString()}
                onValueChange={(value) => handleSelectChange('idArea', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a área" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.idArea} value={area.idArea.toString()}>
                      {area.nmArea}
                    </SelectItem>
                  ))}
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
