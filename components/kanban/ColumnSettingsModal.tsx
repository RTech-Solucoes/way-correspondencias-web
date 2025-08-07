'use client';

import { useState } from 'react';
import { X, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Column {
  id: string;
  title: string;
  tasks: any[];
  color: string;
}

interface ColumnSettingsModalProps {
  column: Column | null;
  availableColors: string[];
  onClose(): void;
  onSave(column: Column): void;
  onDelete(columnId: string): void;
}

export default function ColumnSettingsModal({
  column,
  availableColors,
  onClose,
  onSave,
  onDelete,
}: ColumnSettingsModalProps) {
  const [title, setTitle] = useState(column?.title || 'Nova Seção');
  const [color, setColor] = useState(column?.color || 'bg-gray-500');

  const handleSave = () => {
    if (column) {
      onSave({
        ...column,
        title,
        color,
      });
    } else {
      // Create new column
      const newColumn: Column = {
        id: Date.now().toString(),
        title,
        color,
        tasks: [],
      };
      onSave(newColumn);
    }
  };

  const handleDelete = () => {
    if (column && window.confirm('Tem certeza que deseja excluir esta seção? Todas as tarefas serão perdidas.')) {
      onDelete(column.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            {column ? 'Editar Seção' : 'Nova Seção'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <Label htmlFor="title" className="text-sm font-medium">Nome da Seção</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o nome da seção..."
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Cor</Label>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {availableColors.map((colorOption) => (
                <button
                  key={colorOption}
                  className={cn(
                    "w-10 h-10 rounded-full border-2 transition-all",
                    colorOption,
                    color === colorOption ? "border-gray-900 scale-110" : "border-gray-300 hover:border-gray-400"
                  )}
                  onClick={() => setColor(colorOption)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div>
            {column && (
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Seção
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              {column ? 'Salvar Alterações' : 'Criar Seção'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}