'use client';

import {useCallback, useEffect, useState} from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {TemaRequest, TemaResponse} from '@/api/temas/types';
import tiposClient from '@/api/tipos/client';
import { CategoriaEnum, TipoResponse } from '@/api/tipos/types';

interface TemaModalProps {
  tema: TemaResponse | null;
  open: boolean;
  onClose(): void;
  onSave(data: TemaRequest): void;
}

export function TemaModal({tema, open, onClose, onSave}: TemaModalProps) {
  const [nmTema, setNmTema] = useState('');
  const [dsTema, setDsTema] = useState('');
  const [nrPrazo, setNrPrazo] = useState(0);
  const [idTipoCriticidade, setIdTipoCriticidade] = useState<number | null>(null);
  const [criticidades, setCriticidades] = useState<TipoResponse[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelado = false;

    const carregarCriticidades = async () => {
      setLoadingTipos(true);
      try {
        const tipos = await tiposClient.buscarPorCategorias([CategoriaEnum.OBRIG_CRITICIDADE]);
        if (!cancelado) {
          setCriticidades(tipos.filter((tipo) => tipo.nmCategoria === CategoriaEnum.OBRIG_CRITICIDADE));
        }
      } catch (error) {
        console.error('Erro ao carregar criticidades:', error);
      } finally {
        if (!cancelado) {
          setLoadingTipos(false);
        }
      }
    };

    carregarCriticidades();

    return () => {
      cancelado = true;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      if (tema) {
        setNmTema(tema.nmTema);
        setDsTema(tema.dsTema || '');
        setNrPrazo(tema.nrPrazo || 0);
        setIdTipoCriticidade(tema.idTipoCriticidade ?? tema.tipoCriticidade?.idTipo ?? null);
      } else {
        setNmTema('');
        setDsTema('');
        setNrPrazo(0);
        setIdTipoCriticidade(null);
      }
    }
  }, [open, tema]);

  const isFormValid = useCallback(() => {
    return nmTema.trim() !== '' && dsTema.trim() !== '' && idTipoCriticidade !== null;
  }, [nmTema, dsTema, idTipoCriticidade]);

  const handleSave = () => {
    if (!isFormValid() || idTipoCriticidade === null) return;

    const temaRequest: TemaRequest = {
      nmTema: nmTema.trim(),
      dsTema: dsTema.trim(),
      nrPrazo: nrPrazo > 0 ? nrPrazo : undefined,
      tpPrazo: 'H',
      idTipoCriticidade,
    };

    onSave(temaRequest);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {tema ? 'Editar Tema' : 'Novo Tema'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nmTema">Nome do Tema *</Label>
              <Input
                id="nmTema"
                value={nmTema}
                onChange={(e) => setNmTema(e.target.value)}
                placeholder="Digite o nome do tema"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idTipoCriticidade">
              Criticidade *
            </Label>
            <Select
              value={idTipoCriticidade?.toString() || ''}
              onValueChange={(value) => setIdTipoCriticidade(parseInt(value, 10))}
              disabled={loadingTipos}
            >
              <SelectTrigger id="idTipoCriticidade">
                <SelectValue placeholder={loadingTipos ? 'Carregando...' : 'Selecione'} />
              </SelectTrigger>
              <SelectContent>
                {criticidades.map((tipo) => (
                  <SelectItem key={tipo.idTipo} value={tipo.idTipo.toString()}>
                    {tipo.dsTipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dsTema">Descrição *</Label>
            <Textarea
              id="dsTema"
              value={dsTema}
              onChange={(e) => setDsTema(e.target.value)}
              placeholder="Digite a descrição do tema"
              rows={3}
            />
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFormValid() || loading}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {tema ? 'Salvar Alterações' : 'Criar Tema'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}