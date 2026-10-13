'use client';

import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { Input } from '@/components/ui/input';

interface FaqSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function FaqSearch({ value, onChange }: FaqSearchProps) {
  return (
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        id="faq-search"
        placeholder="Pesquisar dúvidas por pergunta, resposta ou palavras-chave"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
      />
    </div>
  );
}
