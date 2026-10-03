'use client';

import { QuestionIcon } from '@phosphor-icons/react';
import { usePathname, useRouter } from 'next/navigation';

export function HeaderHelpButton() {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = pathname === '/faq' || pathname.startsWith('/faq/');

  return (
    <button
      type="button"
      onClick={() => router.push('/faq')}
      className={`relative p-2 rounded-lg hover:bg-gray-50 ${isActive ? 'bg-blue-50' : ''}`}
      aria-label="Ajuda e FAQ"
      title="Ajuda e FAQ"
    >
      <QuestionIcon className={`h-6 w-6 ${isActive ? 'text-blue-700' : 'text-gray-700'}`} />
    </button>
  );
}
