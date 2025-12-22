'use client';

import { FileText, Trash2 } from 'lucide-react';
import type { ArquivoDTO } from '@/api/anexos/type';

interface AnexosTramitacaoPendentesProps {
  arquivos: ArquivoDTO[];
  onRemoveArquivo: (index: number) => void;
}

export function AnexosTramitacaoPendentes({
  arquivos,
  onRemoveArquivo,
}: AnexosTramitacaoPendentesProps) {
  if (arquivos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 border-t border-gray-100 pt-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-blue-700">Novos anexos a enviar</span>
        <span className="text-xs font-semibold text-blue-400">{arquivos.length}</span>
      </div>
      <ul className="space-y-2">
        {arquivos.map((arquivo, idx) => (
          <li key={idx} className="flex items-center justify-between gap-3 rounded-xl bg-blue-50 px-3 py-2 text-sm">
            <div className="flex items-center gap-2 overflow-hidden">
              <FileText className="h-4 w-4 shrink-0 text-blue-500" />
              <span className="truncate text-blue-900 font-medium">{arquivo.nomeArquivo}</span>
            </div>
            <button
              type="button"
              onClick={() => onRemoveArquivo(idx)}
              className="text-blue-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
      <p className="text-[10px] text-blue-500 italic">
        * Estes arquivos serão anexados ao enviar tramitação.
      </p>
    </div>
  );
}