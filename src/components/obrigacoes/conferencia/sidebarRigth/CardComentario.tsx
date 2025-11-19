'use client';

import { Reply, Trash2, Briefcase } from 'lucide-react';
import { SolicitacaoParecerResponse } from '@/api/solicitacao-parecer/types';
import { TramitacaoResponse } from '@/api/tramitacoes/types';

interface CardComentarioProps {
  parecer: SolicitacaoParecerResponse;
  comentarioReferenciado: SolicitacaoParecerResponse | null;
  tramitacaoReferenciada?: TramitacaoResponse | null;
  parts: (string | { type: 'mention'; name: string; isValid: boolean })[];
  dataFormatada: string;
  autor: string;
  area: string;
  podeDeletar: boolean;
  onResponder?: (parecer: SolicitacaoParecerResponse) => void;
  onDeletar?: (idSolicitacaoParecer: number) => void;
  onScrollToComment?: (idSolicitacaoParecer: number) => void;
  onScrollToTramitacao?: (idTramitacao: number) => void;
}

export function CardComentario({
  parecer,
  comentarioReferenciado,
  tramitacaoReferenciada,
  parts,
  dataFormatada,
  autor,
  area,
  podeDeletar,
  onResponder,
  onDeletar,
  onScrollToComment,
  onScrollToTramitacao,
}: CardComentarioProps) {
  const handleClickComentarioReferenciado = () => {
    if (comentarioReferenciado && onScrollToComment) {
      onScrollToComment(comentarioReferenciado.idSolicitacaoParecer);
    }
  };

  const handleClickTramitacaoReferenciada = () => {
    if (tramitacaoReferenciada && onScrollToTramitacao) {
      onScrollToTramitacao(tramitacaoReferenciada.idTramitacao);
    }
  };

  return (
    <div 
      id={`comentario-${parecer.idSolicitacaoParecer}`}
      className="rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm"
    >
      {tramitacaoReferenciada ? (
        <div 
          className="mb-3 border-l-4 border-purple-500 bg-gray-50 rounded-r-lg p-3 text-sm cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={handleClickTramitacaoReferenciada}
          title="Clique para ver a tramitação original"
        >
          <div className="flex items-center gap-2 mb-1">
            <Reply className="h-3 w-3 text-purple-600" />
            <span className="font-semibold text-purple-600 text-xs">
              {tramitacaoReferenciada.tramitacaoAcao?.[0]?.responsavelArea?.responsavel?.nmResponsavel || 'Usuário'}
            </span>
          </div>
          <p className="text-gray-700 text-xs line-clamp-2">
            {tramitacaoReferenciada.dsObservacao || 'Tramitação referenciada'}
          </p>
        </div>
      ) : comentarioReferenciado ? (
        <div 
          className="mb-3 border-l-4 border-purple-500 bg-gray-50 rounded-r-lg p-3 text-sm cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={handleClickComentarioReferenciado}
          title="Clique para ver o comentário original"
        >
          <div className="flex items-center gap-2 mb-1">
            <Reply className="h-3 w-3 text-purple-600" />
            <span className="font-semibold text-purple-600 text-xs">
              {comentarioReferenciado.responsavel?.nmResponsavel || 'Usuário'}
            </span>
          </div>
          <p className="text-gray-700 text-xs line-clamp-2">
            {comentarioReferenciado.dsDarecer || 'Comentário referenciado'}
          </p>
        </div>
      ) : null}
      
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-gray-900">{autor}</span>
        <span className="text-xs text-gray-400">{dataFormatada}</span>
      </div>
      <p className="mt-2 text-sm text-black">
        {parts.map((part, idx) => {
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
        })}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Briefcase className="h-3.5 w-3.5" />
          <span>{area}</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
            onClick={() => {
              if (onResponder) {
                onResponder(parecer);
              }
            }}
          >
            <Reply className="h-3.5 w-3.5" />
            Responder
          </button>
          {podeDeletar && onDeletar && (
            <button 
              type="button" 
              className="text-gray-400 hover:text-red-600 transition-colors"
              onClick={() => onDeletar(parecer.idSolicitacaoParecer)}
              title="Excluir comentário"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

