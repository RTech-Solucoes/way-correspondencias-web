'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FAQ_CATEGORIES } from '@/components/faq/data/faq-content';
import { FaqFilterId, FAQ_FILTER_ALL } from '@/components/faq/types';

interface FaqCategoryTabsProps {
  value: FaqFilterId;
  counts: Record<FaqFilterId, number>;
  onValueChange: (value: FaqFilterId) => void;
}

export function FaqCategoryTabs({
  value,
  counts,
  onValueChange,
}: FaqCategoryTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue as FaqFilterId)}
    >
      <TabsList className="h-auto w-full flex flex-wrap justify-start gap-2 bg-transparent p-0 rounded-none">
        <TabsTrigger
          value={FAQ_FILTER_ALL}
          className="rounded-3xl border border-gray-200 bg-white px-4 py-2 text-gray-700 shadow-none data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 data-[state=active]:shadow-none"
        >
          Todas ({counts[FAQ_FILTER_ALL]})
        </TabsTrigger>
        {FAQ_CATEGORIES.map((category) => (
          <TabsTrigger
            key={category.id}
            value={category.id}
            className="rounded-3xl border border-gray-200 bg-white px-4 py-2 text-gray-700 shadow-none data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 data-[state=active]:shadow-none"
          >
            {category.label} ({counts[category.id]})
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
