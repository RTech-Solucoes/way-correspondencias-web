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
import { Textarea } from '@/components/ui/textarea';
import { Area } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

interface AreaModalProps {
  area: Area | null;
  onClose: () => void;
  onSave: (area: Area) => void;
}

export default function AreaModal({ area, onClose, onSave }: AreaModalProps) {
  const [formData, setFormData] = useState<Area>({
    id_area: '',
    cd_area: 0,
    nm_area: '',
    ds_area: '',
    dt_cadastro: '',
    nr_cpf_cadastro: '',
    vs_versao: 1,
    dt_alteracao: '',
    nr_cpf_alteracao: ''
  });

  useEffect(() => {
    if (area) {
      setFormData(area);
    } else {
      // Initialize with default values for new area
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        id_area: uuidv4(),
        cd_area: 0,
        nm_area: '',
        ds_area: '',
        dt_cadastro: today,
        nr_cpf_cadastro: '12345678901', // Mock CPF
        vs_versao: 1,
        dt_alteracao: today,
        nr_cpf_alteracao: '12345678901' // Mock CPF
      });
    }
  }, [area]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cd_area' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update modification date if editing
    if (area) {
      const today = new Date().toISOString().split('T')[0];
      formData.dt_alteracao = today;
      formData.vs_versao += 1;
    }
    
    onSave(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {area ? 'Editar Área' : 'Nova Área'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cd_area">Código</Label>
              <Input
                id="cd_area"
                name="cd_area"
                type="number"
                value={formData.cd_area}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nm_area">Nome</Label>
              <Input
                id="nm_area"
                name="nm_area"
                value={formData.nm_area}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ds_area">Descrição</Label>
            <Textarea
              id="ds_area"
              name="ds_area"
              value={formData.ds_area}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>
          
          {area && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Data de Cadastro</Label>
                <p className="text-sm">{new Date(formData.dt_cadastro).toLocaleDateString('pt-BR')}</p>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Última Alteração</Label>
                <p className="text-sm">{new Date(formData.dt_alteracao).toLocaleDateString('pt-BR')}</p>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Versão</Label>
                <p className="text-sm">{formData.vs_versao}</p>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">CPF Cadastro</Label>
                <p className="text-sm">{formData.nr_cpf_cadastro}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {area ? 'Salvar Alterações' : 'Criar Área'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}