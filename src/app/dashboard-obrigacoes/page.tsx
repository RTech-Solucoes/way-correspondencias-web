'use server';

import LoadingOverlay from '@/components/ui/loading-overlay';
import DashboardObrigacoesContent from '../../components/dashboard/obrigacao/content/DashboardObrigacoesContent';
import { Suspense } from 'react';

export default async function DashboardObrigacoesPage() {
  return (
    <div data-ssr="true">
      <Suspense
        fallback={
          <LoadingOverlay
            title="Carregando dashboard de obrigações..."
            subtitle="Aguarde enquanto os dados são carregados"
          />
        }
      >
        <DashboardObrigacoesContent />
      </Suspense>
    </div>
  );
}
