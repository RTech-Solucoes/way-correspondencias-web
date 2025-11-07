'use client';

import { Document, Image, Page, StyleSheet, Text, View, pdf, Svg, Polyline } from '@react-pdf/renderer';
import { useEffect, useMemo, useRef } from 'react';
import { HistoricoRespostaItemResponse, TipoHistoricoResposta } from '@/api/solicitacoes/types';
import { formatDateTime, formatDateTimeBrCompactExport, formatMinutosEmDiasHorasMinutos } from '@/utils/utils';
import { SolicitacaoResumoResponse } from '@/types/solicitacoes/types';
import { perfilUtil } from '@/api/perfis/types';
import { statusList } from '@/api/status-solicitacao/types';

interface ExportHistoricoPdfProps {
  solicitacao: SolicitacaoResumoResponse;
  historico: HistoricoRespostaItemResponse[];
  onDone?: () => void;
}

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 9, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  logo: { width: 70, marginRight: 12 },
  titleWrap: { flexDirection: 'column' },
  title: { fontSize: 16, fontWeight: 700 },
  subtitle: { fontSize: 9, marginTop: 2, color: '#555' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginTop: 8 },
  sectionTitle: { fontSize: 11, fontWeight: 700, marginTop: 12, marginBottom: 4 },
  block: { padding: 10, borderRadius: 6, backgroundColor: '#f8fafc' },
  row: { flexDirection: 'row', marginTop: 6 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  colLabel: { width: '22%', color: '#6b7280' },
  colLabelBold: { width: '22%', color: '#111827', fontWeight: 700 },
  colValue: { width: '78%', color: '#111827' },
  item: { padding: 10, backgroundColor: '#f9fafb', borderRadius: 6, marginTop: 8, borderLeftColor: '#2563eb', borderLeftWidth: 3 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  pill: { backgroundColor: '#e0e7ff', color: '#1e40af', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, fontSize: 9, fontWeight: 700 },
  itemTitle: { fontSize: 10, fontWeight: 700 },
  small: { fontSize: 8.5, color: '#4b5563' },
  smallBold: { fontSize: 8.5, color: '#4b5563', fontWeight: 700 },
  smallItalic: { fontSize: 8.5, color: '#4b5563', fontStyle: 'italic' },
  footer: { position: 'absolute', left: 28, right: 28, bottom: 12, fontSize: 8.5, color: '#6b7280', flexDirection: 'row', justifyContent: 'space-between' },
});

