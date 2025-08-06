'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Responsavel } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

interface ResponsavelModalProps {
  responsavel: Responsavel | null;
  onClose: () => void;
  onSave: (responsavel: Responsavel) => void;
}

export default function ResponsavelModal({ responsavel, onClose, onSave }: ResponsavelModalProps) {
  const [formData, setFormData] = useState<Responsavel>({
    id_responsavel: '',
    ds_nome: '',
    ds_email: '',
    nm_telefone: ''
  });

  useEffect(() => {
    if (responsavel) {
      setFormData(responsavel);
    } else {
      // Initialize with default values for new responsavel
      setFormData({
        id_responsavel: uuidv4(),
        ds_nome: '',
        ds_email: '',
        nm_telefone: ''
      });
    }
  }, [responsavel]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {responsavel ? 'Editar Responsável' : 'Novo Responsável'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ds_nome">Nome</Label>
            <Input
              id="ds_nome"
              name="ds_nome"
              value={formData.ds_nome}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ds_email">Email</Label>
            <Input
              id="ds_email"
              name="ds_email"
              type="email"
              value={formData.ds_email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nm_telefone">Telefone</Label>
            <Input
              id="nm_telefone"
              name="nm_telefone"
              type="tel"
              value={formData.nm_telefone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {responsavel ? 'Salvar Alterações' : 'Criar Responsável'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
