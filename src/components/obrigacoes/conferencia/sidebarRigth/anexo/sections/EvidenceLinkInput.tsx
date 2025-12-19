'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link as LinkIcon } from 'lucide-react';

interface EvidenceLinkInputProps {
  showInput: boolean;
  value: string;
  error: string | null;
  disabled?: boolean;
  tooltip?: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onToggle: () => void;
}

export function EvidenceLinkInput({
  showInput,
  value,
  error,
  disabled = false,
  tooltip,
  onChange,
  onSave,
  onCancel,
  onToggle,
}: EvidenceLinkInputProps) {
  return (
    <div className="flex flex-col gap-2">
      {showInput ? (
        <div className="space-y-3 rounded-2xl border border-gray-200 bg-white px-4 py-4">
          <div className="space-y-1">
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Insira o link do arquivo..."
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={`pl-10 ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                disabled={disabled}
              />
            </div>
            {error && (
              <p className="text-xs text-red-600 font-medium ml-1">{error}</p>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onCancel} className="text-gray-600">
              Cancelar
            </Button>
            <Button 
              onClick={onSave} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!!error || disabled}
            >
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="link"
          className="flex items-center gap-2 justify-start px-0 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onToggle}
          disabled={disabled}
          tooltip={tooltip}
        >
          <LinkIcon className="h-4 w-4" />
          Inserir link de evidência de cumprimento
        </Button>
      )}
    </div>
  );
}

