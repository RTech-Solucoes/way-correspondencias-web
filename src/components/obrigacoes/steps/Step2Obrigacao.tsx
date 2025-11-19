'use client';

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ObrigacaoFormData } from '../ObrigacaoModal';
import { TemaResponse } from '@/api/temas/types';
import { MultiSelectAreas } from '@/components/ui/multi-select-areas';
import temasClient from '@/api/temas/client';

interface Step2ObrigacaoProps {
  formData: ObrigacaoFormData;
  updateFormData: (data: Partial<ObrigacaoFormData>) => void;
  disabled?: boolean;
}

export function Step2Obrigacao({ formData, updateFormData, disabled = false }: Step2ObrigacaoProps) {
  const [temas, setTemas] = useState<TemaResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [areasAtribuidas, setAreasAtribuidas] = useState<number[]>([]);
  const [areasCondicionantes, setAreasCondicionantes] = useState<number[]>([]);
  const [tipoAreaSelecionado, setTipoAreaSelecionado] = useState<'atribuida' | 'condicionante'>('atribuida');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData?.idAreaAtribuida) {
      setAreasAtribuidas([formData.idAreaAtribuida]);
    }
    if (formData?.idsAreasCondicionantes && formData.idsAreasCondicionantes.length > 0) {
      setAreasCondicionantes(formData.idsAreasCondicionantes);
    }
  }, [formData?.idAreaAtribuida, formData?.idsAreasCondicionantes]);

  const loadData = async () => {
    setLoading(true);
    try {
      temasClient.buscarPorFiltro({ size: 1000 }).then((response) => {
        setTemas(response.content);
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAreasChange = (selectedIds: number[]) => {
    if (tipoAreaSelecionado === 'atribuida') {
      const novaAreaAtribuida = selectedIds[0] || null;
      setAreasAtribuidas(selectedIds);
      updateFormData({ idAreaAtribuida: novaAreaAtribuida });
      
      if (novaAreaAtribuida && areasCondicionantes.includes(novaAreaAtribuida)) {
        const novasCondicionantes = areasCondicionantes.filter(id => id !== novaAreaAtribuida);
        setAreasCondicionantes(novasCondicionantes);
        updateFormData({ 
          idsAreasCondicionantes: novasCondicionantes,
        });
      }
    } else {
      const novasCondicionantes = selectedIds.filter(id => id !== formData.idAreaAtribuida);
      setAreasCondicionantes(novasCondicionantes);
      updateFormData({ 
        idsAreasCondicionantes: novasCondicionantes || [],
      });
    }
  };

  const getSelectedAreaIds = () => {
    return tipoAreaSelecionado === 'atribuida' ? areasAtribuidas : areasCondicionantes;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="idTema">Tema*</Label>
        <Select
          value={formData.idTema?.toString() || ''}
          onValueChange={(value) => updateFormData({ idTema: parseInt(value) })}
          disabled={disabled || loading}
        >
          <SelectTrigger id="idTema">
            <SelectValue placeholder={loading ? 'Carregando...' : 'Selecione um tema'} />
          </SelectTrigger>
          <SelectContent>
            {temas.map((tema) => (
              <SelectItem key={tema.idTema} value={tema.idTema.toString()}>
                {tema.nmTema}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2 pt-5">
          <button
            type="button"
            onClick={() => setTipoAreaSelecionado('atribuida')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              tipoAreaSelecionado === 'atribuida'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            disabled={loading}
          >
            Área Atribuída a*
          </button>
          <button
            type="button"
            onClick={() => setTipoAreaSelecionado('condicionante')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              tipoAreaSelecionado === 'condicionante'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            disabled={loading}
          >
            Área Condicionante
          </button>
        </div>
      </div>

      <MultiSelectAreas
        selectedAreaIds={getSelectedAreaIds()}
        onSelectionChange={handleAreasChange}
        label={tipoAreaSelecionado === 'atribuida' ? 'Selecione a Área Atribuída*' : 'Selecione as Áreas Condicionantes'}
        disabled={disabled || loading}
        maxSelection={tipoAreaSelecionado === 'atribuida' ? 1 : undefined}
        excludedAreaIds={tipoAreaSelecionado === 'condicionante' && formData.idAreaAtribuida ? [formData.idAreaAtribuida] : []}
      />
    </div>
  );
}

