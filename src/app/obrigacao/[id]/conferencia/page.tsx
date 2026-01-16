'use server';

import { Suspense } from 'react';
import { ConferenciaContent } from '../../../../components/obrigacoes/conferencia/content/ConferenciaContent';
import LoadingOverlay from '@/components/ui/loading-overlay';
import obrigacaoClient from '@/api/obrigacao/client';

interface ConferenciaObrigacaoPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConferenciaObrigacaoPage({ params }: ConferenciaObrigacaoPageProps) {
  const { id } = await params;
  
  let initialData = null;
  if (id && !Number.isNaN(Number(id))) {
    try {
      initialData = await obrigacaoClient.buscarDetalhePorId(Number(id));
    } catch (error) {
      console.error('Erro ao carregar detalhes da obrigação:', error);
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
        <ConferenciaContent id={id} initialData={initialData} />
      </Suspense>
    </div>
  );
}
