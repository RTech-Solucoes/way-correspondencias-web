'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { SolicitacaoParecerResponse } from '@/api/solicitacao-parecer/types';
import { formatDateTimeBr } from '@/utils/utils';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { AreaSolicitacao } from '@/api/solicitacoes/types';
import { CardComentario } from './CardComentario';
import { TramitacaoResponse } from '@/api/tramitacoes/types';
import { CardTramitacao } from './CardTramitacao';

interface ComentarioUnificado {
  tipo: 'parecer' | 'tramitacao';
  data: string;
  parecer?: SolicitacaoParecerResponse;
  tramitacao?: TramitacaoResponse;
}

interface ComentariosTabProps {
  solicitacaoPareceres: SolicitacaoParecerResponse[];
  tramitacoes?: TramitacaoResponse[];
  comentariosUnificados: ComentarioUnificado[];
  responsaveis?: ResponsavelResponse[];
  loading?: boolean;
  idResponsavelLogado?: number | null;
  onDeletar?: (idSolicitacaoParecer: number) => void;
  onResponder?: (parecer: SolicitacaoParecerResponse) => void;
  onResponderTramitacao?: (tramitacao: TramitacaoResponse) => void;
  parecerTramitacaoMap?: Map<number, number>;
  areaAtribuida?: AreaSolicitacao | null;
}

export function ComentariosTab({ 
  solicitacaoPareceres,
  tramitacoes = [],
  comentariosUnificados,
  responsaveis = [],
  loading = false, 
  idResponsavelLogado,
  onDeletar,
  onResponder,
  onResponderTramitacao,
  parecerTramitacaoMap = new Map(),
  areaAtribuida
}: ComentariosTabProps) {
  const [parecerParaDeletar, setParecerParaDeletar] = useState<number | null>(null);
  const comentariosCount = comentariosUnificados.length;

  const handleScrollToComment = (idSolicitacaoParecer: number) => {
    const element = document.getElementById(`comentario-${idSolicitacaoParecer}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-2', 'ring-purple-500', 'ring-offset-2');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-purple-500', 'ring-offset-2');
      }, 2000);
    }
  };

  const handleScrollToTramitacao = (idTramitacao: number) => {
    const element = document.getElementById(`tramitacao-${idTramitacao}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2');
      }, 2000);
    }
  };

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
            
            const tramitacoesMap = new Map(
              tramitacoes.map(t => [t.idTramitacao, t])
            );
            
            return comentariosUnificados.map((item, index) => {
              if (item.tipo === 'tramitacao' && item.tramitacao) {
                const tramitacao = item.tramitacao;
                const dataFormatada = item.data 
                  ? formatDateTimeBr(item.data) 
                  : '';
                
                const responsavelTramitacao = tramitacao.tramitacaoAcao?.[0]?.responsavelArea?.responsavel;
                const autor = responsavelTramitacao?.nmResponsavel || 'Usuário';
                const area = tramitacao.areaOrigem?.nmArea || 'Regulatório';
                
                return (
                  <CardTramitacao
                    key={`tramitacao-${tramitacao.idTramitacao}-${index}`}
                    tramitacao={tramitacao}
                    dataFormatada={dataFormatada}
                    autor={autor}
                    area={area}
                    onResponder={onResponderTramitacao}
                  />
                );
              }
              
              const parecer = item.parecer!;
              const mensagem = parecer.dsDarecer || '';
              const parts: (string | { type: 'mention'; name: string; isValid: boolean })[] = [];
              
              let comentarioReferenciado: SolicitacaoParecerResponse | null = null;
              let tramitacaoReferenciada: TramitacaoResponse | null = null;
              
              const idTramitacaoReferenciada = parecerTramitacaoMap.get(parecer.idSolicitacaoParecer);
              if (idTramitacaoReferenciada) {
                tramitacaoReferenciada = tramitacoesMap.get(idTramitacaoReferenciada) || null;
              }
              
              if (!tramitacaoReferenciada) {
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
              
              let areasResponsavel = parecer.responsavel?.areas || [];
              
              if (areasResponsavel.length === 0 && parecer.responsavel?.idResponsavel) {
                const responsavelCompleto = responsaveis.find(
                  (r) => r.idResponsavel === parecer.responsavel?.idResponsavel
                );
                if (responsavelCompleto?.areas) {
                  areasResponsavel = responsavelCompleto.areas;
                }
              }
              
              let area = 'Regulatório';
              if (areasResponsavel.length > 0) {
                if (areasResponsavel.length > 1 && areaAtribuida) {
                  const areaAtribuidaEncontrada = areasResponsavel.find(
                    (respArea) => respArea.area?.idArea === areaAtribuida.idArea
                  );
                  
                  if (areaAtribuidaEncontrada) {
                    area = areaAtribuida.nmArea;
                  } else {
                    area = areasResponsavel[0]?.area?.nmArea || 'Regulatório';
                  }
                } else {
                  area = areasResponsavel[0]?.area?.nmArea || 'Regulatório';
                }
              }
              
              const podeDeletar = !!(idResponsavelLogado && 
                                  parecer.responsavel?.idResponsavel && 
                                  parecer.responsavel.idResponsavel === idResponsavelLogado);

              return (
                <CardComentario
                  key={parecer.idSolicitacaoParecer}
                  parecer={parecer}
                  comentarioReferenciado={comentarioReferenciado}
                  tramitacaoReferenciada={tramitacaoReferenciada}
                  parts={parts}
                  dataFormatada={dataFormatada}
                  autor={autor}
                  area={area}
                  podeDeletar={podeDeletar}
                  onResponder={onResponder}
                  onDeletar={(id) => setParecerParaDeletar(id)}
                  onScrollToComment={handleScrollToComment}
                  onScrollToTramitacao={handleScrollToTramitacao}
                />
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

