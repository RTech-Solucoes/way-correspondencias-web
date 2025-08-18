'use client';

import {useState, useEffect, FormEvent} from 'react';
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { SolicitacaoResponse, SolicitacaoRequest } from '@/api/solicitacoes/types';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { TemaResponse } from '@/api/temas/types';
import { AreaResponse } from '@/api/areas/types';
import { solicitacoesClient } from '@/api/solicitacoes/client';
import { useToast } from '@/hooks/use-toast';

interface SolicitacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  solicitacao: SolicitacaoResponse | null;
  responsaveis: ResponsavelResponse[];
  temas: TemaResponse[];
  areas: AreaResponse[];
  onSave: () => void;
}

export default function SolicitacaoModal({
  open,
  onOpenChange,
  solicitacao,
  responsaveis,
  temas,
  areas,
  onSave
}: SolicitacaoModalProps) {
  const [formData, setFormData] = useState<SolicitacaoRequest>({
    dsAssunto: '',
    txConteudo: '',
    flStatus: 'PENDENTE',
    dtPrazoResposta: '',
    txResposta: '',
    idResponsavel: 0,
    idTema: 0,
    idArea: 0,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (solicitacao) {
      setFormData({
        dsAssunto: solicitacao.dsAssunto,
        txConteudo: solicitacao.txConteudo,
        flStatus: solicitacao.flStatus,
        dtPrazoResposta: solicitacao.dtPrazoResposta || '',
        txResposta: solicitacao.txResposta || '',
        idResponsavel: solicitacao.responsavel.id,
        idTema: solicitacao.tema.id,
        idArea: solicitacao.area.id,
      });
    } else {
      setFormData({
        dsAssunto: '',
        txConteudo: '',
        flStatus: 'PENDENTE',
        dtPrazoResposta: '',
        txResposta: '',
        idResponsavel: 0,
        idTema: 0,
        idArea: 0,
      });
    }
  }, [solicitacao, open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (solicitacao) {
        await solicitacoesClient.atualizar(solicitacao.id, formData);
        toast({
          title: "Sucesso",
          description: "Solicitação atualizada com sucesso",
        });
      } else {
        await solicitacoesClient.criar(formData);
        toast({
          title: "Sucesso",
          description: "Solicitação criada com sucesso",
        });
      }
      onSave();
    } catch (error) {
      toast({
        title: "Erro",
        description: `Erro ao ${solicitacao ? 'atualizar' : 'criar'} solicitação`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {solicitacao ? 'Editar Solicitação' : 'Nova Solicitação'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dsAssunto">Assunto</Label>
              <Input
                id="dsAssunto"
                value={formData.dsAssunto}
                onChange={(e) => setFormData({...formData, dsAssunto: e.target.value})}
                placeholder="Assunto da solicitação"
                required
              />
            </div>
            <div>
              <Label htmlFor="flStatus">Status</Label>
              <Select
                value={formData.flStatus}
                onValueChange={(value) => setFormData({...formData, flStatus: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                  <SelectItem value="CONCLUIDA">Concluída</SelectItem>
                  <SelectItem value="CANCELADA">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="txConteudo">Conteúdo</Label>
            <Textarea
              id="txConteudo"
              value={formData.txConteudo}
              onChange={(e) => setFormData({...formData, txConteudo: e.target.value})}
              placeholder="Descreva o conteúdo da solicitação"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="idResponsavel">Responsável</Label>
              <Select
                value={formData.idResponsavel.toString()}
                onValueChange={(value) => setFormData({...formData, idResponsavel: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {responsaveis.map((resp) => (
                    <SelectItem key={resp.id} value={resp.id.toString()}>
                      {resp.nmResponsavel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="idTema">Tema</Label>
              <Select
                value={formData.idTema.toString()}
                onValueChange={(value) => setFormData({...formData, idTema: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tema" />
                </SelectTrigger>
                <SelectContent>
                  {temas.map((tema) => (
                    <SelectItem key={tema.id} value={tema.id.toString()}>
                      {tema.nmTema}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="idArea">Área</Label>
              <Select
                value={formData.idArea.toString()}
                onValueChange={(value) => setFormData({...formData, idArea: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a área" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.idArea} value={area.idArea.toString()}>
                      {area.nmArea}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dtPrazoResposta">Prazo de Resposta</Label>
              <Input
                id="dtPrazoResposta"
                type="datetime-local"
                value={formData.dtPrazoResposta}
                onChange={(e) => setFormData({...formData, dtPrazoResposta: e.target.value})}
              />
            </div>
          </div>

          {formData.flStatus !== 'PENDENTE' && (
            <div>
              <Label htmlFor="txResposta">Resposta</Label>
              <Textarea
                id="txResposta"
                value={formData.txResposta}
                onChange={(e) => setFormData({...formData, txResposta: e.target.value})}
                placeholder="Resposta da solicitação"
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : (solicitacao ? 'Atualizar' : 'Criar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
