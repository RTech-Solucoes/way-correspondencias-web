import { useEffect, useMemo, useState } from 'react';
import { FAQ_ITEMS } from '@/components/faq/data/faq-content';
import { FaqFilterId, FaqItem, FAQ_FILTER_ALL } from '@/components/faq/types';
import { matchesFaqQuery } from '@/components/faq/utils/normalize-faq-search';

export function useFaq() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FaqFilterId>(FAQ_FILTER_ALL);
  const [openItemId, setOpenItemId] = useState('');

  const searchFilteredItems = useMemo(
    () =>
      FAQ_ITEMS.filter((item) =>
        matchesFaqQuery(searchQuery, item.question, item.answer, item.keywords)
      ),
    [searchQuery]
  );

  const visibleItems = useMemo(
    () =>
      selectedCategory === FAQ_FILTER_ALL
        ? searchFilteredItems
        : searchFilteredItems.filter((item) => item.categoryId === selectedCategory),
    [searchFilteredItems, selectedCategory]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<FaqFilterId, number> = {
      [FAQ_FILTER_ALL]: searchFilteredItems.length,
      geral: 0,
      obrigacoes: 0,
      correspondencias: 0,
      perfis: 0,
    };

    searchFilteredItems.forEach((item: FaqItem) => {
      counts[item.categoryId] += 1;
    });

    return counts;
  }, [searchFilteredItems]);

  const isSearchActive = searchQuery.trim().length > 0;
  const hasResults = visibleItems.length > 0;

  useEffect(() => {
    setOpenItemId('');
  }, [searchQuery, selectedCategory]);

  return {
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
  };
}
