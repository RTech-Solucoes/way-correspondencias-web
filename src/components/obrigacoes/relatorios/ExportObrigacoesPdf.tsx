'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Document, Page, StyleSheet, Text, View, pdf, Image } from '@react-pdf/renderer';
import { toast } from 'sonner';
import obrigacaoClient, { PaginatedResponse } from '@/api/obrigacao/client';
import { ObrigacaoFiltroRequest, ObrigacaoResponse } from '@/api/obrigacao/types';
import { formatDateBr, formatDateTimeBr, formatDateTimeBrCompactExport } from '@/utils/utils';
import { TipoEnum } from '@/api/tipos/types';

// Função auxiliar para buscar o comentário mais recente de uma obrigação
async function buscarComentarioMaisRecente(idSolicitacao: number): Promise<string> {
  try {
    const detalhe = await obrigacaoClient.buscarDetalhePorId(idSolicitacao);
    
    const comentarios: Array<{
      texto: string;
      data: string;
    }> = [];

    // Adicionar comentários de pareceres
    if (detalhe.solicitacaoParecer) {
      detalhe.solicitacaoParecer.forEach(parecer => {
        if (parecer.dsDarecer) {
          comentarios.push({
            texto: parecer.dsDarecer,
            data: parecer.dtCriacao || ''
          });
        }
      });
    }

    // Adicionar comentários de tramitações
    if (detalhe.tramitacoes) {
      detalhe.tramitacoes.forEach(tramitacao => {
        if (tramitacao.dsObservacao) {
          const dataTramitacao = tramitacao.tramitacaoAcao?.[0]?.dtCriacao || 
                                tramitacao.solicitacao?.dtCriacao || 
                                '';
          comentarios.push({
            texto: tramitacao.dsObservacao,
            data: dataTramitacao
          });
        }
      });
    }

    // Ordenar por data decrescente e pegar o primeiro
    if (comentarios.length === 0) return '';

    comentarios.sort((a, b) => {
      const dataA = a.data ? new Date(a.data).getTime() : 0;
      const dataB = b.data ? new Date(b.data).getTime() : 0;
      if (isNaN(dataA) && isNaN(dataB)) return 0;
      if (isNaN(dataA)) return 1;
      if (isNaN(dataB)) return -1;
      return dataB - dataA; // Ordem decrescente
    });

    return comentarios[0].texto || '';
  } catch (error) {
    console.error(`Erro ao buscar comentário para obrigação ${idSolicitacao}:`, error);
    return '';
  }
}

type ExportObrigacoesPdfProps = {
	filterParams: Omit<ObrigacaoFiltroRequest, 'page' | 'size' | 'sort'>;
	getStatusText: (statusCode: string) => string | null;
	isAdminOrGestor: boolean;
	onDone?: () => void;
};

