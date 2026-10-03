import { notFound } from 'next/navigation';
import { FaqContent } from '@/components/faq/FaqContent';
import { getLayoutClient } from '@/lib/layout/layout-client';
import { ClienteEnum } from '@/lib/layout/layout-client.enum';

export default function FaqPage() {
  if (getLayoutClient() !== ClienteEnum.RTECH) {
    notFound();
  }

  return <FaqContent />;
}
