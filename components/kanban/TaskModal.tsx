'use client';

import { useState } from 'react';
import { X, Calendar, User, Tag, MessageCircle, Paperclip, Plus, Trash2, Edit, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface Task {
  id: string;
  nome: string;
  item: string;
  status: 'concluido' | 'pendente' | 'em_andamento' | 'atrasado';
  atribuido: string;
  areaCondicionante: string;
  periodicidade: string;
  dataInicio: string;
  dataTermino: string;
  duracao: number;
  dataLimite: string;
  comentarios: string;
}

interface TaskModalProps {
  task: Task | null;
  onClose(): void;
  onSave: (task: Task) => void;
}

const RESPONSAVEIS = [
  'Jurídico',
  'Operação',
  'Controladoria',
  'Meio Ambiente',
  'Diretoria',
  'Financeiro',
  'RH',
  'TI',
];

const AREAS_CONDICIONANTES = [
  'Diretoria',
  'Meio Ambiente',
  'NA',
  'Jurídico',
  'Operação',
  'Financeiro',
];

const PERIODICIDADES = [
  'Única',
  'Sempre que ocorrer',
  'Mensal',
  'Trimestral',
  'Semestral',
  'Anual',
];

export default function TaskModal({ task, onClose, onSave }: TaskModalProps) {
  const [nome, setNome] = useState(task?.nome || '');
  const [item, setItem] = useState(task?.item || '');
  const [status, setStatus] = useState<Task['status']>(task?.status || 'pendente');
  const [atribuido, setAtribuido] = useState(task?.atribuido || '');
  const [areaCondicionante, setAreaCondicionante] = useState(task?.areaCondicionante || '');
  const [periodicidade, setPeriodicidade] = useState(task?.periodicidade || '');
  const [dataInicio, setDataInicio] = useState(task?.dataInicio || '');
  const [dataTermino, setDataTermino] = useState(task?.dataTermino || '');
  const [duracao, setDuracao] = useState(task?.duracao || 0);
  const [dataLimite, setDataLimite] = useState(task?.dataLimite || '');
  const [comentarios, setComentarios] = useState(task?.comentarios || '');

  const handleSave = () => {
    const savedTask: Task = {
      id: task?.id || Date.now().toString(),
      nome,
      item,
      status,
      atribuido,
      areaCondicionante,
      periodicidade,
      dataInicio,
      dataTermino,
      duracao,
      dataLimite,
      comentarios,
    };
    onSave(savedTask);
  };

  // Calculate duration when dates change
  const calculateDuration = () => {
    if (dataInicio && dataTermino) {
      const inicio = new Date(dataInicio);
      const termino = new Date(dataTermino);
      const diffTime = Math.abs(termino.getTime() - inicio.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDuracao(diffDays);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] flex">
        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Edit className="h-5 w-5 mr-2" />
              {task ? 'Editar Obrigação' : 'Nova Obrigação'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Task Form */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome" className="text-sm font-medium">Nome da Tarefa</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: 4.2.1 - Contrato"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                <Select value={status} onValueChange={(value: Task['status']) => setStatus(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
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

            <div>
              <Label htmlFor="item" className="text-sm font-medium">Item/Descrição</Label>
              <Textarea
                id="item"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                placeholder="Descreva o item ou atividade..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="atribuido" className="text-sm font-medium">Atribuído</Label>
                <Select value={atribuido} onValueChange={setAtribuido}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecionar responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESPONSAVEIS.map((resp) => (
                      <SelectItem key={resp} value={resp}>
                        {resp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="areaCondicionante" className="text-sm font-medium">Área Condicionante</Label>
                <Select value={areaCondicionante} onValueChange={setAreaCondicionante}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecionar área" />
                  </SelectTrigger>
                  <SelectContent>
                    {AREAS_CONDICIONANTES.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="periodicidade" className="text-sm font-medium">Periodicidade</Label>
              <Select value={periodicidade} onValueChange={setPeriodicidade}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecionar periodicidade" />
                </SelectTrigger>
                <SelectContent>
                  {PERIODICIDADES.map((per) => (
                    <SelectItem key={per} value={per}>
                      {per}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="dataInicio" className="text-sm font-medium">Data de Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => {
                    setDataInicio(e.target.value);
                    setTimeout(calculateDuration, 100);
                  }}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="dataTermino" className="text-sm font-medium">Data de Término</Label>
                <Input
                  id="dataTermino"
                  type="date"
                  value={dataTermino}
                  onChange={(e) => {
                    setDataTermino(e.target.value);
                    setTimeout(calculateDuration, 100);
                  }}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="dataLimite" className="text-sm font-medium">Data Limite</Label>
                <Input
                  id="dataLimite"
                  type="date"
                  value={dataLimite}
                  onChange={(e) => setDataLimite(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="duracao" className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Duração (dias)
              </Label>
              <Input
                id="duracao"
                type="number"
                value={duracao}
                onChange={(e) => setDuracao(parseInt(e.target.value) || 0)}
                className="mt-1"
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="comentarios" className="text-sm font-medium">Comentários</Label>
              <Textarea
                id="comentarios"
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                placeholder="Adicione observações ou comentários..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
            <div className="flex items-center space-x-2">
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                {task ? 'Salvar Alterações' : 'Criar Obrigação'}
              </Button>
              <Button variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
            </div>
            
            {task && (
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Obrigação
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-4">Informações Adicionais</h3>
          
          {/* Status Summary */}
          <div className="bg-white rounded-3xl p-4 border border-gray-200 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Resumo</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge className="text-xs">
                  {status === 'concluido' ? 'Concluído' : 
                   status === 'pendente' ? 'Pendente' :
                   status === 'em_andamento' ? 'Em Andamento' : 'Atrasado'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duração:</span>
                <span className="font-medium">{duracao} dias</span>
              </div>
              {dataLimite && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Prazo:</span>
                  <span className="font-medium">
                    {new Date(dataLimite).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <Button variant="secondary" size="sm" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Agendar Lembrete
            </Button>
            <Button variant="secondary" size="sm" className="w-full justify-start">
              <Paperclip className="h-4 w-4 mr-2" />
              Adicionar Anexo
            </Button>
            <Button variant="secondary" size="sm" className="w-full justify-start">
              <MessageCircle className="h-4 w-4 mr-2" />
              Adicionar Nota
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}