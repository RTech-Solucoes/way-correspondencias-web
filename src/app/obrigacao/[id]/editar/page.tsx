'use server';

import LoadingOverlay from '@/components/ui/loading-overlay';
import { EditarObrigacaoContent } from '../../../../components/obrigacoes/criar/EditarObrigacaoContent';
import { Suspense } from 'react';
import obrigacaoClient from '@/api/obrigacao/client';

interface EditarObrigacaoPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarObrigacaoPage({ params }: EditarObrigacaoPageProps) {
  const { id } = await params;
  
  let initialData = null;
  if (id && !Number.isNaN(Number(id))) {
    try {
      initialData = await obrigacaoClient.buscarDetalhePorId(Number(id));
    } catch (error) {
      console.error('Erro ao carregar detalhes da obrigação :', error);
    }
  }

  return (
    <div data-ssr="true">
      <Suspense
        fallback={
          <LoadingOverlay
            title="Carregando obrigação..."
            subtitle="Aguarde enquanto os dados são carregados"
          />
        }
      >
        <EditarObrigacaoContent id={id} initialData={initialData} />
      </Suspense>
    </div>
  );
}
