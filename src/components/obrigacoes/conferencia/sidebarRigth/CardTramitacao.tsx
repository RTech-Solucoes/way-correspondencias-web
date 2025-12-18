'use client';

import { Briefcase, Reply } from 'lucide-react';
import { TramitacaoResponse as SolTramitacaoResponse } from '@/api/solicitacoes/types';
import { Button } from '@/components/ui/button';

interface CardTramitacaoProps {
  tramitacao: SolTramitacaoResponse;
  dataFormatada: string;
  autor: string;
  area: string;
  onResponder?: (tramitacao: SolTramitacaoResponse) => void;
}

export function CardTramitacao({
  tramitacao,
  dataFormatada,
  autor,
  area,
  onResponder,
}: CardTramitacaoProps) {
  return (
    <div 
      id={`tramitacao-${tramitacao.idTramitacao}`}
      className="rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-gray-900">{autor}</span>
        <span className="text-xs text-gray-400">{dataFormatada}</span>
      </div>
      <p className="mt-2 text-sm text-black">
        {tramitacao.dsObservacao || 'Sem observação'}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <div className  ="flex items-center gap-1.5 text-xs text-gray-500">
          <Briefcase className="h-3.5 w-3.5" />
          <span>{area}</span>
        </div>
        {onResponder && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => onResponder(tramitacao)}
          >
            <Reply className="h-3.5 w-3.5 mr-1" />
            Responder
          </Button>
        )}
      </div>
    </div>
  );
}

