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
  onClose(): void;
  onSave(area: Area): void;
}

export default function AreaModal({ area, onClose, onSave }: AreaModalProps) {
  const [formData, setFormData] = useState<Area>({
    idArea: '',
    cdArea: 0,
    nmArea: '',
    dsArea: '',
    dtCadastro: '',
    nrCpfCadastro: '',
    vsVersao: 1,
    dtAlteracao: '',
    nrCpfAlteracao: ''
  });

  useEffect(() => {
    if (area) {
      setFormData(area);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        idArea: uuidv4(),
        cdArea: 0,
        nmArea: '',
        dsArea: '',
        dtCadastro: today,
        nrCpfCadastro: '12345678901',
        vsVersao: 1,
        dtAlteracao: today,
        nrCpfAlteracao: '12345678901'
      });
    }
  }, [area]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cdArea' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (area) {
      const today = new Date().toISOString().split('T')[0];
      formData.dtAlteracao = today;
      formData.vsVersao += 1;
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
              <Label htmlFor="cdArea">Código</Label>
              <Input
                id="cdArea"
                name="cdArea"
                type="number"
                value={formData.cdArea}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nmArea">Nome</Label>
              <Input
                id="nmArea"
                name="nmArea"
                value={formData.nmArea}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dsArea">Descrição</Label>
            <Textarea
              id="dsArea"
              name="dsArea"
              value={formData.dsArea}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>
          
          {area && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Data de Cadastro</Label>
                <p className="text-sm">{new Date(formData.dtCadastro).toLocaleDateString('pt-BR')}</p>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Última Alteração</Label>
                <p className="text-sm">{new Date(formData.dtAlteracao).toLocaleDateString('pt-BR')}</p>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Versão</Label>
                <p className="text-sm">{formData.vsVersao}</p>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">CPF Cadastro</Label>
                <p className="text-sm">{formData.nrCpfCadastro}</p>
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