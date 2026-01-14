'use client';

import React, {FormEvent, useCallback, useEffect, useState} from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {AreaRequest, AreaResponse} from '@/api/areas/types';
import {WarningCircleIcon} from "@phosphor-icons/react";

interface AreaModalProps {
  area: AreaResponse | null;
  open: boolean;
  onClose(): void;
  onSave(area: AreaRequest): void;
}

export default function AreaModal({area, open, onClose, onSave}: AreaModalProps) {
  const [formData, setFormData] = useState<AreaRequest>({
    cdArea: '',
    nmArea: '',
    dsArea: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasValidationError, setHasValidationError] = useState(false);

  useEffect(() => {
    if (open) {
      if (area) {
        setFormData({
          cdArea: area.cdArea,
          nmArea: area.nmArea,
          dsArea: area.dsArea
        });
      } else {
        setFormData({
          cdArea: '',
          nmArea: '',
          dsArea: ''
        });
      }
      setErrors({});
      setHasValidationError(false);
    }
  }, [area, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cdArea.trim()) {
      newErrors.cdArea = 'Código é obrigatório';
    }

    if (!formData.nmArea.trim()) {
      newErrors.nmArea = 'Nome é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0 && !hasValidationError;
  };

  const isFormValid = useCallback(() => {
    const requiredFields = ['cdArea', 'nmArea'];
    const allFieldsFilled = requiredFields.every(field =>
      formData[field as keyof AreaRequest]?.toString().trim() !== ''
    );

    return allFieldsFilled && !hasValidationError ;
  }, [formData, hasValidationError]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (field: keyof AreaRequest, value: string) => {
    // Converte para maiúsculas se for cdArea ou nmArea
    const processedValue = (field === 'cdArea' || field === 'nmArea') 
      ? value.toUpperCase() 
      : value;

    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

  };

  const isSubmitDisabled = !isFormValid();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {area ? 'Editar Área' : 'Nova Área'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cdArea">Código *</Label>
            <div className="flex items-center relative">
              <Input
                id="cdArea"
                value={formData.cdArea}
                onChange={(e) => handleChange('cdArea', e.target.value)}
                placeholder="Digite o código da área"
              />
            </div>
            {errors.cdArea && (
              <div className="flex items-center gap-1 mt-1">
                <WarningCircleIcon className="h-4 w-4 text-red-500"/>
                <p className="text-red-500 text-sm">{errors.cdArea}</p>
              </div>
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
              <div className="flex items-center gap-1 mt-1">
                <WarningCircleIcon className="h-4 w-4 text-red-500"/>
                <p className="text-red-500 text-sm">{errors.nmArea}</p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="dsArea">Descrição</Label>
            <Textarea
              id="dsArea"
              value={formData.dsArea}
              onChange={(e) => handleChange('dsArea', e.target.value)}
              placeholder="Digite a descrição da área"
              className={errors.dsArea ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.dsArea && (
              <div className="flex items-center gap-1 mt-1">
                <WarningCircleIcon className="h-4 w-4 text-red-500"/>
                <p className="text-red-500 text-sm">{errors.dsArea}</p>
              </div>
            )}
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
              className="bg-primary hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitDisabled}
            >
              {area ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
