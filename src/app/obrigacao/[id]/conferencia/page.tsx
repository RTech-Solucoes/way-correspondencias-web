'use server';

import { ConferenciaContent } from '../../../../components/obrigacoes/conferencia/content/ConferenciaContent';

interface ConferenciaObrigacaoPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConferenciaObrigacaoPage({ params }: ConferenciaObrigacaoPageProps) {
  const { id } = await params;

  return <ConferenciaContent id={id} />;
}
