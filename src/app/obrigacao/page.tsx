'use server';

import { Suspense } from "react";
import { ObrigacoesProvider } from "@/context/obrigacoes/ObrigacoesContext";
import { ObrigacoesContent } from "../../components/obrigacoes/list-page/ObrigacoesContent";

export default async function ObrigacoesPage() {
  return (
    <ObrigacoesProvider>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500 italic animate-pulse">Carregando obrigações...</div>
        </div>
      }>
        <ObrigacoesContent />
      </Suspense>
    </ObrigacoesProvider>
  );
}
