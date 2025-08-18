'use client';

import {useState, useEffect, FormEvent, ChangeEvent} from 'react';
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
import { Solicitacao } from '@/types/solicitacoes/types';
import { mockResponsaveis } from '@/lib/mockData';
import { v4 as uuidv4 } from 'uuid';
import { XIcon, PlusIcon, PaperclipIcon } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';

const mockSolicitantes = [
  { id: '1', nome: 'Ana Silva' },
  { id: '2', nome: 'Bruno Costa' },
  { id: '3', nome: 'Carla Mendes' },
  { id: '4', nome: 'Daniel Oliveira' },
  { id: '5', nome: 'Eduarda Santos' }
];

interface SolicitacaoModalProps {
  solicitacao: Solicitacao | null;
  onClose(): void;
  onSave(solicitacao: Solicitacao): void;
}

export default function SolicitacaoModal({ solicitacao, onClose, onSave }: SolicitacaoModalProps) {
  const [formData, setFormData] = useState<Solicitacao>({
    idSolicitacao: '',
    cdSolicitante: [],
    dsAssunto: '',
    cdIdentificacao: '',
    dsDescricao: '',
    dsAnexos: [],
    status: 'pendente',
    dtCriacao: '',
    idResponsavel: undefined
  });

  const [selectedSolicitante, setSelectedSolicitante] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (solicitacao) {
      setFormData(solicitacao);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        idSolicitacao: uuidv4(),
        cdSolicitante: [],
        dsAssunto: '',
        cdIdentificacao: '',
        dsDescricao: '',
        dsAnexos: [],
        status: 'pendente',
        dtCriacao: today,
        idResponsavel: undefined
      });
    }
  }, [solicitacao]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'idResponsavel' && value === 'none') {
      setFormData(prev => ({
        ...prev,
        idResponsavel: undefined
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddSolicitante = () => {
    if (selectedSolicitante) {
      setFormData(prev => ({
        ...prev,
        cdSolicitante: [...prev.cdSolicitante, selectedSolicitante]
      }));
      setSelectedSolicitante('');
    }
  };

  const handleRemoveSolicitante = (index: number) => {
    setFormData(prev => ({
      ...prev,
      cdSolicitante: prev.cdSolicitante.filter((_, i) => i !== index)
    }));
  };

  const handleAddAnexo = () => {
    if (selectedFile) {
      setFormData(prev => ({
        ...prev,
        dsAnexos: [...prev.dsAnexos, selectedFile.name]
      }));
      setSelectedFile(null);
    }
  };

  const handleRemoveAnexo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dsAnexos: prev.dsAnexos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {solicitacao ? 'Editar Solicitação' : 'Nova Solicitação'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cdIdentificacao">Identificação</Label>
              <Input
                id="cdIdentificacao"
                name="cdIdentificacao"
                value={formData.cdIdentificacao}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dsAssunto">Assunto</Label>
            <Input
              id="dsAssunto"
              name="dsAssunto"
              value={formData.dsAssunto}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dsDescricao">Descrição</Label>
            <Textarea
              id="dsDescricao"
              name="dsDescricao"
              value={formData.dsDescricao}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="idResponsavel">Responsável</Label>
            <Select
              value={formData.idResponsavel || 'none'}
              onValueChange={(value) => handleSelectChange('idResponsavel', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não atribuído</SelectItem>
                {mockResponsaveis.map((responsavel) => (
                  <SelectItem key={responsavel.idResponsavel} value={responsavel.idResponsavel}>
                    {responsavel.dsNome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Solicitantes</Label>
            <div className="flex space-x-2">
              <Select
                value={selectedSolicitante}
                onValueChange={setSelectedSolicitante}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione um solicitante" />
                </SelectTrigger>
                <SelectContent>
                  {mockSolicitantes.map((solicitante) => (
                    <SelectItem key={solicitante.id} value={solicitante.nome}>
                      {solicitante.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                onClick={handleAddSolicitante}
                variant="secondary"
                disabled={!selectedSolicitante}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.cdSolicitante.map((solicitante, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {solicitante}
                  <button
                    type="button"
                    onClick={() => handleRemoveSolicitante(index)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Anexos</Label>
            <div className="flex space-x-2">
              <Input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={handleAddAnexo}
                variant="secondary"
                disabled={!selectedFile}
              >
                <PaperclipIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.dsAnexos.map((anexo, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {anexo}
                  <button
                    type="button"
                    onClick={() => handleRemoveAnexo(index)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>


          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {solicitacao ? 'Salvar Alterações' : 'Criar Solicitação'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
