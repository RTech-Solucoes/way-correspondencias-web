'use client';

import {useState, useEffect, ChangeEvent, FormEvent, useCallback} from 'react';
import {
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { ResponsavelResponse, ResponsavelRequest } from '@/api/responsaveis/types';
import { responsaveisClient } from '@/api/responsaveis/client';
import { toast } from 'sonner';

interface ResponsavelModalProps {
  responsavel: ResponsavelResponse | null;
  open: boolean;
  onClose(): void;
  onSave(): void;
}

export default function ResponsavelModal({ responsavel, open, onClose, onSave }: ResponsavelModalProps) {
  const [formData, setFormData] = useState<ResponsavelRequest>({
    nmUsuario: '',
    dsEmail: '',
    nmResponsavel: '',
    flAtivo: true,
    idArea: undefined
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (responsavel) {
      setFormData({
        nmUsuario: responsavel.nmUsuario,
        dsEmail: responsavel.dsEmail,
        nmResponsavel: responsavel.nmResponsavel,
        flAtivo: responsavel.flAtivo,
        idArea: responsavel.area?.id
      });
    } else {
      setFormData({
        nmUsuario: '',
        dsEmail: '',
        nmResponsavel: '',
        flAtivo: true,
        idArea: undefined
      });
    }
  }, [responsavel, open]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.nmResponsavel.trim() || !formData.dsEmail.trim() || !formData.nmUsuario.trim()) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      setLoading(true);

      if (responsavel) {
        await responsaveisClient.atualizar(responsavel.id, formData);
        toast.success("Responsável atualizado com sucesso");
      } else {
        await responsaveisClient.criar(formData);
        toast.success("Responsável criado com sucesso");
      }

      onSave();
      onClose();
    } catch (error) {
      toast.error(responsavel ? "Erro ao atualizar responsável" : "Erro ao criar responsável");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const isFormValid = useCallback(() => {
    return formData.nmResponsavel.trim() !== '' &&
           formData.dsEmail.trim() !== '' &&
           formData.nmUsuario.trim() !== '';
  }, [formData]);

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !newOpen && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {responsavel ? 'Editar Responsável' : 'Novo Responsável'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <TextField
            label="Nome *"
            name="nmResponsavel"
            value={formData.nmResponsavel}
            onChange={handleChange}
            required
            autoFocus
          />

          <TextField
            label="Usuário *"
            name="nmUsuario"
            value={formData.nmUsuario}
            onChange={handleChange}
            required
          />

          <TextField
            label="Email *"
            name="dsEmail"
            type="email"
            value={formData.dsEmail}
            onChange={handleChange}
            required
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="flAtivo"
              name="flAtivo"
              checked={formData.flAtivo}
              onChange={handleChange}
              className="rounded"
            />
            <label htmlFor="flAtivo" className="text-sm font-medium">
              Ativo
            </label>
          </div>

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !isFormValid()}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : responsavel ? 'Salvar Alterações' : 'Criar Responsável'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
