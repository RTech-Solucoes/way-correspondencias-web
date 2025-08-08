'use client';

import { useState } from 'react';
import { PlusIcon, FilterIcon, UsersIcon, CalendarIcon, SearchIcon, SettingsIcon, GripVerticalIcon } from 'lucide-react';
import { KanbanIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import KanbanColumn from '../../components/kanban/KanbanColumn';
import TaskModal from '../../components/kanban/TaskModal';
import ColumnSettingsModal from '../../components/kanban/ColumnSettingsModal';
import ImportSpreadsheetModal from '../../components/kanban/ImportSpreadsheetModal';

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

const AVAILABLE_COLORS = [
  'bg-gray-500', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 
  'bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 
  'bg-pink-500', 'bg-teal-500'
];

const INITIAL_COLUMNS: Column[] = [
  {
    id: 'pendente',
    title: 'Pendente',
    color: 'bg-yellow-500',
    tasks: [
      {
        id: '1',
        nome: '4.2.1 - Contrato',
        item: 'Análise de Contrato',
        status: 'pendente',
        atribuido: 'Jurídico',
        areaCondicionante: 'Diretoria',
        periodicidade: 'Única',
        dataInicio: '2025-02-17',
        dataTermino: '2025-03-10',
        duracao: 21,
        dataLimite: '2025-03-19',
        comentarios: 'Aguardando aprovação da diretoria'
      },
      {
        id: '2',
        nome: '5.2 - Contrato',
        item: 'Revisão Contratual',
        status: 'pendente',
        atribuido: 'Jurídico',
        areaCondicionante: 'Meio Ambiente',
        periodicidade: 'Única',
        dataInicio: '2025-02-17',
        dataTermino: '2025-03-10',
        duracao: 21,
        dataLimite: '2025-03-19',
        comentarios: 'Pendente análise ambiental'
      }
    ],
  },
  {
    id: 'em_andamento',
    title: 'Em Andamento',
    color: 'bg-blue-500',
    tasks: [
      {
        id: '3',
        nome: 'Ofício SEI n. 714/2025',
        item: 'Resposta ao Ofício',
        status: 'em_andamento',
        atribuido: 'Operação',
        areaCondicionante: 'NA',
        periodicidade: 'Sempre que ocorrer',
        dataInicio: '2025-03-21',
        dataTermino: '2025-03-10',
        duracao: 3,
        dataLimite: '2025-03-28',
        comentarios: 'Em elaboração da resposta'
      }
    ],
  },
  {
    id: 'concluido',
    title: 'Concluído',
    color: 'bg-green-500',
    tasks: [
      {
        id: '4',
        nome: '3.2.1 - Contrato',
        item: 'Validação Final',
        status: 'concluido',
        atribuido: 'Controladoria',
        areaCondicionante: 'Diretoria',
        periodicidade: 'Única',
        dataInicio: '2025-02-14',
        dataTermino: '2025-03-14',
        duracao: 28,
        dataLimite: '2025-03-19',
        comentarios: 'Concluído dentro do prazo'
      }
    ],
  },
  {
    id: 'atrasado',
    title: 'Atrasado',
    color: 'bg-red-500',
    tasks: [],
  },
];

export default function KanbanPage() {
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [dialog, setDialog] = useState<{ open: boolean; title: string; description: string }>({ open: false, title: '', description: '' });

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      let task: Task | null = null;
      
      // Find and remove task from source column
      for (let column of newColumns) {
        const taskIndex = column.tasks.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
          task = column.tasks[taskIndex];
          column.tasks.splice(taskIndex, 1);
          break;
        }
      }
      
      // Add task to target column and update status
      if (task) {
        const targetColumn = newColumns.find(col => col.id === targetColumnId);
        if (targetColumn) {
          task.status = targetColumnId as Task['status'];
          targetColumn.tasks.push(task);
        }
      }
      
      return newColumns;
    });
  };

  const handleColumnDragStart = (e: React.DragEvent, columnId: string) => {
    e.dataTransfer.setData('column', columnId);
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleColumnDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const columnId = e.dataTransfer.getData('column');
    
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      const sourceIndex = newColumns.findIndex(col => col.id === columnId);
      
      if (sourceIndex !== -1 && sourceIndex !== targetIndex) {
        const [movedColumn] = newColumns.splice(sourceIndex, 1);
        newColumns.splice(targetIndex, 0, movedColumn);
      }
      
      return newColumns;
    });
  };

  const handleCreateColumn = () => {
    const newColumn: Column = {
      id: Date.now().toString(),
      title: 'Nova Seção',
      color: 'bg-gray-500',
      tasks: [],
    };
    setColumns([...columns, newColumn]);
  };

  const handleEditColumn = (column: Column) => {
    setEditingColumn(column);
    setShowColumnSettings(true);
  };

  const handleSaveColumn = (updatedColumn: Column) => {
    setColumns(prevColumns =>
      prevColumns.map(col => col.id === updatedColumn.id ? updatedColumn : col)
    );
    setShowColumnSettings(false);
    setEditingColumn(null);
  };

  const handleDeleteColumn = (columnId: string) => {
    setColumns(prevColumns => prevColumns.filter(col => col.id !== columnId));
  };

  const filteredColumns = columns.map(column => ({
    ...column,
    tasks: column.tasks.filter(task =>
      task.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.atribuido.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.areaCondicionante.toLowerCase().includes(searchQuery.toLowerCase())
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
              <KanbanIcon className="h-7 w-7 mr-3" />
              Obrigações Contratuais
            </h1>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="text-sm hover:bg-gray-100">
                {totalTasks} tarefas
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2">
      						<Button
							onClick={() => setShowImportModal(true)}
							className="bg-green-600 hover:bg-green-700 text-white"
						>
							<PlusIcon className="h-4 w-4 mr-2" />
              Importar Planilha
            </Button>
      						<Button onClick={() => setShowTaskModal(true)} className="bg-blue-600 hover:bg-blue-700">
							<PlusIcon className="h-4 w-4 mr-2" />
              Adicionar Tarefa
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex-1 flex flex-row items-center space-x-4">
     							<div className="flex-1 relative">
								<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar por nome, item, responsável ou área..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
      						<Button variant="secondary" className="h-10 px-4">
							<FilterIcon className="h-4 w-4 mr-2" />
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
          {filteredColumns.map((column, index) => (
            <KanbanColumn
              key={column.id}
              column={column}
              index={index}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onColumnDragStart={handleColumnDragStart}
              onColumnDragOver={handleColumnDragOver}
              onColumnDrop={handleColumnDrop}
              onTaskClick={setSelectedTask}
              onEditColumn={handleEditColumn}
            />
          ))}
          
   							<Button
								variant="outline"
								className="w-80 h-12 border-dashed border-gray-300 hover:border-gray-400"
								onClick={handleCreateColumn}
							>
								<PlusIcon className="h-4 w-4 mr-2" />
            Adicionar Seção
          </Button>
        </div>
      </div>

      {/* Task Modal */}
      {(showTaskModal || selectedTask) && (
        <TaskModal
          task={selectedTask}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onSave={(task) => {
            // Logic to save task
            console.log('Saving task:', task);
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
        />
      )}

      {/* Column Settings Modal */}
      {showColumnSettings && (
        <ColumnSettingsModal
          column={editingColumn}
          availableColors={AVAILABLE_COLORS}
          onClose={() => { setShowColumnSettings(false); setEditingColumn(null); }}
          onSave={handleSaveColumn}
          onDelete={handleDeleteColumn}
        />
      )}

      {/* Import Spreadsheet Modal */}
      {showImportModal && (
        <ImportSpreadsheetModal
          onClose={() => setShowImportModal(false)}
          onImport={(file) => {
            // Logic to handle the imported file would go here
            console.log('Imported file:', file);
            // In a real implementation, you would parse the file and create tasks
            setDialog({ open: true, title: 'Importação concluída', description: `Arquivo "${file.name}" importado com sucesso! Em uma implementação real, as tarefas seriam criadas a partir dos dados da planilha.` });
            setShowImportModal(false);
          }}
        />
      )}
      {/* Global Alert Dialog */}
      <AlertDialog open={dialog.open} onOpenChange={(open) => setDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{dialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setDialog(prev => ({ ...prev, open: false }))}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}