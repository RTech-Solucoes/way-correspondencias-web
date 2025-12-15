'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelectAreas } from '@/components/ui/multi-select-areas';
import { TramitacaoFormData } from '../TramitacaoObrigacaoModal';
import temasClient from '@/api/temas/client';
import { TemaResponse } from '@/api/temas/types';

interface Step2TemasAreasProps {
  formData: TramitacaoFormData;
  updateFormData: (data: Partial<TramitacaoFormData>) => void;
}

export function Step2TemasAreas({ formData, updateFormData }: Step2TemasAreasProps) {
  const [temas, setTemas] = useState<TemaResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregarTemas = async () => {
      setLoading(true);
      try {
        const response = await temasClient.buscarPorFiltro({ size: 1000 });
        setTemas(response.content || []);
      } catch (error) {
        console.error('Erro ao carregar temas:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarTemas();
  }, []);

  const handleAreasChange = (selectedIds: number[]) => {
    updateFormData({ idsAreas: selectedIds });
  };

  return (
    <div className="space-y-6">
      
    </div>
    );
}

