'use client';

import { Document, Image, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer';
import { useEffect, useMemo, useRef, useState } from 'react';
import { formatDateTimeBrCompactExport, formatDateBr, formatDateTimeBr } from '@/utils/utils';
import { ObrigacaoDetalheResponse } from '@/api/obrigacao/types';
import { TipoEnum } from '@/api/tipos/types';
import { TipoDocumentoAnexoEnum } from '@/api/anexos/type';
import { TramitacaoResponse } from '@/api/tramitacoes/types';
import { SolicitacaoParecerResponse } from '@/api/solicitacao-parecer/types';
import { AnexoResponse } from '@/api/anexos/type';
import statusSolicitacaoClient from '@/api/status-solicitacao/client';

interface ExportHistoricoObrigacaoPdfProps {
  detalhe: ObrigacaoDetalheResponse;
  onDone?: () => void;
}

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 9, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  logo: { width: 70, marginRight: 12 },
  titleWrap: { flexDirection: 'column' },
  title: { fontSize: 16, fontWeight: 700 },
  subtitle: { fontSize: 9, marginTop: 2, color: '#555' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginTop: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 11, fontWeight: 700, marginTop: 12, marginBottom: 4 },
  subsectionTitle: { fontSize: 9, fontWeight: 600, marginTop: 8, marginBottom: 4, color: '#374151' },
  block: { padding: 10, borderRadius: 6, backgroundColor: '#f8fafc', marginBottom: 8 },
  row: { flexDirection: 'row', marginTop: 6 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  colLabel: { width: '25%', color: '#6b7280' },
  colLabelBold: { width: '25%', color: '#111827', fontWeight: 700 },
  colValue: { width: '75%', color: '#111827' },
  item: { padding: 10, backgroundColor: '#f9fafb', borderRadius: 6, marginTop: 8, borderLeftColor: '#2563eb', borderLeftWidth: 3 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  pill: { backgroundColor: '#e0e7ff', color: '#1e40af', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, fontSize: 9, fontWeight: 700 },
  itemTitle: { fontSize: 10, fontWeight: 700 },
  small: { fontSize: 8.5, color: '#4b5563' },
  smallBold: { fontSize: 8.5, color: '#4b5563', fontWeight: 700 },
  smallItalic: { fontSize: 8.5, color: '#4b5563', fontStyle: 'italic' },
  footer: { position: 'absolute', left: 28, right: 28, bottom: 12, fontSize: 8.5, color: '#6b7280', flexDirection: 'row', justifyContent: 'space-between' },
  anexoItem: { padding: 8, backgroundColor: '#f0f9ff', borderRadius: 4, marginTop: 6, borderLeftColor: '#0ea5e9', borderLeftWidth: 2 },
  justificativaBlock: { padding: 10, backgroundColor: '#fef3c7', borderRadius: 6, marginTop: 8, borderLeftColor: '#f59e0b', borderLeftWidth: 3 },
  referenciaBlock: { padding: 8, backgroundColor: '#f3f4f6', borderRadius: 4, marginBottom: 8, borderLeftColor: '#9333ea', borderLeftWidth: 3 },
  mentionText: { color: '#9333ea', fontWeight: 600 },
  linkText: { color: '#2563eb', textDecoration: 'underline' },
  infoNote: { fontSize: 7.5, color: '#6b7280', fontStyle: 'italic', marginTop: 4 },
  emptyMessage: { fontSize: 8.5, color: '#9ca3af', fontStyle: 'italic', marginTop: 4, marginBottom: 4 },
});


interface HistoricoItem {
  tipo: 'tramitacao' | 'parecer' | 'anexo';
  data: string;
  tramitacao?: TramitacaoResponse;
  parecer?: SolicitacaoParecerResponse;
  anexo?: AnexoResponse;
}

function HistoricoObrigacaoPdfDoc({ detalhe, statusMap }: { detalhe: ObrigacaoDetalheResponse; statusMap: Map<number, string> }) {
  const nowStr = useMemo(() => new Date().toLocaleString('pt-BR'), []);
  const layoutClient = process.env.NEXT_PUBLIC_LAYOUT_CLIENT || "way262";
  let labelTitle = "";
  
  if (layoutClient === "way262") {
    labelTitle = "Way 262";
  } else if (layoutClient === "mvp") {
    labelTitle = "RTech";
  }

  const obrigacao = detalhe.obrigacao;
  const areaAtribuida = obrigacao.areas?.find((area) => area.tipoArea?.cdTipo === TipoEnum.ATRIBUIDA);
  const areasCondicionantes = obrigacao.areas?.filter((area) => area.tipoArea?.cdTipo === TipoEnum.CONDICIONANTE) ?? [];
  
  // Prioridade: área atribuída > área condicionante > primeira área do responsável
  const getAreaComentario = (parecer: SolicitacaoParecerResponse): string => {
    const areasResponsavel = parecer.responsavel?.areas || [];
    
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
    
    return area;
  };
  
  const historicoItems: HistoricoItem[] = useMemo(() => {
    const items: HistoricoItem[] = [];

    detalhe.tramitacoes?.forEach(tramitacao => {
      // Regra: tramitações de nível 1 não aparecem (são criadas automaticamente no parecer)
      const tramitacaoComNivel = tramitacao as TramitacaoResponse & { nrNivel?: number };
      if (tramitacaoComNivel.nrNivel === 1) {
        return;
      }
      
      const dataTramitacao = tramitacao.tramitacaoAcao?.[0]?.dtCriacao || 
                             tramitacao.solicitacao?.dtCriacao || 
                             '';
      if (dataTramitacao) {
        items.push({
          tipo: 'tramitacao',
          data: dataTramitacao,
          tramitacao,
        });
      }
    });

    detalhe.solicitacaoParecer?.forEach(parecer => {
      if (!parecer || !parecer.idSolicitacaoParecer) return;
      
      const dataParecer = parecer.dtCriacao;
      
      if (parecer.dsDarecer) {
        items.push({
          tipo: 'parecer',
          data: dataParecer || new Date().toISOString(),
          parecer,
        });
      }
    });

    detalhe.anexos?.forEach(anexo => {
      // Regra: excluir anexos comuns (tipo C) do histórico
      if (anexo.tpDocumento !== TipoDocumentoAnexoEnum.C && anexo.dtCriacao) {
        items.push({
          tipo: 'anexo',
          data: anexo.dtCriacao,
          anexo,
        });
      }
    });

    return items.sort((a, b) => {
      const dataA = a.data ? new Date(a.data).getTime() : 0;
      const dataB = b.data ? new Date(b.data).getTime() : 0;
      if (isNaN(dataA) && isNaN(dataB)) return 0;
      if (isNaN(dataA)) return 1;
      if (isNaN(dataB)) return -1;
      return dataB - dataA;
    });
  }, [detalhe]);

  const anexosPorTipo = useMemo(() => {
    // Regra: Evidência de Cumprimento inclui tanto tipo E quanto tipo L (Links)
    const grupos: Record<string, AnexoResponse[]> = {
      [TipoDocumentoAnexoEnum.P]: [],
      [TipoDocumentoAnexoEnum.E]: [],
      [TipoDocumentoAnexoEnum.R]: [],
      [TipoDocumentoAnexoEnum.A]: [],
    };

    detalhe.anexos?.forEach(anexo => {
      if (!anexo || !anexo.tpDocumento) return;
      
      if (anexo.tpDocumento !== TipoDocumentoAnexoEnum.C) {
        const tipo = anexo.tpDocumento as TipoDocumentoAnexoEnum;
        
        if (tipo === TipoDocumentoAnexoEnum.E || tipo === TipoDocumentoAnexoEnum.L) {
          grupos[TipoDocumentoAnexoEnum.E].push(anexo);
        } else if (grupos[tipo]) {
          grupos[tipo].push(anexo);
        }
      }
    });

    return grupos;
  }, [detalhe.anexos]);

  const getNomeTipoDocumento = (tipo: TipoDocumentoAnexoEnum): string => {
    const nomes: Partial<Record<TipoDocumentoAnexoEnum, string>> = {
      [TipoDocumentoAnexoEnum.P]: 'Protocolo',
      [TipoDocumentoAnexoEnum.E]: 'Evidência de Cumprimento',
      [TipoDocumentoAnexoEnum.A]: 'Outros Arquivos',
      [TipoDocumentoAnexoEnum.R]: 'Correspondência',
      [TipoDocumentoAnexoEnum.L]: 'Link',
    };
    return nomes[tipo] || 'Documento';
  };

  const getTipoArquivo = (anexo: AnexoResponse): string => {
    if (anexo.tpDocumento === TipoDocumentoAnexoEnum.L) {
      return 'Link';
    }
    const extensao = anexo.nmArquivo?.split('.').pop()?.toUpperCase() || '';
    return extensao || 'Arquivo';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={`/images/${layoutClient}-logo.png`} style={styles.logo} />
          <View style={styles.titleWrap}>
            <Text style={[styles.title, { fontWeight: 800 }]}>Histórico da Obrigação</Text>
            <Text style={styles.subtitle}>Data de exportação: {nowStr}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Dados da Obrigação</Text>
        <View style={styles.block} wrap={false}>
          <View style={styles.row}>
            <Text style={styles.colLabelBold}>ID:</Text>
            <Text style={styles.colValue}>{obrigacao.cdIdentificacao || obrigacao.idSolicitacao}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.colLabelBold}>Tarefa:</Text>
            <Text style={styles.colValue}>{obrigacao.dsTarefa || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.colLabelBold}>Área Condicionante:</Text>
            <Text style={styles.colValue}>
              {areasCondicionantes.length > 0 
                ? areasCondicionantes.map(a => a.nmArea).join(', ')
                : '—'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.colLabelBold}>Tema:</Text>
            <Text style={styles.colValue}>{obrigacao.tema?.nmTema || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.colLabelBold}>Classificação:</Text>
            <Text style={styles.colValue}>{obrigacao.tipoClassificacao?.dsTipo || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.colLabelBold}>Periodicidade:</Text>
            <Text style={styles.colValue}>{obrigacao.tipoPeriodicidade?.dsTipo || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.colLabelBold}>Criticidade:</Text>
            <Text style={styles.colValue}>{obrigacao.tipoCriticidade?.dsTipo || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.colLabelBold}>Natureza:</Text>
            <Text style={styles.colValue}>{obrigacao.tipoNatureza?.dsTipo || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.colLabelBold}>Data de Início:</Text>
            <Text style={styles.colValue}>{obrigacao.dtInicio ? formatDateBr(obrigacao.dtInicio) : '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.colLabelBold}>Data Limite:</Text>
            <Text style={styles.colValue}>{obrigacao.dtLimite ? formatDateBr(obrigacao.dtLimite) : '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.colLabelBold}>Data de Conclusão:</Text>
            <Text style={styles.colValue}>
              {obrigacao.dtConclusaoTramitacao 
                ? formatDateTimeBr(obrigacao.dtConclusaoTramitacao) 
                : '—'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.colLabelBold}>Status Atual:</Text>
            <Text style={styles.colValue}>{obrigacao.statusSolicitacao?.nmStatus || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.colLabelBold}>Responsável Técnico:</Text>
            <Text style={styles.colValue}>{obrigacao.responsavelTecnico?.nmResponsavel || '—'}</Text>
          </View>
          {obrigacao.obrigacaoPrincipal && (
            <View style={styles.row}>
              <Text style={styles.colLabelBold}>Obrigação Principal:</Text>
              <Text style={styles.colValue}>
                {obrigacao.obrigacaoPrincipal.cdIdentificacao || obrigacao.obrigacaoPrincipal.idSolicitacao || '—'}
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Histórico de Movimentações e Comentários</Text>
        {(() => {
          const itemsParaExibir = historicoItems.filter(item => item.tipo === 'parecer' || item.tipo === 'tramitacao');
          
          if (itemsParaExibir.length === 0) {
            return <Text style={styles.emptyMessage}>Nenhum comentário registrado até o momento.</Text>;
          }
          
          return (() => {
          const pareceresMap = new Map(
            detalhe.solicitacaoParecer?.map(p => [p.idSolicitacaoParecer, p]) || []
          );
          
          const tramitacoesMap = new Map(
            detalhe.tramitacoes?.map(t => [t.idTramitacao, t]) || []
          );
                    
          // Mapa para identificar menções @username nos comentários
          const nomesResponsaveisMap = new Map<string, string>();
          detalhe.solicitacaoParecer?.forEach(p => {
            if (p.responsavel?.nmResponsavel) {
              const nomeLower = p.responsavel.nmResponsavel.trim().toLowerCase();
              nomesResponsaveisMap.set(nomeLower, p.responsavel.nmResponsavel.trim());
            }
          });
          detalhe.tramitacoes?.forEach(t => {
            const responsavel = t.tramitacaoAcao?.[0]?.responsavelArea?.responsavel;
            if (responsavel?.nmResponsavel) {
              const nomeLower = responsavel.nmResponsavel.trim().toLowerCase();
              nomesResponsaveisMap.set(nomeLower, responsavel.nmResponsavel.trim());
            }
          });
          
          // Processa texto identificando menções @username e destacando em roxo
          const processarMensagem = (texto: string): (string | { type: 'mention'; name: string; isValid: boolean })[] => {
            const parts: (string | { type: 'mention'; name: string; isValid: boolean })[] = [];
            
            if (!texto) {
              parts.push('');
              return parts;
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
            
            return parts;
          };
          
          return itemsParaExibir.map((item, index) => {
            if (item.tipo === 'tramitacao' && item.tramitacao) {
              const tramitacao = item.tramitacao;
              const responsavelTramitacao = tramitacao.tramitacaoAcao?.[0]?.responsavelArea?.responsavel;
              const dataFormatada = item.data ? formatDateTimeBr(item.data) : '—';
              const areaTramitacao = tramitacao.areaOrigem?.nmArea || 'Regulatório';
              
              return (
                <View key={`tramitacao-${tramitacao.idTramitacao}-${index}`} style={styles.item} wrap={false}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.pill}>{areaTramitacao.toUpperCase()}</Text>
                    <Text style={styles.small}>{dataFormatada}</Text>
                  </View>
                  {tramitacao.dsObservacao && tramitacao.dsObservacao.trim() !== '' && (
                    <Text style={[styles.small, { marginTop: 4, marginBottom: 4 }]}>
                      {tramitacao.dsObservacao}
                    </Text>
                  )}
                  <View style={{ marginTop: 4 }}>
                    <Text style={styles.small}>
                      <Text style={styles.smallBold}>Responsável:</Text> {responsavelTramitacao?.nmResponsavel || '—'}
                    </Text>
                    <Text style={styles.small}>
                      <Text style={styles.smallBold}>Status:</Text> {(() => {
                        const tramitacaoComStatus = tramitacao as TramitacaoResponse & { idStatusSolicitacao?: number };
                        const idStatus = tramitacaoComStatus.idStatusSolicitacao || tramitacao.solicitacao?.statusSolicitacao?.idStatusSolicitacao;
                        return idStatus ? (statusMap.get(idStatus) || tramitacao.solicitacao?.statusSolicitacao?.nmStatus || '—') : (tramitacao.solicitacao?.statusSolicitacao?.nmStatus || '—');
                      })()}
                    </Text>
                  </View>
                </View>
              );
            }

            if (item.tipo === 'parecer' && item.parecer) {
              const parecer = item.parecer;
              const dataFormatada = item.data ? formatDateTimeBr(item.data) : '—';
              const areaComentario = getAreaComentario(parecer);
              
              // Regra: priorizar referência de tramitação sobre referência de comentário
              let comentarioReferenciado: SolicitacaoParecerResponse | null = null;
              let tramitacaoReferenciada: TramitacaoResponse | null = null;
              
              if (parecer.idTramitacao) {
                tramitacaoReferenciada = tramitacoesMap.get(parecer.idTramitacao) || null;
              }
              
              if (!tramitacaoReferenciada) {
                if (parecer.solicitacaoParecerReferen) {
                  if (Array.isArray(parecer.solicitacaoParecerReferen) && parecer.solicitacaoParecerReferen.length > 0) {
                    comentarioReferenciado = parecer.solicitacaoParecerReferen[0];
                  } else if (!Array.isArray(parecer.solicitacaoParecerReferen)) {
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
              
              const mensagem = parecer.dsDarecer || '';
              const parts = processarMensagem(mensagem);
              
              return (
                <View key={`parecer-${parecer.idSolicitacaoParecer}-${index}`} style={styles.item} wrap={false}>
                  {tramitacaoReferenciada ? (
                    <View style={styles.referenciaBlock} wrap={false}>
                      <Text style={[styles.small, { color: '#9333ea', fontWeight: 700, marginBottom: 2 }]}>
                        {tramitacaoReferenciada.tramitacaoAcao?.[0]?.responsavelArea?.responsavel?.nmResponsavel || 'Usuário'}
                      </Text>
                      <Text style={styles.small}>
                        {tramitacaoReferenciada.dsObservacao || 'Tramitação referenciada'}
                      </Text>
                    </View>
                  ) : comentarioReferenciado ? (
                    <View style={styles.referenciaBlock} wrap={false}>
                      <Text style={[styles.small, { color: '#9333ea', fontWeight: 700, marginBottom: 2 }]}>
                        {comentarioReferenciado.responsavel?.nmResponsavel || 'Usuário'}
                      </Text>
                      <Text style={styles.small}>
                        {comentarioReferenciado.dsDarecer || 'Comentário referenciado'}
                      </Text>
                    </View>
                  ) : null}
                  
                  <View style={styles.itemHeader}>
                    <Text style={styles.pill}>{areaComentario.toUpperCase()}</Text>
                    <Text style={styles.small}>{dataFormatada}</Text>
                  </View>
                  
                  <Text style={[styles.small, { marginTop: 4, marginBottom: 4 }]}>
                    {parts.map((part, idx) => {
                      if (typeof part === 'object' && 'type' in part && part.type === 'mention') {
                        if (part.isValid) {
                          return (
                            <Text key={idx} style={styles.mentionText}>
                              @{part.name}
                            </Text>
                          );
                        } else {
                          return (
                            <Text key={idx}>
                              @{part.name}
                            </Text>
                          );
                        }
                      }
                      return <Text key={idx}>{String(part)}</Text>;
                    })}
                  </Text>
                  
                  <View style={{ marginTop: 4 }}>
                    <Text style={styles.small}>
                      <Text style={styles.smallBold}>Responsável:</Text> {parecer.responsavel?.nmResponsavel || '—'}
                    </Text>
                    <Text style={styles.small}>
                      <Text style={styles.smallBold}>Status:</Text> {statusMap.get(parecer.idStatusSolicitacao) || obrigacao.statusSolicitacao?.nmStatus || '—'}
                    </Text>
                  </View>
                </View>
              );
            }

            return null;
          });
          })();
        })()}

        {obrigacao.dsJustificativaAtraso && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Justificativa de Atraso</Text>
            <View style={styles.justificativaBlock} wrap={false}>
              <Text style={styles.small}>
                <Text style={styles.smallBold}>Texto da justificativa:</Text>
              </Text>
              <Text style={[styles.small, { marginTop: 4, marginBottom: 6 }]}>
                {obrigacao.dsJustificativaAtraso}
              </Text>
              <Text style={styles.small}>
                <Text style={styles.smallBold}>Responsável:</Text> {obrigacao.responsavelJustifAtraso?.nmResponsavel || '—'}
              </Text>
              <Text style={styles.small}>
                <Text style={styles.smallBold}>Data/hora:</Text> {obrigacao.dtJustificativaAtraso ? formatDateTimeBr(obrigacao.dtJustificativaAtraso) : '—'}
              </Text>
              <Text style={styles.small}>
                <Text style={styles.smallBold}>Status:</Text> Atrasada
              </Text>
            </View>
          </>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Anexos</Text>
        {(() => {
          // Ordem de exibição: Protocolo > Evidência de Cumprimento > Correspondência > Outros Arquivos
          const ordemTipos = [
            TipoDocumentoAnexoEnum.P,
            TipoDocumentoAnexoEnum.E,
            TipoDocumentoAnexoEnum.R,
            TipoDocumentoAnexoEnum.A,
          ];

          const secoes = ordemTipos.map(tipo => {
            const anexos = anexosPorTipo[tipo] || [];
            const nomeTipo = getNomeTipoDocumento(tipo);
            
            return (
              <View key={`tipo-${tipo}`} wrap={false}>
                <Text style={styles.subsectionTitle}>{nomeTipo}</Text>
                {anexos.length === 0 ? (
                  <Text style={styles.emptyMessage}>
                    {tipo === TipoDocumentoAnexoEnum.E 
                      ? 'Não há anexos ou links de evidências de cumprimento registrados.'
                      : tipo === TipoDocumentoAnexoEnum.A
                      ? 'Não há outros arquivos registrados.'
                      : tipo === TipoDocumentoAnexoEnum.P
                      ? 'Não há protocolos registrados.'
                      : tipo === TipoDocumentoAnexoEnum.R
                      ? 'Não há correspondências registradas.'
                      : 'Não há arquivos registrados.'}
                  </Text>
                ) : (
                  anexos
                    .filter(anexo => anexo && anexo.idAnexo)
                    .map((anexo, index) => {
                      if (!anexo) return null;
                      
                      const dataFormatada = anexo.dtCriacao ? formatDateTimeBr(anexo.dtCriacao) : '—';
                      const tipoArquivo = getTipoArquivo(anexo);
                      const isLink = anexo.tpDocumento === TipoDocumentoAnexoEnum.L;
                      
                      return (
                        <View key={`anexo-${anexo.idAnexo}-${index}`} style={styles.anexoItem} wrap={false}>
                          {!isLink && anexo.nmArquivo && (
                            <Text style={styles.small}>
                              <Text style={styles.smallBold}>Nome do arquivo:</Text> {anexo.nmArquivo}
                            </Text>
                          )}
                          {!isLink && tipoArquivo && (
                            <Text style={styles.small}>
                              <Text style={styles.smallBold}>Tipo do arquivo:</Text> {tipoArquivo}
                            </Text>
                          )}
                          {isLink && anexo.dsCaminho && (
                            <Text style={styles.small}>
                              <Text style={styles.smallBold}>Link:</Text> {anexo.dsCaminho}
                            </Text>
                          )}
                          <Text style={styles.small}>
                            <Text style={styles.smallBold}>Responsável:</Text> {anexo.responsavel?.nmResponsavel || anexo.nmUsuario || '—'}
                          </Text>
                          <Text style={styles.small}>
                            <Text style={styles.smallBold}>Data/hora:</Text> {dataFormatada}
                          </Text>
                        </View>
                      );
                    })
                    .filter(item => item !== null)
                )}
              </View>
            );
          });

          const temAnexos = ordemTipos.some(tipo => (anexosPorTipo[tipo] || []).length > 0);
          
          if (!temAnexos) {
            return (
              <Text style={styles.emptyMessage}>Não há anexos registrados para esta obrigação.</Text>
            );
          }

          return secoes;
        })()}

        <View style={styles.footer} fixed>
          <Text>{labelTitle}</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export default function ExportHistoricoObrigacaoPdf({ detalhe, onDone }: ExportHistoricoObrigacaoPdfProps) {
  const [statusMap, setStatusMap] = useState<Map<number, string>>(new Map());
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Busca status pelo idStatusSolicitacao de cada parecer/tramitação para exibir o status correto no momento da criação
  useEffect(() => {
    const buscarStatus = async () => {
      try {
        setLoadingStatus(true);
        const idsStatusUnicos = new Set<number>();

        detalhe.solicitacaoParecer?.forEach(p => {
          if (p.idStatusSolicitacao) {
            idsStatusUnicos.add(p.idStatusSolicitacao);
          }
        });

        detalhe.tramitacoes?.forEach(t => {
          if (t.solicitacao?.statusSolicitacao?.idStatusSolicitacao) {
            idsStatusUnicos.add(t.solicitacao.statusSolicitacao.idStatusSolicitacao);
          }
          const tramitacaoComStatus = t as TramitacaoResponse & { idStatusSolicitacao?: number };
          if (tramitacaoComStatus.idStatusSolicitacao) {
            idsStatusUnicos.add(tramitacaoComStatus.idStatusSolicitacao);
          }
        });

        const statusPromises = Array.from(idsStatusUnicos).map(id => 
          statusSolicitacaoClient.buscarPorId(id).catch(() => null)
        );

        const statusResults = await Promise.all(statusPromises);
        const novoStatusMap = new Map<number, string>();

        statusResults.forEach((status, index) => {
          if (status) {
            const id = Array.from(idsStatusUnicos)[index];
            novoStatusMap.set(id, status.nmStatus);
          }
        });

        if (detalhe.obrigacao.statusSolicitacao?.idStatusSolicitacao && detalhe.obrigacao.statusSolicitacao?.nmStatus) {
          novoStatusMap.set(detalhe.obrigacao.statusSolicitacao.idStatusSolicitacao, detalhe.obrigacao.statusSolicitacao.nmStatus);
        }

        setStatusMap(novoStatusMap);
      } catch (error) {
        console.error('Erro ao buscar status:', error);
        const fallbackMap = new Map<number, string>();
        if (detalhe.obrigacao.statusSolicitacao?.idStatusSolicitacao && detalhe.obrigacao.statusSolicitacao?.nmStatus) {
          fallbackMap.set(detalhe.obrigacao.statusSolicitacao.idStatusSolicitacao, detalhe.obrigacao.statusSolicitacao.nmStatus);
        }
        setStatusMap(fallbackMap);
      } finally {
        setLoadingStatus(false);
      }
    };

    buscarStatus();
  }, [detalhe]);

  const doc = useMemo(() => {
    if (loadingStatus) return undefined;
    return <HistoricoObrigacaoPdfDoc detalhe={detalhe} statusMap={statusMap} />;
  }, [detalhe, statusMap, loadingStatus]);

  const startedRef = useRef(false);
  const downloadedRef = useRef(false);

  useEffect(() => {
    async function generate() {
      if (startedRef.current || downloadedRef.current || loadingStatus || !doc) return;
      startedRef.current = true;
      try {
        const blob = await pdf(doc).toBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const idObrigacao = detalhe.obrigacao.cdIdentificacao || detalhe.obrigacao.idSolicitacao;
        a.download = `historico_obrigacao_${idObrigacao}_${formatDateTimeBrCompactExport()}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        downloadedRef.current = true;
        onDone?.();
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        onDone?.();
      }
    }
    generate();
  }, [doc, detalhe.obrigacao.idSolicitacao, detalhe.obrigacao.cdIdentificacao, onDone, loadingStatus]);

  return null;
}