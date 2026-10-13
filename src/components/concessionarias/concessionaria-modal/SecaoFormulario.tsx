'use client';

import { ReactNode } from 'react';
import { WarningCircleIcon } from '@phosphor-icons/react';

interface SecaoFormularioProps {
  titulo: string;
  descricao?: string;
  children: ReactNode;
}

/** Bloco visual que agrupa os campos de um assunto do cadastro. */
export function SecaoFormulario({ titulo, descricao, children }: SecaoFormularioProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-gray-200 p-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{titulo}</h3>
        {descricao && <p className="mt-0.5 text-xs text-gray-500">{descricao}</p>}
      </div>
      {children}
    </section>
  );
}

/** Mensagem de erro de um campo, quando houver. */
export function CampoErro({ mensagem }: { mensagem?: string }) {
  if (!mensagem) return null;

  return (
    <div className="mt-1 flex items-center gap-1">
      <WarningCircleIcon className="h-4 w-4 text-red-500" />
      <p className="text-sm text-red-500">{mensagem}</p>
    </div>
  );
}
