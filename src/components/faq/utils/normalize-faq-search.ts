export function normalizeFaqSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function matchesFaqQuery(
  query: string,
  question: string,
  answer: string,
  keywords: string[]
): boolean {
  const term = normalizeFaqSearch(query);

  if (!term) {
    return true;
  }

  const haystack = normalizeFaqSearch([question, answer, ...keywords].join(' '));

  return haystack.includes(term);
}
