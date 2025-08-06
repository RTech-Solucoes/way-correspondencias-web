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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tema, TipoContagem } from '@/lib/types';
import { mockAreas } from '@/lib/mockData';
import { v4 as uuidv4 } from 'uuid';

interface TemaModalProps {
  tema: Tema | null;
  onClose: () => void;
  onSave: (tema: Tema) => void;
}

export default function TemaModal({ tema, onClose, onSave }: TemaModalProps) {
  const [formData, setFormData] = useState<Tema>({
    id_tema: '',
    nm_tema: 0,
    ds_tema: '',
    id_area: '',
    nr_dias_prazo: 0,
    tp_contagem: TipoContagem.UTEIS,
    dt_cadastro: '',
    nr_cpf_cadastro: '',
    vs_versao: 1,
    dt_alteracao: '',
    nr_cpf_alteracao: ''
  });

  useEffect(() => {
    if (tema) {
      setFormData(tema);
    } else {
      // Initialize with default values for new tema
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        id_tema: uuidv4(),
        nm_tema: 0,
        ds_tema: '',
        id_area: mockAreas.length > 0 ? mockAreas[0].id_area : '',
        nr_dias_prazo: 0,
        tp_contagem: TipoContagem.UTEIS,
        dt_cadastro: today,
        nr_cpf_cadastro: '12345678901', // Mock CPF
        vs_versao: 1,
        dt_alteracao: today,
        nr_cpf_alteracao: '12345678901' // Mock CPF
      });
    }
  }, [tema]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'nm_tema' || name === 'nr_dias_prazo' ? Number(value) : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update modification date if editing
    if (tema) {
      const today = new Date().toISOString().split('T')[0];
      formData.dt_alteracao = today;
      formData.vs_versao += 1;
    }
    
    onSave(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {tema ? 'Editar Tema' : 'Novo Tema'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nm_tema">Número</Label>
              <Input
                id="nm_tema"
                name="nm_tema"
                type="number"
                value={formData.nm_tema}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="id_area">Área</Label>
              <Select
                value={formData.id_area}
                onValueChange={(value) => handleSelectChange('id_area', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma área" />
                </SelectTrigger>
                <SelectContent>
                  {mockAreas.map((area) => (
                    <SelectItem key={area.id_area} value={area.id_area}>
                      {area.nm_area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ds_tema">Descrição</Label>
            <Textarea
              id="ds_tema"
              name="ds_tema"
              value={formData.ds_tema}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nr_dias_prazo">Prazo (dias)</Label>
              <Input
                id="nr_dias_prazo"
                name="nr_dias_prazo"
                type="number"
                value={formData.nr_dias_prazo}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tp_contagem">Tipo de Contagem</Label>
              <Select
                value={formData.tp_contagem}
                onValueChange={(value) => handleSelectChange('tp_contagem', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TipoContagem.UTEIS}>ÚTEIS</SelectItem>
                  <SelectItem value={TipoContagem.CORRIDOS}>CORRIDOS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {tema && (
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
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {tema ? 'Salvar Alterações' : 'Criar Tema'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}