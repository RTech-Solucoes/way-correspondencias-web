'use client';

import PageTitle from '@/components/ui/page-title';
import { Card, CardContent } from '@/components/ui/card';
import { FAQ_FILTER_ALL } from '@/components/faq/types';
import { FaqSearch } from '@/components/faq/FaqSearch';
import { FaqCategoryTabs } from '@/components/faq/FaqCategoryTabs';
import { FaqAccordionList } from '@/components/faq/FaqAccordionList';
import { FaqEmptyState } from '@/components/faq/FaqEmptyState';
import { useFaq } from '@/components/faq/hooks/use-faq';

export function FaqContent() {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    openItemId,
    setOpenItemId,
    visibleItems,
    categoryCounts,
    isSearchActive,
    hasResults,
  } = useFaq();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <PageTitle />
        <p className="text-sm text-gray-500 -mt-2">
          Orientações de uso do sistema. Consulte as dúvidas por categoria ou pesquise por termos da pergunta, da resposta ou das palavras-chave.
        </p>
      </div>

      <Card className="rounded-2xl bg-white">
        <CardContent className="flex flex-col gap-6 p-6">
          <FaqSearch value={searchQuery} onChange={setSearchQuery} />

          <FaqCategoryTabs
            value={selectedCategory}
            counts={categoryCounts}
            onValueChange={setSelectedCategory}
          />

          {hasResults ? (
            <FaqAccordionList
              items={visibleItems}
              grouped={selectedCategory === FAQ_FILTER_ALL}
              openItemId={openItemId}
              onOpenItemChange={setOpenItemId}
            />
          ) : (
            <FaqEmptyState
              isSearchActive={isSearchActive}
              hasSelectedCategory={selectedCategory !== FAQ_FILTER_ALL}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
