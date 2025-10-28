'use client';

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ObrigacaoFormData } from '../ObrigacaoModal';
import { TemaResponse } from '@/api/temas/types';
import { MultiSelectAreas } from '@/components/ui/multi-select-areas';

interface Step2ObrigacaoProps {
  formData: ObrigacaoFormData;
  updateFormData: (data: Partial<ObrigacaoFormData>) => void;
}

export function Step2Obrigacao({ formData, updateFormData }: Step2ObrigacaoProps) {
  const [temas, setTemas] = useState<TemaResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [areasAtribuidas, setAreasAtribuidas] = useState<number[]>([]);
  const [areasCondicionantes, setAreasCondicionantes] = useState<number[]>([]);
  const [tipoAreaSelecionado, setTipoAreaSelecionado] = useState<'atribuida' | 'condicionante'>('atribuida');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      setTemas([
        { idTema: 1, nmTema: 'Tema 1', dsTema: 'Descrição do tema 1', nrPrazo: 0, tpPrazo: '', flAtivo: 'S', areas: [] },
        { idTema: 2, nmTema: 'Tema 2', dsTema: 'Descrição do tema 2', nrPrazo: 0, tpPrazo: '', flAtivo: 'S', areas: [] },
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAreasChange = (selectedIds: number[]) => {
    if (tipoAreaSelecionado === 'atribuida') {
      setAreasAtribuidas(selectedIds);
    } else {
      setAreasCondicionantes(selectedIds);
    }
  };

  const getSelectedAreaIds = () => {
    return tipoAreaSelecionado === 'atribuida' ? areasAtribuidas : areasCondicionantes;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="idTema">Tema</Label>
        <Select
          value={formData.idTema?.toString() || ''}
          onValueChange={(value) => updateFormData({ idTema: parseInt(value) })}
          disabled={loading}
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
        <Label>Atribuído a</Label>
        <div className="flex gap-2">
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
            Área Atribuída a
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
        label={tipoAreaSelecionado === 'atribuida' ? 'Selecione as Áreas Atribuídas' : 'Selecione as Áreas Condicionantes'}
        disabled={loading}
      />
    </div>
  );
}

