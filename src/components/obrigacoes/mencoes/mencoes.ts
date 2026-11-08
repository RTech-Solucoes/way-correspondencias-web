import type { ResponsavelMencionavel } from '@/api/obrigacao/mencoes-client';

export interface MencaoAtiva {
  /** Posição do "@" no texto. */
  inicio: number;
  termo: string;
}

const MAX_TAMANHO_TERMO = 60;

// Sem trim: depois de "@Nome " o espaço final indica nome concluído e fecha as sugestões.
const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/** Identifica o "@" sendo digitado na posição do cursor; o nome pode conter espaços. */
export function detectarMencaoAtiva(texto: string, cursor: number): MencaoAtiva | null {
  const antesDoCursor = texto.slice(0, cursor);
  const inicio = antesDoCursor.lastIndexOf('@');
  if (inicio === -1) return null;

  const anterior = antesDoCursor[inicio - 1];
  if (anterior !== undefined && !/\s/.test(anterior)) return null;

  const termo = antesDoCursor.slice(inicio + 1);
  if (termo.startsWith(' ') || termo.includes('\n') || termo.length > MAX_TAMANHO_TERMO) return null;

  return { inicio, termo };
}

export function filtrarMencionaveis(lista: ResponsavelMencionavel[], termo: string): ResponsavelMencionavel[] {
  const busca = normalizar(termo);
  return lista.filter((pessoa) => normalizar(pessoa.nmResponsavel).includes(busca));
}

export function inserirMencao(
  texto: string,
  mencao: MencaoAtiva,
  cursor: number,
  nome: string,
): { texto: string; cursor: number } {
  const inserido = `@${nome} `;
  return {
    texto: texto.slice(0, mencao.inicio) + inserido + texto.slice(cursor),
    cursor: mencao.inicio + inserido.length,
  };
}

/** Pessoas mencionadas no texto final; nomes maiores primeiro para "Ana Souza" não contar como "Ana". */
export function extrairIdsMencionados(texto: string, lista: ResponsavelMencionavel[]): number[] {
  let restante = texto.toLowerCase();
  const ids: number[] = [];
  const porNomeMaior = [...lista].sort((a, b) => b.nmResponsavel.length - a.nmResponsavel.length);

  for (const pessoa of porNomeMaior) {
    const alvo = `@${pessoa.nmResponsavel.trim().toLowerCase()}`;
    let encontrado = false;
    let posicao = restante.indexOf(alvo);

    while (posicao !== -1) {
      const proximo = restante[posicao + alvo.length];
      if (proximo === undefined || /[\s.,;:!?)]/.test(proximo)) {
        encontrado = true;
        restante = restante.slice(0, posicao) + ' '.repeat(alvo.length) + restante.slice(posicao + alvo.length);
      }
      posicao = restante.indexOf(alvo, posicao + 1);
    }

    if (encontrado) ids.push(pessoa.idResponsavel);
  }

  return ids;
}
