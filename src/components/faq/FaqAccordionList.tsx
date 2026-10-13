'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FaqItem } from '@/components/faq/types';
import { FAQ_CATEGORIES } from '@/components/faq/data/faq-content';

interface FaqAccordionListProps {
  items: FaqItem[];
  grouped: boolean;
  openItemId: string;
  onOpenItemChange: (value: string) => void;
}

function FaqAnswer({ answer }: { answer: string }) {
  return (
    <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
      {answer}
    </p>
  );
}

function FaqQuestions({
  items,
  openItemId,
  onOpenItemChange,
}: Omit<FaqAccordionListProps, 'grouped'>) {
  return (
    <Accordion
      type="single"
      collapsible
      value={openItemId}
      onValueChange={onOpenItemChange}
      className="space-y-3"
    >
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          value={item.id}
          className="rounded-2xl border border-gray-200 bg-white px-4"
        >
          <AccordionTrigger className="text-sm font-medium text-gray-900">
            {item.question}
          </AccordionTrigger>
          <AccordionContent>
            <FaqAnswer answer={item.answer} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function FaqAccordionList({
  items,
  grouped,
  openItemId,
  onOpenItemChange,
}: FaqAccordionListProps) {
  if (!grouped) {
    return (
      <FaqQuestions
        items={items}
        openItemId={openItemId}
        onOpenItemChange={onOpenItemChange}
      />
    );
  }

  return (
    <div className="space-y-8">
      {FAQ_CATEGORIES.map((category) => {
        const categoryItems = items.filter((item) => item.categoryId === category.id);

        if (categoryItems.length === 0) {
          return null;
        }

        return (
          <section key={category.id} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              {category.label}
            </h2>
            <FaqQuestions
              items={categoryItems}
              openItemId={openItemId}
              onOpenItemChange={onOpenItemChange}
            />
          </section>
        );
      })}
    </div>
  );
}
