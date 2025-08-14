'use client';

import React from 'react';
import { PlusIcon, DotsNineIcon, PencilIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TaskCard from './TaskCard';
import { cn } from '@/utils/utils';

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

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

interface KanbanColumnProps {
  column: Column;
  index: number;
  onDragStart(e: React.DragEvent, taskId: string): void;
  onDragOver(e: React.DragEvent): void;
  onDrop(e: React.DragEvent, columnId: string): void;
  onColumnDragStart(e: React.DragEvent, columnId: string): void;
  onColumnDragOver(e: React.DragEvent): void;
  onColumnDrop(e: React.DragEvent, index: number): void;
  onTaskClick(task: Task): void;
  onEditColumn(column: Column): void;
}

export default function KanbanColumn({
  column,
  index,
  onDragStart,
  onDragOver,
  onDrop,
  onColumnDragStart,
  onColumnDragOver,
  onColumnDrop,
  onTaskClick,
  onEditColumn,
}: KanbanColumnProps) {
  return (
    <div
      className="w-80 bg-gray-100 rounded-3xl p-4 h-fit"
      draggable
      onDragStart={(e) => onColumnDragStart(e, column.id)}
      onDragOver={onDragOver}
      onDrop={(e) => {
        if (e.dataTransfer.getData('column')) {
          onColumnDrop(e, index);
        } else {
          onDrop(e, column.id);
        }
      }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <DotsNineIcon className="h-4 w-4 text-gray-400 cursor-grab" />
          <div className={cn("w-3 h-3 rounded-full", column.color)} />
          <h3 className="font-semibold text-gray-900">{column.title}</h3>
          <Badge variant="secondary" className="text-xs">
            {column.tasks.length}
          </Badge>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
            <PlusIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-gray-700"
            onClick={() => onEditColumn(column)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDragStart={onDragStart}
            onClick={() => onTaskClick(task)}
          />
        ))}
      </div>

      {/* Drop Zone */}
      {column.tasks.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-3xl p-8 text-center">
          <p className="text-gray-500 text-sm">Arraste tarefas aqui</p>
        </div>
      )}
    </div>
  );
}