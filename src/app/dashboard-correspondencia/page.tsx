'use server';

import LoadingOverlay from '@/components/ui/loading-overlay';
import DashboardCorrespondenciaContent from '@/components/dashboard/correspondencia/content/DashboardCorrespondenciaContent';
import { Suspense } from 'react';

export default async function DashboardPage() {
  return (
    <div data-ssr="true">
      <Suspense
        fallback={
          <LoadingOverlay
            title="Carregando dashboard de correspondência..."
            subtitle="Aguarde enquanto os dados são carregados"
          />
        }
      >
        <DashboardCorrespondenciaContent />
      </Suspense>
    </div>
  );
}