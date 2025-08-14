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
import { AreaResponse, AreaRequest } from '@/api/areas/types';

interface AreaModalProps {
  area: AreaResponse | null;
  onClose(): void;
  onSave(area: AreaRequest): void;
}

export default function AreaModal({ area, onClose, onSave }: AreaModalProps) {
  const [formData, setFormData] = useState<AreaRequest>({
    cdArea: '',
    nmArea: '',
    dsArea: '',
    flAtivo: 'S'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (area) {
      setFormData({
        cdArea: area.cdArea,
        nmArea: area.nmArea,
        dsArea: area.dsArea,
        flAtivo: area.flAtivo
      });
    } else {
      setFormData({
        cdArea: '',
        nmArea: '',
        dsArea: '',
        flAtivo: 'S'
      });
    }
  }, [area]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cdArea.trim()) {
      newErrors.cdArea = 'Código é obrigatório';
    }

    if (!formData.nmArea.trim()) {
      newErrors.nmArea = 'Nome é obrigatório';
    }

    if (!formData.dsArea.trim()) {
      newErrors.dsArea = 'Descrição é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (field: keyof AreaRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {area ? 'Editar Área' : 'Nova Área'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cdArea">Código *</Label>
            <Input
              id="cdArea"
              value={formData.cdArea}
              onChange={(e) => handleChange('cdArea', e.target.value)}
              placeholder="Digite o código da área"
              className={errors.cdArea ? 'border-red-500' : ''}
            />
            {errors.cdArea && (
              <p className="text-red-500 text-sm mt-1">{errors.cdArea}</p>
            )}
          </div>

          <div>
            <Label htmlFor="nmArea">Nome *</Label>
            <Input
              id="nmArea"
              value={formData.nmArea}
              onChange={(e) => handleChange('nmArea', e.target.value)}
              placeholder="Digite o nome da área"
              className={errors.nmArea ? 'border-red-500' : ''}
            />
            {errors.nmArea && (
              <p className="text-red-500 text-sm mt-1">{errors.nmArea}</p>
            )}
          </div>

          <div>
            <Label htmlFor="dsArea">Descrição *</Label>
            <Textarea
              id="dsArea"
              value={formData.dsArea}
              onChange={(e) => handleChange('dsArea', e.target.value)}
              placeholder="Digite a descrição da área"
              className={errors.dsArea ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.dsArea && (
              <p className="text-red-500 text-sm mt-1">{errors.dsArea}</p>
            )}
          </div>

          <div>
            <Label htmlFor="flAtivo">Status *</Label>
            <select
              id="flAtivo"
              value={formData.flAtivo}
              onChange={(e) => handleChange('flAtivo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="S">Ativo</option>
              <option value="N">Inativo</option>
            </select>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {area ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
