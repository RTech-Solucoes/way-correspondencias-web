'use client';

import { Calendar, MessageCircle, Paperclip, User, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

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

interface TaskCardProps {
  task: Task;
  onDragStart(e: React.DragEvent, taskId: string): void;
  onClick(): void;
}

const statusColors = {
  concluido: 'bg-green-100 text-green-800 hover:bg-green-100',
  pendente: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  em_andamento: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  atrasado: 'bg-red-100 text-red-800 hover:bg-red-100',
};

const statusLabels = {
  concluido: 'Concluído',
  pendente: 'Pendente',
  em_andamento: 'Em Andamento',
  atrasado: 'Atrasado',
};

export default function TaskCard({ task, onDragStart, onClick }: TaskCardProps) {
  const isOverdue = new Date(task.dataLimite) < new Date();
  const dataLimite = new Date(task.dataLimite);
  const today = new Date();
  const daysDiff = Math.ceil((dataLimite.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Determine date color based on proximity
  const getDateColor = () => {
    if (daysDiff < 0) return "text-red-600"; // Overdue
    if (daysDiff === 0) return "text-red-600"; // Due today
    if (daysDiff <= 2) return "text-yellow-600"; // Due soon
    return "text-gray-600"; // Normal
  };

  const getPeriodicidadeColor = () => {
    switch (task.periodicidade.toLowerCase()) {
      case 'única':
        return 'bg-blue-100 text-blue-800';
      case 'sempre que ocorrer':
        return 'bg-orange-100 text-orange-800';
      case 'mensal':
        return 'bg-green-100 text-green-800';
      case 'anual':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      className="bg-white rounded-3xl p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={onClick}
    >
      {/* Header with Status and Alert */}
      <div className="flex items-center justify-between mb-2">
        <Badge className={cn("text-xs", statusColors[task.status])}>
          {statusLabels[task.status]}
        </Badge>
        {isOverdue && (
          <AlertTriangle className="h-4 w-4 text-red-500" />
        )}
      </div>

      {/* Task Name */}
      <h4 className="font-semibold text-gray-900 mb-1 text-sm">{task.nome}</h4>

      {/* Task Item */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.item}</p>

      {/* Area and Periodicidade */}
      <div className="flex flex-wrap gap-1 mb-3">
        <Badge variant="secondary" className="text-xs">
          {task.areaCondicionante}
        </Badge>
        <Badge className={cn("text-xs", getPeriodicidadeColor())}>
          {task.periodicidade}
        </Badge>
      </div>

      {/* Dates Section */}
      <div className="space-y-1 mb-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Início:</span>
          <span className="text-gray-700">{new Date(task.dataInicio).toLocaleDateString('pt-BR')}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Término:</span>
          <span className="text-gray-700">{new Date(task.dataTermino).toLocaleDateString('pt-BR')}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Limite:</span>
          <span className={cn("font-medium", getDateColor())}>
            {dataLimite.toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Duration */}
      <div className="flex items-center space-x-1 mb-3 text-xs text-gray-600">
        <Clock className="h-3 w-3" />
        <span>{task.duracao} dias</span>
      </div>

      {/* Bottom Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
              {task.atribuido.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-gray-600 truncate max-w-20">{task.atribuido}</span>
        </div>

        <div className="flex items-center space-x-2">
          {task.comentarios && (
            <div className="flex items-center space-x-1 text-gray-500">
              <MessageCircle className="h-3 w-3" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}