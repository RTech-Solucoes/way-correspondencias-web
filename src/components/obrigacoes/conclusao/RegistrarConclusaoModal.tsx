'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Label } from '@radix-ui/react-label';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import AnexoComponent from '@/components/AnexoComponotent/AnexoComponent';
import AnexoList from '@/components/AnexoComponotent/AnexoList/AnexoList';
import type { ObrigacaoResponse } from '@/api/obrigacao/types';
import { formatDateBr } from '@/utils/utils';
import {
  ARQUIVOS_CONCLUSAO_VAZIO,
  ArquivosConclusao,
  CategoriaArquivoConclusao,
  ConclusaoFormErrors,
  MAX_TAMANHO_ARQUIVO_CONCLUSAO,
  MAX_TAMANHO_TOTAL_CONCLUSAO,
  converterArquivosConclusao,
  dataHojeIso,
  extrairMensagemErro,
  formatarTamanhoArquivo,
  isConclusaoEmAtraso,
  separarArquivosPorTamanho,
  somarTamanhoArquivos,
  textoOuNulo,
  validarConclusaoForm,
} from './conclusao-form';
import { useRegistrarConclusao } from './use-registrar-conclusao';

interface RegistrarConclusaoModalProps {
  open: boolean;
  obrigacao: ObrigacaoResponse;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

interface CategoriaConfig {
  categoria: CategoriaArquivoConclusao;
  titulo: string;
  descricao: string;
  obrigatorio?: boolean;
}

const CATEGORIAS: CategoriaConfig[] = [
  {
    categoria: 'protocolos',
    titulo: 'Protocolo',
    descricao: 'Protocolo de conclusão da obrigação.',
    obrigatorio: true,
  },
  {
    categoria: 'evidencias',
    titulo: 'Evidência de cumprimento da obrigação',
    descricao: 'Opcional. Documentos que comprovam o cumprimento.',
  },
  {
    categoria: 'correspondencias',
    titulo: 'Correspondência',
    descricao: 'Opcional. Correspondência relacionada à obrigação.',
  },
  {
    categoria: 'outrosAnexos',
    titulo: 'Outros anexos',
    descricao: 'Opcional. Demais documentos do processo.',
  },
];

const MAX_OBSERVACAO = 4000;
const MAX_PROCESSO = 250;
const MAX_SEI = 255;

export function RegistrarConclusaoModal({ open, obrigacao, onClose, onSuccess }: RegistrarConclusaoModalProps) {
  const [dtConclusao, setDtConclusao] = useState('');
  const [arquivos, setArquivos] = useState<ArquivosConclusao>(ARQUIVOS_CONCLUSAO_VAZIO);
  const [observacoes, setObservacoes] = useState('');
  const [numeroProcesso, setNumeroProcesso] = useState('');
  const [numeroSei, setNumeroSei] = useState('');
  const [errors, setErrors] = useState<ConclusaoFormErrors>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [preparandoArquivos, setPreparandoArquivos] = useState(false);

  const { mutateAsync: registrarConclusao, isPending } = useRegistrarConclusao();
  const enviando = isPending || preparandoArquivos;

  const hoje = dataHojeIso();
  const dtLimite = obrigacao.dtLimite ?? null;
  const emAtraso = isConclusaoEmAtraso(dtConclusao, dtLimite);

  useEffect(() => {
    if (open) {
      setDtConclusao(dataHojeIso());
      setArquivos(ARQUIVOS_CONCLUSAO_VAZIO);
      setObservacoes(obrigacao.dsObservacaoProtocolo ?? '');
      setNumeroProcesso(obrigacao.nrProcesso ?? '');
      setNumeroSei(obrigacao.nrSei ?? '');
      setErrors({});
      setShowConfirmDialog(false);
    }
  }, [open, obrigacao.dsObservacaoProtocolo, obrigacao.nrProcesso, obrigacao.nrSei]);

  const totalArquivos = useMemo(
    () => Object.values(arquivos).reduce((total, lista) => total + lista.length, 0),
    [arquivos],
  );

  const handleClose = useCallback(() => {
    if (!enviando) onClose();
  }, [enviando, onClose]);

  const handleAddArquivos = useCallback((categoria: CategoriaArquivoConclusao, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const { aceitos, recusados } = separarArquivosPorTamanho(Array.from(files));
    if (recusados.length > 0) {
      const nomes = recusados.map((arquivo) => `${arquivo.name} (${formatarTamanhoArquivo(arquivo.size)})`).join(', ');
      toast.error(`Arquivos acima do limite de ${formatarTamanhoArquivo(MAX_TAMANHO_ARQUIVO_CONCLUSAO)}: ${nomes}`);
    }
    if (aceitos.length === 0) return;

    const tamanhoNovos = aceitos.reduce((soma, arquivo) => soma + arquivo.size, 0);
    if (somarTamanhoArquivos(arquivos) + tamanhoNovos > MAX_TAMANHO_TOTAL_CONCLUSAO) {
      toast.error(`O total dos arquivos não pode passar de ${formatarTamanhoArquivo(MAX_TAMANHO_TOTAL_CONCLUSAO)}.`);
      return;
    }

    setArquivos((prev) => ({ ...prev, [categoria]: [...prev[categoria], ...aceitos] }));
    if (categoria === 'protocolos') {
      setErrors((prev) => ({ ...prev, protocolos: undefined }));
    }
  }, [arquivos]);

  const handleRemoveArquivo = useCallback((categoria: CategoriaArquivoConclusao, index: number) => {
    setArquivos((prev) => ({ ...prev, [categoria]: prev[categoria].filter((_, i) => i !== index) }));
  }, []);

  const handleDataChange = useCallback((valor: string) => {
    setDtConclusao(valor);
    setErrors((prev) => ({ ...prev, dtConclusao: undefined }));
  }, []);

  const handleSolicitarConfirmacao = useCallback(() => {
    const validacao = validarConclusaoForm(dtConclusao, arquivos.protocolos.length, hoje);
    setErrors(validacao);
    if (validacao.dtConclusao || validacao.protocolos) {
      toast.warning(validacao.protocolos ?? validacao.dtConclusao);
      return;
    }
    setShowConfirmDialog(true);
  }, [arquivos.protocolos.length, dtConclusao, hoje]);

  const handleConfirmar = useCallback(async () => {
    try {
      setPreparandoArquivos(true);
      const [protocolos, evidencias, correspondencias, outrosAnexos] = await Promise.all([
        converterArquivosConclusao(arquivos.protocolos),
        converterArquivosConclusao(arquivos.evidencias),
        converterArquivosConclusao(arquivos.correspondencias),
        converterArquivosConclusao(arquivos.outrosAnexos),
      ]);
      setPreparandoArquivos(false);

      const conclusao = await registrarConclusao({
        idObrigacao: obrigacao.idSolicitacao,
        request: {
          dtConclusao,
          protocolos,
          evidencias,
          correspondencias,
          outrosAnexos,
          dsObservacao: textoOuNulo(observacoes),
          nrProcesso: textoOuNulo(numeroProcesso),
          nrSei: textoOuNulo(numeroSei),
        },
      });

      toast.success(
        conclusao.concluidaEmAtraso
          ? 'Obrigação registrada como Concluída em atraso.'
          : 'Obrigação registrada como Concluída.',
      );
      onClose();
      await onSuccess?.();
    } catch (error) {
      toast.error(extrairMensagemErro(error, 'Não foi possível registrar a conclusão. Tente novamente.'));
      if ((error as { status?: number })?.status === 409) {
        onClose();
      }
    } finally {
      setPreparandoArquivos(false);
    }
  }, [
    arquivos,
    dtConclusao,
    numeroProcesso,
    numeroSei,
    obrigacao.idSolicitacao,
    observacoes,
    onClose,
    onSuccess,
    registrarConclusao,
  ]);

  const podeConcluir = !!dtConclusao && arquivos.protocolos.length > 0 && !enviando;
  const tooltipConcluir = !dtConclusao
    ? 'Informe a data efetiva da conclusão.'
    : arquivos.protocolos.length === 0
      ? 'É necessário anexar o arquivo do protocolo.'
      : '';

  const descricaoConfirmacao = [
    `A obrigação ${obrigacao.cdIdentificacao ?? ''} será concluída em ${formatDateBr(dtConclusao)}`,
    emAtraso ? 'como "Concluída em atraso"' : 'como "Concluída"',
    `com ${totalArquivos} documento(s) arquivado(s), sem tramitação pelas áreas.`,
    'Após confirmar, não será possível concluí-la novamente.',
  ].join(' ');

  return (
    <Dialog open={open} onOpenChange={(aberto) => !aberto && handleClose()}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-lg font-semibold">Registrar conclusão</DialogTitle>
          <p className="text-sm text-gray-500">
            {obrigacao.cdIdentificacao}
            {obrigacao.dsTarefa ? ` · ${obrigacao.dsTarefa}` : ''}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              A conclusão será registrada pelo fluxo administrativo, sem iniciar ou exigir tramitação pelas áreas.
              Somente o protocolo é obrigatório.
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dtConclusao" className="text-sm font-medium text-gray-700">
                Data efetiva da conclusão <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dtConclusao"
                type="date"
                value={dtConclusao}
                max={hoje}
                onChange={(event) => handleDataChange(event.target.value)}
                disabled={enviando}
                aria-invalid={!!errors.dtConclusao}
                className={errors.dtConclusao ? 'border-red-500' : ''}
              />
              {errors.dtConclusao && <p className="text-xs text-red-600">{errors.dtConclusao}</p>}
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Data limite original</span>
              <div className="flex h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700">
                {dtLimite ? formatDateBr(dtLimite) : 'Sem data limite'}
              </div>
              <p className="text-xs text-gray-500">Preservada para histórico, auditoria e indicadores.</p>
            </div>
          </div>

          {dtConclusao && dtLimite && (
            <div
              className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
                emAtraso
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-green-200 bg-green-50 text-green-800'
              }`}
            >
              {emAtraso ? (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <span>
                {emAtraso
                  ? `A data informada é posterior à data limite (${formatDateBr(dtLimite)}). A obrigação será apresentada como "Concluída em atraso".`
                  : 'A data informada está dentro do prazo. A obrigação será apresentada como "Concluída".'}
              </span>
            </div>
          )}

          {CATEGORIAS.map(({ categoria, titulo, descricao, obrigatorio }) => (
            <div key={categoria} className="space-y-2">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  {titulo} {obrigatorio && <span className="text-red-500">*</span>}
                </Label>
                <p className="text-xs text-gray-500">{descricao}</p>
              </div>
              <AnexoComponent
                onAddAnexos={(files) => handleAddArquivos(categoria, files)}
                disabled={enviando}
              />
              {obrigatorio && errors.protocolos && <p className="text-xs text-red-600">{errors.protocolos}</p>}
              {arquivos[categoria].length > 0 && (
                <div className="mt-2">
                  <span className="mb-2 block text-xs font-medium text-gray-600">
                    Arquivos selecionados ({arquivos[categoria].length}):
                  </span>
                  <AnexoList
                    anexos={arquivos[categoria]}
                    onRemove={enviando ? undefined : (index) => handleRemoveArquivo(categoria, index)}
                  />
                </div>
              )}
            </div>
          ))}

          <div className="space-y-2">
            <Label htmlFor="observacoesConclusao" className="text-sm font-medium text-gray-700">
              Observações
            </Label>
            <Textarea
              id="observacoesConclusao"
              placeholder="Digite as observações"
              value={observacoes}
              maxLength={MAX_OBSERVACAO}
              onChange={(event) => setObservacoes(event.target.value)}
              disabled={enviando}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="numeroProcessoConclusao" className="text-sm font-medium text-gray-700">
                Nº do Processo
              </Label>
              <Input
                id="numeroProcessoConclusao"
                placeholder="Digite o número do processo"
                value={numeroProcesso}
                maxLength={MAX_PROCESSO}
                onChange={(event) => setNumeroProcesso(event.target.value)}
                disabled={enviando}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroSeiConclusao" className="text-sm font-medium text-gray-700">
                Nº do SEI
              </Label>
              <Input
                id="numeroSeiConclusao"
                placeholder="Digite o número do SEI"
                value={numeroSei}
                maxLength={MAX_SEI}
                onChange={(event) => setNumeroSei(event.target.value)}
                disabled={enviando}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-gray-200 px-6 py-4 mt-auto">
          <Button variant="outline" onClick={handleClose} disabled={enviando} className="min-w-[100px]">
            Cancelar
          </Button>
          <Button
            onClick={handleSolicitarConfirmacao}
            disabled={!podeConcluir}
            className="min-w-[100px] bg-blue-600 hover:bg-blue-700"
            tooltip={tooltipConcluir}
          >
            {enviando ? 'Registrando...' : 'Registrar conclusão'}
          </Button>
        </DialogFooter>
      </DialogContent>

      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Confirmar conclusão da obrigação"
        description={descricaoConfirmacao}
        confirmText="Sim, registrar conclusão"
        cancelText="Voltar"
        onConfirm={handleConfirmar}
        loading={enviando}
      />
    </Dialog>
  );
}
