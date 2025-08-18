'use client';

import React, {useState, useEffect, useCallback} from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {AreaResponse, AreaRequest} from '@/api/areas/types';
import areasClient from '@/api/areas/client';
import {SpinnerIcon, WarningCircleIcon, WarningIcon} from "@phosphor-icons/react";

interface AreaModalProps {
  area: AreaResponse | null;

  onClose(): void;

  onSave(area: AreaRequest): void;
}

export default function AreaModal({area, onClose, onSave}: AreaModalProps) {
  const [formData, setFormData] = useState<AreaRequest>({
    cdArea: '',
    nmArea: '',
    dsArea: '',
    flAtivo: 'S'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [codeExistsWarning, setCodeExistsWarning] = useState<string>('');
  const [isCheckingCdArea, setIsCheckingCdArea] = useState(false);
  const [hasValidationError, setHasValidationError] = useState(false);

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

  const checkCodeExists = useCallback(async (cdArea: string) => {
    if (!cdArea.trim()) {
      setCodeExistsWarning('');
      setHasValidationError(false);
      return;
    }

    // Don't check if we're editing and the code is the same as the original
    if (area && area.cdArea === cdArea) {
      setCodeExistsWarning('');
      setHasValidationError(false);
      return;
    }

    setIsCheckingCdArea(true);
    try {
      const existingArea = await areasClient.buscarPorCdArea(cdArea);
      if (existingArea) {
        setCodeExistsWarning('Já existe uma área com este código');
        setHasValidationError(true);
      } else {
        setCodeExistsWarning('');
        setHasValidationError(false);
      }
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      setCodeExistsWarning('');
      setHasValidationError(false);
    } finally {
      setIsCheckingCdArea(false);
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
    return Object.keys(newErrors).length === 0 && !hasValidationError;
  };

  const handleSubmit = (e: FormEvent) => {
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

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Clear code warning when user starts typing
    if (field === 'cdArea') {
      setCodeExistsWarning('');
      setHasValidationError(false);
    }
  };

  const handleCodeBlur = () => {
    if (formData.cdArea.trim()) {
      checkCodeExists(formData.cdArea.trim());
    }
  };

  const isSubmitDisabled = hasValidationError || isCheckingCdArea || Object.keys(errors).length > 0;

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
            <div className="flex items-center relative">
              <Input
                id="cdArea"
                value={formData.cdArea}
                onChange={(e) => handleChange('cdArea', e.target.value)}
                onBlur={handleCodeBlur}
                placeholder="Digite o código da área"
                className={errors.cdArea || codeExistsWarning ? 'border-red-500' : ''}
                disabled={isCheckingCdArea}
              />
              {isCheckingCdArea && (
                <SpinnerIcon className="absolute right-4 h-4 w-4 text-blue-500 animate-spin" />
              )}
            </div>
            {errors.cdArea && (
              <div className="flex items-center gap-1 mt-1">
                <WarningCircleIcon className="h-4 w-4 text-red-500"/>
                <p className="text-red-500 text-sm">{errors.cdArea}</p>
              </div>
            )}
            {codeExistsWarning && (
              <div className="flex items-center gap-1 mt-1">
                <WarningIcon className="h-4 w-4 text-yellow-500"/>
                <p className="text-yellow-600 text-sm">{codeExistsWarning}</p>
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
              <div className="flex items-center gap-1 mt-1">
                <WarningCircleIcon className="h-4 w-4 text-red-500"/>
                <p className="text-red-500 text-sm">{errors.dsArea}</p>
              </div>
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
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
