'use client';

import { useState } from 'react';
import {X, Plus, Trash2, Folder, Edit2, Tag, LucideIcon} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Folder {
  id: string;
  icon: LucideIcon;
  label: string;
  count: number;
}

interface FolderManagerProps {
  folders: Folder[];
  onClose(): void;
  onSave(folders: Folder[]): void;
}

export default function FolderManager({ folders, onClose, onSave }: FolderManagerProps) {
  const [localFolders, setLocalFolders] = useState<Folder[]>(folders);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: Folder = {
        id: Date.now().toString(),
        icon: Tag,
        label: newFolderName.trim(),
        count: 0,
      };
      setLocalFolders([...localFolders, newFolder]);
      setNewFolderName('');
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta pasta?')) {
      setLocalFolders(localFolders.filter(folder => folder.id !== folderId));
    }
  };

  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder.id);
    setEditName(folder.label);
  };

  const handleSaveEdit = () => {
    if (editName.trim() && editingFolder) {
      setLocalFolders(localFolders.map(folder => 
        folder.id === editingFolder 
          ? { ...folder, label: editName.trim() }
          : folder
      ));
      setEditingFolder(null);
      setEditName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingFolder(null);
    setEditName('');
  };

  const handleSave = () => {
    onSave(localFolders);
    onClose();
  };

  const defaultFolders = ['inbox', 'sent', 'drafts', 'archive', 'starred', 'spam'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center">
            <Folder className="h-5 w-5 mr-2" />
            Gerenciar Pastas
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Add New Folder */}
          <div className="mb-6">
            <Label htmlFor="newFolder" className="text-sm font-medium mb-2 block">
              Nova Pasta
            </Label>
            <div className="flex space-x-2">
              <Input
                id="newFolder"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Nome da pasta..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddFolder()}
              />
              <Button onClick={handleAddFolder} disabled={!newFolderName.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Existing Folders */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Pastas Existentes</Label>
            <div className="space-y-2">
              {localFolders.map((folder) => (
                <div key={folder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-3xl">
                  <div className="flex items-center space-x-3">
                    <Folder className="h-4 w-4 text-gray-500" />
                    {editingFolder === folder.id ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8 text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                          autoFocus
                        />
                        <Button size="sm" onClick={handleSaveEdit}>
                          Salvar
                        </Button>
                        <Button size="sm" variant="secondary" onClick={handleCancelEdit}>
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium">{folder.label}</span>
                        <span className="text-sm text-gray-500">({folder.count})</span>
                      </>
                    )}
                  </div>
                  
                  {editingFolder !== folder.id && (
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditFolder(folder)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      {!defaultFolders.includes(folder.id) && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteFolder(folder.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-2 p-6 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
}