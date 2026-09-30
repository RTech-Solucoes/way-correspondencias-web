'use client';

import { GearSixIcon } from '@phosphor-icons/react';

/** Deixa explícito que a configuração técnica não faz parte deste cadastro. */
export default function AvisoConfiguracaoTecnica({ novoCadastro }: { novoCadastro: boolean }) {
  return (
    <div className="flex gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-950">
      <GearSixIcon className="mt-0.5 h-4 w-4 flex-shrink-0" weight="fill" />
      <div className="space-y-1">
        <p>
          Este cadastro reúne informações administrativas e regulatórias essenciais para o
          funcionamento correto da SPE. Os parâmetros de funcionamento do sistema são configurados
          na engrenagem.
        </p>
        {novoCadastro && (
          <p>
            Após criar, você poderá <span className="font-medium">configurar agora</span> ou fazer
            isso depois.
          </p>
        )}
      </div>
    </div>
  );
}
