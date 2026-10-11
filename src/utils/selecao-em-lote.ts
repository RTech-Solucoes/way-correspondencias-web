/**
 * O backend usa o `max-page-size` padrão do Spring Data (2000), então pedir uma
 * página do tamanho do total trunca silenciosamente o resultado. Buscamos em
 * blocos bem abaixo desse teto e em paralelo.
 */
const TAMANHO_BLOCO = 500;
const BLOCOS_SIMULTANEOS = 4;

interface ColetarIdsDoFiltroParams<T> {
  /** Total de registros que atendem ao filtro atual (totalElements da listagem). */
  total: number;
  cancelado?: () => boolean;
  /** Carrega uma página do filtro atual. */
  buscarPagina: (page: number, size: number) => Promise<T[]>;
  obterId: (item: T) => number | null | undefined;
  /** Itens que a tela não permite selecionar (ex.: áreas obrigatórias do sistema). */
  podeSelecionar?: (item: T) => boolean;
  /**
   * Chamado a cada bloco recebido, para a tela ir marcando os itens conforme
   * chegam em vez de esperar o filtro inteiro.
   */
  aoReceberIds?: (ids: number[]) => void;
}

/**
 * Percorre todas as páginas do filtro atual e devolve os ids selecionáveis.
 * Usado pela ação explícita de selecionar todos os resultados filtrados.
 */
export async function coletarIdsDoFiltro<T>({
  total,
  cancelado,
  buscarPagina,
  obterId,
  podeSelecionar,
  aoReceberIds,
}: ColetarIdsDoFiltroParams<T>): Promise<number[]> {
  if (total <= 0) return [];

  const totalBlocos = Math.ceil(total / TAMANHO_BLOCO);
  const coletados: number[] = [];
  let proximoBloco = 0;

  const extrairIds = (itens: T[]) =>
    itens
      .filter((item) => (podeSelecionar ? podeSelecionar(item) : true))
      .map(obterId)
      .filter((id): id is number => id != null);

  const consumir = async () => {
    while (true) {
      if (cancelado?.()) return;
      const bloco = proximoBloco++;
      if (bloco >= totalBlocos) return;

      const ids = extrairIds(await buscarPagina(bloco, TAMANHO_BLOCO));
      if (cancelado?.()) return;
      coletados.push(...ids);
      aoReceberIds?.(ids);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(BLOCOS_SIMULTANEOS, totalBlocos) }, consumir),
  );

  return coletados;
}

/** Alterna somente os IDs visíveis e preserva seleções de outras páginas. */
export function alternarSelecaoPagina(previous: Set<number>, pageIds: number[]): Set<number> {
  const next = new Set(previous);
  const remove = pageIds.length > 0 && pageIds.every((id) => next.has(id));
  pageIds.forEach((id) => remove ? next.delete(id) : next.add(id));
  return next;
}
