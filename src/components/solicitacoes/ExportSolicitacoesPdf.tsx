'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Document, Page, StyleSheet, Text, View, pdf, Image } from '@react-pdf/renderer';
import { toast } from 'sonner';
import { solicitacoesClient } from '@/api/solicitacoes/client';
import { PagedResponse, SolicitacaoFilterParams, SolicitacaoResponse } from '@/api/solicitacoes/types';
import { formatDateTimeBr, formatDateTimeBrCompactExport } from '@/utils/utils';

type ExportSolicitacoesPdfProps = {
	filterParams: Omit<SolicitacaoFilterParams, 'page' | 'size' | 'sort'>;
	getStatusText: (statusCode: string) => string | null;
	onDone?: () => void;
};

const styles = StyleSheet.create({
	page: { padding: 24, fontSize: 9, fontFamily: 'Helvetica' },
	title: { fontSize: 12, marginBottom: 8, fontWeight: 700 },
	subtitle: { fontSize: 9, marginBottom: 10 },
	header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
	logo: { width: 80, marginRight: 12 },
	table: { width: 'auto', borderStyle: 'solid', borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
	row: { flexDirection: 'row' },
	cell: { borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, padding: 4 },
	head: { fontWeight: 700, backgroundColor: '#f2f2f2' },
	footer: { position: 'absolute', left: 24, right: 24, bottom: 12, fontSize: 9, color: '#555', flexDirection: 'row', justifyContent: 'space-between' },
	// colunas da tabela
	c1: { width: '12%' }, // Identificação
	c2: { width: '22%' }, // Assunto
	c3: { width: '12%' }, // Áreas
	c4: { width: '10%' }, // Tema
	c5: { width: '10%' }, // Status
	c6: { width: '8%' }, // Data Início Solicitação
	c7: { width: '8%' }, // Data Início Primeira Tramitação
	c8: { width: '8%' }, // Data Prazo Limite Tramitação
	c9: { width: '8%' }, // Data Conclusão Tramitação
	c10: { width: '8%' }, // Atendido dentro do prazo
});

function SolicitacoesPdfDoc({ data, getStatusText }: { data: SolicitacaoResponse[]; getStatusText: (code: string) => string | null }) {
	const nowStr = useMemo(() => new Date().toLocaleString('pt-BR'), []);
	return (
		<Document>
			<Page size="A4" orientation="landscape" style={styles.page}>
				<View style={styles.header}>
					{/* eslint-disable-next-line jsx-a11y/alt-text */}
					<Image src="/images/way-logo.png" style={styles.logo} />
					<View>
						<Text style={styles.title}>Relatório de Solicitações</Text>
						<Text style={styles.subtitle}>Data de exportação: {nowStr}</Text>
						<Text style={styles.subtitle}>Total de registros: {data.length}</Text>
					</View>
				</View>
				<View style={styles.table}>
					<View style={[styles.row, styles.head]}>
						<Text style={[styles.cell, styles.c1]}>Identificação</Text>
						<Text style={[styles.cell, styles.c2]}>Assunto</Text>
						<Text style={[styles.cell, styles.c3]}>Áreas</Text>
						<Text style={[styles.cell, styles.c4]}>Tema</Text>
						<Text style={[styles.cell, styles.c5]}>Status</Text>
						<Text style={[styles.cell, styles.c6]}>Data Início Solicitação</Text>
						<Text style={[styles.cell, styles.c7]}>Data Início Primeira Tramitação</Text>
						<Text style={[styles.cell, styles.c8]}>Data Prazo Limite Tramitação</Text>
						<Text style={[styles.cell, styles.c9]}>Data Conclusão Tramitação</Text>
						<Text style={[styles.cell, styles.c10]}>Atendido dentro do prazo</Text>
					</View>

					{data.map((s, idx) => {
						const areasNomes = (s.areas || s.area || [])
							.map((a) => a?.nmArea)
							.filter(Boolean)
							.join(', ');
						const tema = s.nmTema || s.tema?.nmTema || '';
						const status = s.statusSolicitacao?.nmStatus || getStatusText(s.statusCodigo?.toString() || '') || '';
						
						let atendidoDentroDoPrazo = '-';
						if (s.dtConclusaoTramitacao && s.dtPrazoLimite) {
							const dtConclusao = new Date(s.dtConclusaoTramitacao);
							const dtPrazoLimite = new Date(s.dtPrazoLimite);
							atendidoDentroDoPrazo = dtConclusao <= dtPrazoLimite ? 'Sim' : 'Não';
						}
						
						return (
							<View key={idx} style={styles.row}>
								<Text style={[styles.cell, styles.c1]}>{s.cdIdentificacao || ''}</Text>
								<Text style={[styles.cell, styles.c2]}>{s.dsAssunto || ''}</Text>
								<Text style={[styles.cell, styles.c3]}>{areasNomes}</Text>
								<Text style={[styles.cell, styles.c4]}>{tema}</Text>
								<Text style={[styles.cell, styles.c5]}>{status}</Text>
								<Text style={[styles.cell, styles.c6]}>{formatDateTimeBr(s.dtCriacao)}</Text>
								<Text style={[styles.cell, styles.c7]}>{formatDateTimeBr(s.dtPrimeiraTramitacao)}</Text>
								<Text style={[styles.cell, styles.c8]}>{formatDateTimeBr(s.dtPrazoLimite)}</Text>
								<Text style={[styles.cell, styles.c9]}>{formatDateTimeBr(s.dtConclusaoTramitacao)}</Text>
								<Text style={[styles.cell, styles.c10]}>{atendidoDentroDoPrazo}</Text>
							</View>
						);
					})}
				</View>

				{/* Footer with page numbers */}
				<View style={styles.footer} fixed>
					<Text>Way262</Text>
					<Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}` } />
				</View>
			</Page>
		</Document>
	);
}

export default function ExportSolicitacoesPdf({ filterParams, getStatusText, onDone }: ExportSolicitacoesPdfProps) {
	const [data, setData] = useState<SolicitacaoResponse[] | null>(null);
	const [fileName, setFileName] = useState('');
	const startedRef = useRef(false);
	const downloadedRef = useRef(false);

	const loadData = useCallback(async () => {
		try {
			const response = await solicitacoesClient.buscarPorFiltro({
				...filterParams,
				page: 0,
				size: 10000,
			});
			const lista = (response && typeof response === 'object' && 'content' in response)
				? (response as unknown as PagedResponse<SolicitacaoResponse>).content ?? []
				: (response as SolicitacaoResponse[]) ?? [];
			setData(lista);
			setFileName(`solicitacoes_export_${formatDateTimeBrCompactExport()}.pdf`);
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
		return <SolicitacoesPdfDoc data={data} getStatusText={(c) => getStatusText(c) || ''} />;
	}, [data, getStatusText]);

	useEffect(() => {
		async function generate() {
			if (!doc || downloadedRef.current) return;
			try {
				const blob = await pdf(doc).toBlob();
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = fileName || 'solicitacoes.pdf';
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


