export type FaqCategoryId =
  | 'geral'
  | 'obrigacoes'
  | 'correspondencias'
  | 'perfis';

export const FAQ_FILTER_ALL = 'todas' as const;

export type FaqFilterId = typeof FAQ_FILTER_ALL | FaqCategoryId;

export interface FaqCategory {
  id: FaqCategoryId;
  label: string;
}

export interface FaqItem {
  id: string;
  categoryId: FaqCategoryId;
  question: string;
  answer: string;
  keywords: string[];
}
