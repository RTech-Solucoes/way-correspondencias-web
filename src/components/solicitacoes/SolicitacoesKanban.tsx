'use client';

import { useState } from 'react';
import { PlusIcon, FunnelIcon, UsersIcon, CalendarIcon, MagnifyingGlassIcon, ArrowLeftIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Solicitacao } from '@/lib/types';
import { mockSolicitacoes } from '@/lib/mockData';
import { getResponsavelNameById } from '@/lib/mockData';
import SolicitacaoModal from './SolicitacaoModal';
import Link from 'next/link';

interface Column {
  id: Solicitacao['status'];
  title: string;
  tasks: Solicitacao[];
  color: string;
}

export default function SolicitacoesKanban() {
  const initialColumns: Column[] = [
    {
      id: 'pendente',
      title: 'Pendente',
      color: 'bg-yellow-500',
      tasks: mockSolicitacoes.filter(s => s.status === 'pendente'),
    },
    {
      id: 'em_andamento',
      title: 'Em Andamento',
      color: 'bg-blue-500',
      tasks: mockSolicitacoes.filter(s => s.status === 'em_andamento'),
    },
    {
      id: 'concluido',
      title: 'Concluído',
      color: 'bg-green-500',
      tasks: mockSolicitacoes.filter(s => s.status === 'concluido'),
    },
    {
      id: 'atrasado',
      title: 'Atrasado',
      color: 'bg-red-500',
      tasks: mockSolicitacoes.filter(s => s.status === 'atrasado'),
    },
  ];

  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Solicitacao | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: Solicitacao['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');

    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      let task: Solicitacao | null = null;

      for (let column of newColumns) {
        const taskIndex = column.tasks.findIndex(t => t.idSolicitacao === taskId);
        if (taskIndex > -1) {
          task = column.tasks[taskIndex];
          column.tasks.splice(taskIndex, 1);
          break;
        }
      }

      if (task) {
        const targetColumn = newColumns.find(col => col.id === targetColumnId);
        if (targetColumn) {
          task.status = targetColumnId;
          targetColumn.tasks.push(task);
        }
      }

      return newColumns;
    });
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  const handleSaveTask = (task: Solicitacao) => {
    if (selectedTask) {
      setColumns(prevColumns => {
        return prevColumns.map(column => {
          return {
            ...column,
            tasks: column.tasks.map(t => 
              t.idSolicitacao === task.idSolicitacao ? task : t
            )
          };
        });
      });
    } else {
      setColumns(prevColumns => {
        return prevColumns.map(column => {
          if (column.id === task.status) {
            return {
              ...column,
              tasks: [...column.tasks, task]
            };
          }
          return column;
        });
      });
    }
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  const filteredColumns = columns.map(column => ({
    ...column,
    tasks: column.tasks.filter(task =>
      task.dsAssunto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.dsDescricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.cdIdentificacao.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.idResponsavel && 
        getResponsavelNameById(task.idResponsavel).toLowerCase().includes(searchQuery.toLowerCase()))
    ),
  }));

  const totalTasks = columns.reduce((sum, column) => sum + column.tasks.length, 0);

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              Solicitações - Quadro Kanban
            </h1>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="text-sm hover:bg-gray-100">
                {totalTasks} solicitações
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="bg-white hover:bg-gray-50"
              onClick={() => {
                window.location.href = "/solicitacoes";
              }}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Voltar para Lista
            </Button>
            <Button onClick={handleCreateTask} className="bg-blue-600 hover:bg-blue-700">
              <PlusIcon className="h-4 w-4 mr-2" />
              Nova Solicitação
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1 flex flex-row items-center space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar por assunto, descrição, identificação ou responsável..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
            <Button variant="secondary" className="h-10 px-4">
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
            <Button variant="secondary" className="h-10 px-4">
              <UsersIcon className="h-4 w-4 mr-2" />
              Responsáveis
            </Button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex space-x-6 min-w-max">
          {filteredColumns.map((column) => (
            <div
              key={column.id}
              className="w-80 flex flex-col bg-gray-100 rounded-md"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div 
                className={`p-3 font-medium text-white rounded-t-md ${column.color} flex justify-between items-center`}
              >
                <span>{column.title}</span>
                <Badge variant="secondary" className="bg-white text-gray-800">
                  {column.tasks.length}
                </Badge>
              </div>
              <div className="p-2 flex-1 overflow-y-auto max-h-[calc(100vh-250px)]">
                {column.tasks.length === 0 ? (
                  <div className="p-3 text-center text-gray-500 text-sm">
                    Nenhuma solicitação nesta coluna
                  </div>
                ) : (
                  column.tasks.map((task) => (
                    <div
                      key={task.idSolicitacao}
                      className="bg-white p-3 rounded-md shadow-sm mb-2 cursor-pointer hover:shadow-md"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.idSolicitacao)}
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="text-sm font-medium mb-1">{task.dsAssunto}</div>
                      <div className="text-xs text-gray-500 mb-2">{task.cdIdentificacao}</div>
                      <div className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {task.dsDescricao}
                      </div>
                      {task.idResponsavel && (
                        <div className="flex items-center mt-2">
                          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs mr-2">
                            {getResponsavelNameById(task.idResponsavel).charAt(0)}
                          </div>
                          <span className="text-xs">{getResponsavelNameById(task.idResponsavel)}</span>
                        </div>
                      )}
                      {task.dsAnexos.length > 0 && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {task.dsAnexos.length} anexo(s)
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <SolicitacaoModal
          solicitacao={selectedTask}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}
