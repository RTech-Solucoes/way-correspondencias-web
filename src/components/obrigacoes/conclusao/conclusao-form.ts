import type { ArquivoConclusaoRequest } from '@/api/obrigacao/types';

/** Limite do somatório dos arquivos de uma conclusão (mesmo valor validado pela API). */
export const MAX_TAMANHO_TOTAL_CONCLUSAO = 100 * 1024 * 1024;

/** Nenhum arquivo isolado pode passar do limite total. */
export const MAX_TAMANHO_ARQUIVO_CONCLUSAO = MAX_TAMANHO_TOTAL_CONCLUSAO;

export function somarTamanhoArquivos(arquivos: ArquivosConclusao): number {
  return Object.values(arquivos).reduce(
    (total, lista) => total + lista.reduce((soma, arquivo) => soma + arquivo.size, 0),
    0,
  );
}

/**
 * Mensagem de erro amigável a partir do erro da API: prioriza a mensagem do primeiro campo inválido
 * (o handler global responde "Falha de validação." com os detalhes em `errors`).
 */
export function extrairMensagemErro(error: unknown, padrao: string): string {
  if (!(error instanceof Error)) return padrao;
  const payload = (error as Error & { payload?: unknown }).payload as
    | { errors?: Array<{ message?: string } | string> }
    | null
    | undefined;
  const primeiro = payload?.errors?.[0];
  const mensagemCampo = typeof primeiro === 'string' ? primeiro : primeiro?.message;
  return mensagemCampo || error.message || padrao;
}

export type CategoriaArquivoConclusao = 'protocolos' | 'evidencias' | 'correspondencias' | 'outrosAnexos';

export type ArquivosConclusao = Record<CategoriaArquivoConclusao, File[]>;

export const ARQUIVOS_CONCLUSAO_VAZIO: ArquivosConclusao = {
  protocolos: [],
  evidencias: [],
  correspondencias: [],
  outrosAnexos: [],
};

export interface ConclusaoFormErrors {
  dtConclusao?: string;
  protocolos?: string;
}

/** Data de hoje no fuso do navegador, no formato yyyy-MM-dd (sem converter para UTC). */
export function dataHojeIso(agora: Date = new Date()): string {
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/** Concluída em atraso quando a data efetiva é posterior à data limite original. */
export function isConclusaoEmAtraso(dtConclusao?: string | null, dtLimite?: string | null): boolean {
  if (!dtConclusao || !dtLimite) return false;
  return dtConclusao.slice(0, 10) > dtLimite.slice(0, 10);
}

export function validarConclusaoForm(
  dtConclusao: string,
  quantidadeProtocolos: number,
  hoje: string = dataHojeIso(),
): ConclusaoFormErrors {
  const errors: ConclusaoFormErrors = {};

  if (!dtConclusao) {
    errors.dtConclusao = 'Informe a data efetiva da conclusão.';
  } else if (dtConclusao > hoje) {
    errors.dtConclusao = 'A data efetiva da conclusão não pode ser uma data futura.';
  }

  if (quantidadeProtocolos === 0) {
    errors.protocolos = 'O arquivo do protocolo é obrigatório para concluir a obrigação.';
  }

  return errors;
}

export function formatarTamanhoArquivo(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Separa arquivos aceitos dos que excedem o tamanho máximo permitido. */
export function separarArquivosPorTamanho(
  arquivos: File[],
  limite: number = MAX_TAMANHO_ARQUIVO_CONCLUSAO,
): { aceitos: File[]; recusados: File[] } {
  return {
    aceitos: arquivos.filter((arquivo) => arquivo.size <= limite),
    recusados: arquivos.filter((arquivo) => arquivo.size > limite),
  };
}

function lerArquivoBase64(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const resultado = String(reader.result ?? '');
      const indiceVirgula = resultado.indexOf(',');
      resolve(indiceVirgula >= 0 ? resultado.substring(indiceVirgula + 1) : resultado);
    };
    reader.onerror = () => reject(reader.error ?? new Error(`Falha ao ler o arquivo ${arquivo.name}.`));
    reader.readAsDataURL(arquivo);
  });
}

export async function converterArquivosConclusao(arquivos: File[]): Promise<ArquivoConclusaoRequest[]> {
  return Promise.all(
    arquivos.map(async (arquivo) => ({
      nomeArquivo: arquivo.name,
      tipoConteudo: arquivo.type || null,
      conteudoArquivo: await lerArquivoBase64(arquivo),
    })),
  );
}

export function textoOuNulo(valor: string): string | null {
  const texto = valor.trim();
  return texto ? texto : null;
}
