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
import { Responsavel } from '@/types/responsaveis/types';
import { v4 as uuidv4 } from 'uuid';

interface ResponsavelModalProps {
  responsavel: Responsavel | null;
  onClose(): void;
  onSave(responsavel: Responsavel): void;
}

export default function ResponsavelModal({ responsavel, onClose, onSave }: ResponsavelModalProps) {
  const [formData, setFormData] = useState<Responsavel>({
    idResponsavel: '',
    dsNome: '',
    dsEmail: '',
    nmTelefone: '',
    dsPerfil: ''
  });

  useEffect(() => {
    if (responsavel) {
      setFormData(responsavel);
    } else {
      setFormData({
        idResponsavel: uuidv4(),
        dsNome: '',
        dsEmail: '',
        nmTelefone: '',
        dsPerfil: ''
      });
    }
  }, [responsavel]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: FormEvent) => {
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
            <Label htmlFor="dsNome">Nome</Label>
            <Input
              id="dsNome"
              name="dsNome"
              value={formData.dsNome}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dsEmail">Email</Label>
            <Input
              id="dsEmail"
              name="dsEmail"
              type="email"
              value={formData.dsEmail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nmTelefone">Telefone</Label>
            <Input
              id="nmTelefone"
              name="nmTelefone"
              type="tel"
              value={formData.nmTelefone}
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
