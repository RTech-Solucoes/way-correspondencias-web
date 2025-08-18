'use client';

import {useState, useEffect, ChangeEvent, FormEvent} from 'react';
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
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

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
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      if (responsavel) {
        await responsaveisClient.atualizar(responsavel.id, formData);
        toast({
          title: "Sucesso",
          description: "Responsável atualizado com sucesso",
        });
      } else {
        await responsaveisClient.criar(formData);
        toast({
          title: "Sucesso",
          description: "Responsável criado com sucesso",
        });
      }

      onSave();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: responsavel ? "Erro ao atualizar responsável" : "Erro ao criar responsável",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

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
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : responsavel ? 'Salvar Alterações' : 'Criar Responsável'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
