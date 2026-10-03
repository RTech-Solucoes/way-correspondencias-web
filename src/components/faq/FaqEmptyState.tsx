'use client';

import { MagnifyingGlassIcon, QuestionIcon } from '@phosphor-icons/react';

interface FaqEmptyStateProps {
  isSearchActive: boolean;
  hasSelectedCategory: boolean;
}

export function FaqEmptyState({ isSearchActive, hasSelectedCategory }: FaqEmptyStateProps) {
  if (isSearchActive) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <MagnifyingGlassIcon className="h-10 w-10 text-gray-300" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-800">
            Nenhum resultado foi encontrado
          </p>
          <p className="text-sm text-gray-500">
            Não há conteúdo cadastrado correspondente aos termos da pesquisa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <QuestionIcon className="h-10 w-10 text-gray-300" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-800">
          {hasSelectedCategory
            ? 'Nenhuma dúvida cadastrada nesta categoria'
            : 'Nenhuma dúvida cadastrada'}
        </p>
        <p className="text-sm text-gray-500">
          {hasSelectedCategory
            ? 'Selecione outra categoria ou utilize a pesquisa para localizar uma orientação.'
            : 'Utilize a pesquisa ou as categorias para localizar uma orientação cadastrada.'}
        </p>
      </div>
    </div>
  );
}