const styles = StyleSheet.create({
	page: { padding: 20, fontSize: 8, fontFamily: 'Helvetica' },
	title: { fontSize: 12, marginBottom: 8, fontWeight: 700 },
	subtitle: { fontSize: 9, marginBottom: 10 },
	header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
	logo: { width: 80, marginRight: 12 },
	table: { width: 'auto', borderStyle: 'solid', borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
	row: { flexDirection: 'row', minHeight: 20 },
	cell: { borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, padding: 3, fontSize: 7, flexWrap: 'wrap' },
	head: { fontWeight: 700, backgroundColor: '#f2f2f2', fontSize: 7 },
	footer: { position: 'absolute', left: 20, right: 20, bottom: 12, fontSize: 8, color: '#555', flexDirection: 'row', justifyContent: 'space-between' },
	// colunas da tabela (base - sem campos de admin)
	c1: { width: '9%' }, // Identificação
	c2: { width: '15%' }, // Tarefa
	c3: { width: '8%' }, // Tema
	c4: { width: '8%' }, // Status
	c5: { width: '8%' }, // Área Atribuída
	c6: { width: '7%' }, // Data de Início
	c7: { width: '7%' }, // Data de Término
	c8: { width: '8%' }, // Data de Conclusão
	c9: { width: '7%' }, // Classificação
	c10: { width: '7%' }, // Periodicidade
	c11: { width: '9%' }, // Obrigação Principal
	c12: { width: '15%' }, // Comentário Mais Recente
	// Campos adicionais para admin/gestor
	c13: { width: '7%' }, // Data Limite (admin)
	c14: { width: '5%' }, // Enviado para Áreas (admin)
});

const layoutClient = process.env.NEXT_PUBLIC_LAYOUT_CLIENT || "way262";
let labelTitle = "";
  
	if (layoutClient === "way262") {
		labelTitle = "Way 262";
	} else if (layoutClient === "mvp") {
		labelTitle = "RTech";
	}
  
function ObrigacoesPdfDoc({ data, getStatusText, isAdminOrGestor, comentariosMap }: { data: ObrigacaoResponse[]; getStatusText: (code: string) => string | null; isAdminOrGestor: boolean; comentariosMap: Map<number, string> }) {
	const nowStr = useMemo(() => new Date().toLocaleString('pt-BR'), []);
	return (
		<Document>
			<Page size="A4" orientation="landscape" style={styles.page}>
				<View style={styles.header}>
					{/* eslint-disable-next-line jsx-a11y/alt-text */}
					<Image src={`/images/${layoutClient}-logo.png`} style={styles.logo} />
					<View>
						<Text style={styles.title}>Relatório de Obrigações Contratuais</Text>
						<Text style={styles.subtitle}>Data de exportação: {nowStr}</Text>
						<Text style={styles.subtitle}>Total de registros: {data.length}</Text>
					</View>
				</View>
				<View style={styles.table}>
					<View style={[styles.row, styles.head]}>
						<Text style={[styles.cell, styles.c1]} wrap>Identificação</Text>
						<Text style={[styles.cell, styles.c2]} wrap>Tarefa</Text>
						<Text style={[styles.cell, styles.c3]} wrap>Tema</Text>
						<Text style={[styles.cell, styles.c4]} wrap>Status</Text>
						<Text style={[styles.cell, styles.c5]} wrap>Área Atribuída</Text>
						<Text style={[styles.cell, styles.c6]} wrap>Data de Início</Text>
						<Text style={[styles.cell, styles.c7]} wrap>Data de Término</Text>
						{isAdminOrGestor && <Text style={[styles.cell, styles.c13]} wrap>Data Limite</Text>}
						<Text style={[styles.cell, styles.c8]} wrap>Data de Conclusão</Text>
						<Text style={[styles.cell, styles.c9]} wrap>Classificação</Text>
						<Text style={[styles.cell, styles.c10]} wrap>Periodicidade</Text>
						<Text style={[styles.cell, styles.c11]} wrap>Obrig. Principal</Text>
						{isAdminOrGestor && <Text style={[styles.cell, styles.c14]} wrap>Enviado p/ Áreas</Text>}
						<Text style={[styles.cell, styles.c12]} wrap>Comentário Mais Recente</Text>
					</View>

					{data.map((o, idx) => {
						const areaAtribuida = o.areas?.find(a => a.tipoArea?.cdTipo === TipoEnum.ATRIBUIDA)?.nmArea || '';
						const tema = o.tema?.nmTema || '';
						const status = o.statusSolicitacao?.nmStatus || getStatusText(o.statusSolicitacao?.idStatusSolicitacao?.toString() || '') || '';
						const classificacao = o.tipoClassificacao?.dsTipo || '';
						const periodicidade = o.tipoPeriodicidade?.dsTipo || '';
						
						// Obrigação Principal - mostrar ID quando for condicionada
						const obrigacaoPrincipal = o.obrigacaoPrincipal?.idSolicitacao 
							? o.obrigacaoPrincipal.cdIdentificacao || o.obrigacaoPrincipal.idSolicitacao.toString()
							: '';
						
						// Comentário Mais Recente
						const comentarioMaisRecente = o.idSolicitacao ? comentariosMap.get(o.idSolicitacao) || '' : '';
						
						const enviadoParaAreas = o.flEnviandoArea === 'S' ? 'Sim' : 'Não';
						
						return (
							<View key={idx} style={styles.row}>
								<Text style={[styles.cell, styles.c1]} wrap>{o.cdIdentificacao || ''}</Text>
								<Text style={[styles.cell, styles.c2]} wrap>{o.dsTarefa || ''}</Text>
								<Text style={[styles.cell, styles.c3]} wrap>{tema}</Text>
								<Text style={[styles.cell, styles.c4]} wrap>{status}</Text>
								<Text style={[styles.cell, styles.c5]} wrap>{areaAtribuida}</Text>
								<Text style={[styles.cell, styles.c6]} wrap>{o.dtInicio ? formatDateBr(o.dtInicio) : ''}</Text>
								<Text style={[styles.cell, styles.c7]} wrap>{o.dtTermino ? formatDateBr(o.dtTermino) : ''}</Text>
								{isAdminOrGestor && <Text style={[styles.cell, styles.c13]} wrap>{o.dtLimite ? formatDateBr(o.dtLimite) : ''}</Text>}
								<Text style={[styles.cell, styles.c8]} wrap>{o.dtConclusaoTramitacao ? formatDateTimeBr(o.dtConclusaoTramitacao) : ''}</Text>
								<Text style={[styles.cell, styles.c9]} wrap>{classificacao}</Text>
								<Text style={[styles.cell, styles.c10]} wrap>{periodicidade}</Text>
								<Text style={[styles.cell, styles.c11]} wrap>{obrigacaoPrincipal}</Text>
								{isAdminOrGestor && <Text style={[styles.cell, styles.c14]} wrap>{enviadoParaAreas}</Text>}
								<Text style={[styles.cell, styles.c12]} wrap>{comentarioMaisRecente}</Text>
							</View>
						);
					})}
				</View>

				{/* Footer with page numbers */}
				<View style={styles.footer} fixed>
					<Text>{labelTitle}</Text>
					<Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}` } />
				</View>
			</Page>
		</Document>
	);
}

export default function ExportObrigacoesPdf({ filterParams, getStatusText, isAdminOrGestor, onDone }: ExportObrigacoesPdfProps) {
	const [data, setData] = useState<ObrigacaoResponse[] | null>(null);
	const [comentariosMap, setComentariosMap] = useState<Map<number, string>>(new Map());
	const [fileName, setFileName] = useState('');
	const startedRef = useRef(false);
	const downloadedRef = useRef(false);

	const loadData = useCallback(async () => {
		try {
			const response = await obrigacaoClient.buscarLista({
				...filterParams,
				page: 0,
				size: 10000,
			});
			const lista = (response && typeof response === 'object' && 'content' in response)
				? (response as PaginatedResponse<ObrigacaoResponse>).content ?? []
				: (response as ObrigacaoResponse[]) ?? [];
			
			// Buscar comentários mais recentes para todas as obrigações em paralelo
			const comentarios = new Map<number, string>();
			const comentariosPromises = lista.map(async (o) => {
				if (o.idSolicitacao) {
					const comentario = await buscarComentarioMaisRecente(o.idSolicitacao);
					comentarios.set(o.idSolicitacao, comentario);
				}
			});
			
			await Promise.all(comentariosPromises);
			
			setData(lista);
			setComentariosMap(comentarios);
			setFileName(`obrigacoes_export_${formatDateTimeBrCompactExport()}.pdf`);
		} catch {
			toast.error('Erro ao preparar PDF');
			onDone?.();
		}
	}, [filterParams, onDone]);

	useEffect(() => {
		if (startedRef.current) return;
		startedRef.current = true;
		loadData();
	}, [loadData]);

	const doc = useMemo(() => {
		if (!data) return null;
		return <ObrigacoesPdfDoc data={data} getStatusText={(c) => getStatusText(c) || ''} isAdminOrGestor={isAdminOrGestor} comentariosMap={comentariosMap} />;
	}, [data, getStatusText, isAdminOrGestor, comentariosMap]);

	useEffect(() => {
		async function generate() {
			if (!doc || downloadedRef.current) return;
			try {
				const blob = await pdf(doc).toBlob();
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = fileName || 'obrigacoes.pdf';
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
				toast.success('PDF exportado com sucesso');
				downloadedRef.current = true;
				onDone?.();
			} catch {
				toast.error('Erro ao exportar PDF');
				onDone?.();
			}
		}
		generate();
	}, [doc, fileName, onDone]);

	return null;
}