function HistoricoPdfDoc({ solicitacao, historico }: { solicitacao: SolicitacaoResumoResponse; historico: HistoricoRespostaItemResponse[] }) {
const ArrowRight = () => (
    <Svg width={10} height={10} viewBox="0 0 24 24">
    <Polyline points="8 4 16 12 8 20" fill="none" stroke="#4b5563" strokeWidth={2} />
    </Svg>
    );
    
const getAreasLabel = (nmAreas: string): string => {
    return nmAreas
        .split(',')
        .map((area) => area.trim())
        .filter(Boolean)
        .join(', ');
    };

const getParecerLabel = (idPerfil?: number | null) => {
    if (idPerfil === perfilUtil.VALIDADOR_ASSINANTE) {
      return 'DIRETORIA (PARECER)';
    }
    if (idPerfil === perfilUtil.ADMINISTRADOR || idPerfil === perfilUtil.GESTOR_DO_SISTEMA) {
      return 'REGULATÓRIO (PARECER)';
    }
    return 'PARECER';
  };
    
const nowStr = useMemo(() => new Date().toLocaleString('pt-BR'), []);
  const layoutClient = process.env.NEXT_PUBLIC_LAYOUT_CLIENT || "way262";
  let labelTitle = "";
  
  if (layoutClient === "way262") {
    labelTitle = "Way 262";
  } else if (layoutClient === "mvp") {
    labelTitle = "RTech";
  }

return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={`/images/${layoutClient}-logo.png`} style={styles.logo} />
          <View style={styles.titleWrap}>
            <Text style={[styles.title, { fontWeight: 800 }]}>Histórico de Respostas</Text>
            <Text style={styles.subtitle}>Data de exportação: {nowStr}</Text>
            <Text style={styles.subtitle}>Total de Respostas: {historico.length}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Dados da Solicitação</Text>
        <View style={styles.block} wrap={false}>
            <View style={styles.row}><Text style={styles.colLabelBold}>Identificação:</Text><Text style={styles.colValue}>{solicitacao.cdIdentificacao}</Text></View>
            <View style={styles.row}><Text style={styles.colLabelBold}>Assunto:</Text><Text style={styles.colValue}>{solicitacao.dsAssunto}</Text></View>
            <View style={styles.row}><Text style={styles.colLabelBold}>Tema:</Text><Text style={styles.colValue}>{solicitacao.nmTema}</Text></View>
            <View style={styles.row}><Text style={styles.colLabelBold}>Áreas:</Text><Text style={styles.colValue}>{getAreasLabel(solicitacao.nmAreas)}</Text></View>
            <View style={styles.row}><Text style={styles.colLabelBold}>Status:</Text><Text style={styles.colValue}>{solicitacao.nmStatus}</Text></View>
            <View style={styles.row}><Text style={styles.colLabelBold}>Data de Criação:</Text><Text style={styles.colValue}>{formatDateTime(solicitacao.dtCriacao)}</Text></View>
            <View style={styles.row}><Text style={styles.colLabelBold}>Data da 1ª Tramitação:</Text><Text style={styles.colValue}>{formatDateTime(solicitacao.dtPrimeiraTramitacao)}</Text></View>
            <View style={styles.row}><Text style={styles.colLabelBold}>Data do Prazo Limite:</Text><Text style={styles.colValue}>{formatDateTime(solicitacao.dtPrazoLimite)}</Text></View>
            {solicitacao.dtConclusaoTramitacao &&
                <View style={styles.row}>
                    <Text style={styles.colLabelBold}>Data de Conclusão:</Text>
                    <Text style={styles.colValue}>{formatDateTime(solicitacao.dtConclusaoTramitacao)}</Text>
                </View>
            }
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={[styles.sectionTitle, { fontWeight: 800 }]}>Histórico de Respostas</Text>
          {historico.length === 0 ? (
            <Text style={styles.small}>Sem registros</Text>
          ) : (
            historico.map((h) => (
              <View key={`${h.tipo}-${h.id}`} style={styles.item} wrap={false}>
                    <View style={styles.itemHeader}>
                        {h.tipo === TipoHistoricoResposta.TRAMITACAO && (
                        <View style={styles.rowWrap}>
                            <Text style={[styles.pill, { marginRight: 4 }]}>{h?.areaOrigem?.nmArea || '—'} </Text>
                            <ArrowRight />
                            <Text style={[styles.pill, { marginLeft: 4 }]}> {h?.areaDestino?.nmArea || '—'}</Text>
                        </View>
                        )}
                        {h.tipo === TipoHistoricoResposta.PARECER && (
                        <Text style={styles.pill}>
                          {getParecerLabel(h?.responsavel?.perfil?.idPerfil)}
                        </Text>
                        )}
                    <Text style={styles.small}>{formatDateTime(h.dtCriacao)}</Text>
                    </View>
                    { h.dsDescricao && h.dsDescricao.trim() !== ''
                        ? <Text style={[styles.small, { marginTop: 4 }, { marginBottom: 4 }]}>{h.dsDescricao}</Text>
                        : <Text style={styles.smallItalic}>
                            {h.nmStatus ===  statusList.PRE_ANALISE.label 
                              ? 'Solicitação Encaminhada para Gerente do Regulatório' 
                              : h.nmStatus === statusList.EM_ANALISE_GERENTE_REGULATORIO.label
                              ? 'Solicitação Encaminhada para Gerente do Sistema' 
                              : h.nmStatus === statusList.CONCLUIDO.label
                              ? 'Solicitação Arquivada' 
                              : 'A solicitação foi direcionada para a(s) área(s) responsável(is)'}
                          </Text>
                    }
                <View style={{ marginTop: 4 }}>
                  <Text style={styles.small}><Text style={styles.smallBold}>Responsável:</Text> {h?.responsavel?.nmResponsavel || '—'}</Text>
                  <Text style={styles.small}><Text style={styles.smallBold}>Status:</Text> {h.nmStatus}</Text>
                  {typeof h.nrTempoGasto === 'number' ? (
                    <Text style={styles.small}><Text style={styles.smallBold}>Tempo de resposta:</Text> {formatMinutosEmDiasHorasMinutos(h.nrTempoGasto)}</Text>
                  ) : null}
                  {h.flAprovado && (
                    <Text style={styles.small}><Text style={styles.smallBold}>Aprovado:</Text> {h.flAprovado === 'S' ? 'Sim' : 'Não'}</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text>{labelTitle}</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}` } />
        </View>
      </Page>
    </Document>
  );
}

export default function ExportHistoricoPdf({ solicitacao, historico, onDone }: ExportHistoricoPdfProps) {
  const doc = useMemo(() => (
    <HistoricoPdfDoc solicitacao={solicitacao} historico={historico} />
  ), [solicitacao, historico]);

  const startedRef = useRef(false);
  const downloadedRef = useRef(false);

  useEffect(() => {
    async function generate() {
      if (startedRef.current || downloadedRef.current) return;
      startedRef.current = true;
      try {
        const blob = await pdf(doc).toBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `historico_tramitacao_export_${solicitacao.idSolicitacao}_${formatDateTimeBrCompactExport()}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        downloadedRef.current = true;
      } finally {
        onDone?.();
      }
    }
    generate();
  }, [doc, solicitacao.idSolicitacao, solicitacao.dtCriacao, onDone]);

  return null;
}


