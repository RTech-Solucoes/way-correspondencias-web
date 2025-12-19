'use client';

import { Briefcase, Reply } from 'lucide-react';
import { TramitacaoResponse as SolTramitacaoResponse } from '@/api/solicitacoes/types';
import { Button } from '@/components/ui/button';

interface CardTramitacaoProps {
  tramitacao: SolTramitacaoResponse;
  tramitacaoReferenciada?: SolTramitacaoResponse | null;
  parts?: (string | { type: 'mention'; name: string; isValid: boolean })[];
  dataFormatada: string;
  autor: string;
  area: string;
  onResponder?: (tramitacao: SolTramitacaoResponse) => void;
  onScrollToTramitacao?: (idTramitacao: number) => void;
}

export function CardTramitacao({
  tramitacao,
  tramitacaoReferenciada,
  parts,
  dataFormatada,
  autor,
  area,
  onResponder,
  onScrollToTramitacao,
}: CardTramitacaoProps) {
  const handleClickTramitacaoReferenciada = () => {
    if (tramitacaoReferenciada && onScrollToTramitacao) {
      onScrollToTramitacao(tramitacaoReferenciada.idTramitacao);
    }
  };

  return (
    <div 
      id={`tramitacao-${tramitacao.idTramitacao}`}
      className="rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm"
    >
      {tramitacaoReferenciada && (
        <div 
          className="mb-3 border-l-4 border-blue-500 bg-gray-50 rounded-r-lg p-3 text-sm cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={handleClickTramitacaoReferenciada}
          title="Clique para ver a tramitação original"
        >
          <div className="flex items-center gap-2 mb-1">
            <Reply className="h-3 w-3 text-blue-600" />
            <span className="font-semibold text-blue-600 text-xs">
              {tramitacaoReferenciada.tramitacaoAcao?.[0]?.responsavelArea?.responsavel?.nmResponsavel || 'Usuário'}
            </span>
          </div>
          <p className="text-gray-700 text-xs line-clamp-2">
            {tramitacaoReferenciada.dsObservacao || 'Tramitação referenciada'}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-gray-900">{autor}</span>
        <span className="text-xs text-gray-400">{dataFormatada}</span>
      </div>

      <div className="mt-2 text-sm text-black">
        {parts ? parts.map((part, idx) => {
          if (typeof part === 'object' && 'type' in part && part.type === 'mention') {
            if (part.isValid) {
              return (
                <span key={idx} className="text-purple-600 font-semibold" style={{ color: '#9333ea', fontWeight: 600 }}>
                  @{part.name}
                </span>
              );
            } else {
              return (
                <span key={idx} className="text-black" style={{ color: '#000000' }}>
                  @{part.name}
                </span>
              );
            }
          }
          return <span key={idx} className="text-black" style={{ color: '#000000' }}>{String(part)}</span>;
        }) : (tramitacao.dsObservacao || 'Sem observação')}
      </div>
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

