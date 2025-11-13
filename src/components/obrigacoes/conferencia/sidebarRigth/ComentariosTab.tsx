'use client';

import { useState } from 'react';
import { MessageSquare, Reply, Trash2, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { SolicitacaoParecerResponse } from '@/api/solicitacao-parecer/types';
import { formatDateTimeBr } from '@/utils/utils';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ResponsavelResponse } from '@/api/responsaveis/types';

interface ComentariosTabProps {
  solicitacaoPareceres: SolicitacaoParecerResponse[];
  responsaveis?: ResponsavelResponse[];
  loading?: boolean;
  idResponsavelLogado?: number | null;
  onDeletar?: (idSolicitacaoParecer: number) => void;
  onResponder?: (parecer: SolicitacaoParecerResponse) => void;
}

export function ComentariosTab({ 
  solicitacaoPareceres, 
  responsaveis = [],
  loading = false, 
  idResponsavelLogado,
  onDeletar,
  onResponder
}: ComentariosTabProps) {
  const [parecerParaDeletar, setParecerParaDeletar] = useState<number | null>(null);
  const comentariosCount = solicitacaoPareceres.length;

  const handleConfirmarDeletar = () => {
    if (parecerParaDeletar && onDeletar) {
      onDeletar(parecerParaDeletar);
      setParecerParaDeletar(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 py-6">
      {loading ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
          <MessageSquare className="mx-auto mb-3 h-6 w-6 text-gray-300 animate-pulse" />
          Carregando comentários...
        </div>
      ) : comentariosCount === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
          <MessageSquare className="mx-auto mb-3 h-6 w-6 text-gray-300" />
          Nenhum comentário registrado até o momento.
        </div>
      ) : (
        <div className="space-y-4 pb-4">
          {(() => {
            const nomesResponsaveisMap = new Map<string, string>();
            responsaveis.forEach(resp => {
              if (resp.nmResponsavel) {
                const nomeLower = resp.nmResponsavel.trim().toLowerCase();
                nomesResponsaveisMap.set(nomeLower, resp.nmResponsavel.trim());
              }
            });
            
            const pareceresMap = new Map(
              solicitacaoPareceres.map(p => [p.idSolicitacaoParecer, p])
            );
            
            return solicitacaoPareceres.map((parecer) => {
              const mensagem = parecer.dsDarecer || '';
              const parts: (string | { type: 'mention'; name: string; isValid: boolean })[] = [];
              
              let comentarioReferenciado: SolicitacaoParecerResponse | null = null;
              
              if (parecer.solicitacaoParecerReferen) {
                if (Array.isArray(parecer.solicitacaoParecerReferen) && parecer.solicitacaoParecerReferen.length > 0) {
                  comentarioReferenciado = parecer.solicitacaoParecerReferen[0];
                } 
                else if (!Array.isArray(parecer.solicitacaoParecerReferen)) {
                  const refObj = parecer.solicitacaoParecerReferen as unknown as SolicitacaoParecerResponse;
                  if (refObj && 'idSolicitacaoParecer' in refObj && refObj.idSolicitacaoParecer) {
                    comentarioReferenciado = refObj;
                  }
                }
              }
              
              if (!comentarioReferenciado && parecer.idSolicitacaoParecerReferen) {
                comentarioReferenciado = pareceresMap.get(parecer.idSolicitacaoParecerReferen) || null;
              }
              
              const processarMensagem = (texto: string) => {
                if (!texto) {
                  parts.push('');
                  return;
                }
                
                let posicao = 0;
                
                while (posicao < texto.length) {
                  const indiceArroba = texto.indexOf('@', posicao);
                  
                  if (indiceArroba === -1) {
                    if (posicao < texto.length) {
                      parts.push(texto.substring(posicao));
                    }
                    break;
                  }
                  
                  if (indiceArroba > posicao) {
                    parts.push(texto.substring(posicao, indiceArroba));
                  }
                  
                  let nomeEncontrado: string | null = null;
                  let nomeValido = false;
                  let nomeOriginal: string | null = null;
                  
                  const textoRestante = texto.substring(indiceArroba + 1);
                  
                  const nomesOrdenados = Array.from(nomesResponsaveisMap.entries())
                    .sort((a, b) => b[0].length - a[0].length);
                  
                  for (const [nomeLower, nomeOriginalMap] of nomesOrdenados) {
                    const textoRestanteLower = textoRestante.toLowerCase();
                    if (textoRestanteLower.startsWith(nomeLower)) {
                      const proximoChar = textoRestanteLower[nomeLower.length];
                      if (!proximoChar || proximoChar === ' ' || proximoChar === '\n' || proximoChar === '\t') {
                        nomeEncontrado = nomeLower;
                        nomeValido = true;
                        nomeOriginal = nomeOriginalMap;
                        posicao = indiceArroba + 1 + nomeLower.length;
                        break;
                      }
                    }
                  }
                  
                  if (nomeEncontrado && nomeValido && nomeOriginal) {
                    parts.push({ type: 'mention', name: nomeOriginal, isValid: true });
                  } else {
                    const proximoEspaco = textoRestante.indexOf(' ');
                    if (proximoEspaco === -1) {
                      const nomeMencao = textoRestante;
                      parts.push({ type: 'mention', name: nomeMencao, isValid: false });
                      posicao = texto.length;
                    } else {
                      const nomeMencao = textoRestante.substring(0, proximoEspaco);
                      parts.push({ type: 'mention', name: nomeMencao, isValid: false });
                      posicao = indiceArroba + 1 + proximoEspaco;
                    }
                  }
                }
                
                if (parts.length === 0) {
                  parts.push(texto);
                }
              };
              
              processarMensagem(mensagem);

              const dataFormatada = parecer.dtCriacao 
                ? formatDateTimeBr(parecer.dtCriacao) 
                : '';
              const autor = parecer.responsavel?.nmResponsavel || 'Usuário';
              const area = parecer.responsavel?.areas?.[0]?.area?.nmArea || parecer.responsavel?.nmPerfil || 'Regulatório';
              
              const podeDeletar = idResponsavelLogado && 
                                  parecer.responsavel?.idResponsavel && 
                                  parecer.responsavel.idResponsavel === idResponsavelLogado;

              return (
                <div
                  key={parecer.idSolicitacaoParecer}
                  className="rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm"
                >
                  {comentarioReferenciado ? (
                    <div className="mb-3 border-l-4 border-purple-500 bg-gray-50 rounded-r-lg p-3 text-sm">
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
                        } else {
                          toast.info('Funcionalidade de resposta disponível em breve.');
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
                        onClick={() => setParecerParaDeletar(parecer.idSolicitacaoParecer)}
                        title="Excluir comentário"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              );
            });
          })()}
        </div>
      )}

      <ConfirmationDialog
        open={parecerParaDeletar !== null}
        onOpenChange={(open) => !open && setParecerParaDeletar(null)}
        title="Excluir comentário"
        description="Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleConfirmarDeletar}
        variant="destructive"
      />
    </div>
  );
}

