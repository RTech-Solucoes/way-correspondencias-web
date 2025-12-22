'use server';

import { EditarObrigacaoContent } from '../../../../components/obrigacoes/criar/EditarObrigacaoContent';

interface EditarObrigacaoPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarObrigacaoPage({ params }: EditarObrigacaoPageProps) {
  const { id } = await params;

  return <EditarObrigacaoContent id={id} />;
}
