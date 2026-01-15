'use client';

import { toast } from 'sonner';
import { ValidationError } from '@/components/obrigacoes/conferencia/hooks/use-validar-obrigacao';

type TabKey = 'dados' | 'temas' | 'prazos' | 'anexos' | 'vinculos';

interface ValidarObrigacaoToastOptions {
  title?: string;
  onTabChange?: (tab: TabKey) => void;
  mensagemPersonalizada?: string;
}

export function mostrarValidacaoObrigacaoToast(
  errors: ValidationError[],
  options: ValidarObrigacaoToastOptions = {},
) {
  const { 
    title = 'Preencha os campos obrigatórios:', 
    onTabChange,
    mensagemPersonalizada 
  } = options;

  if (errors.length === 0) {
    return;
  }

  const stepTab: Record<number, TabKey> = {
    1: 'dados',
    2: 'temas',
    3: 'prazos',
  };

  const primeiroInvalidStep = errors[0].step;
  const tab = stepTab[primeiroInvalidStep];
  if (tab && onTabChange) {
    onTabChange(tab);
  }

  const CampoPorStep: Record<number, string[]> = {};
  errors.forEach(({ step, campos }) => {
    if (campos.length > 0) {
      CampoPorStep[step] = campos;
    }
  });

  if (Object.keys(CampoPorStep).length > 0) {
    const stepNomes: Record<number, string> = {
      1: 'STEP 1 (DADOS)',
      2: 'STEP 2 (TEMAS E ÁREAS)',
      3: 'STEP 3 (PRAZOS)',
    };

    const ErrorMessage = () => {
      const tituloFinal = mensagemPersonalizada || title;
      
      return (
        <div className="space-y-3">
          <div className="font-semibold text-sm text-red-900 leading-tight">{tituloFinal}</div>
          <div className="space-y-2.5 border-t border-red-100 pt-2.5">
            {Object.keys(CampoPorStep)
              .sort()
              .map((stepKey) => {
                const step = parseInt(stepKey, 10);
                const stepName = stepNomes[step];
                const campos = CampoPorStep[step];

                return (
                  <div key={step} className="space-y-1.5">
                    <div className="font-semibold text-xs text-red-800 uppercase tracking-wider">
                      {stepName}
                    </div>
                    <div className="ml-3 space-y-1">
                      {campos.map((campo, idx) => (
                        <div key={idx} className="text-sm text-red-700 flex items-start gap-2 leading-relaxed">
                          <span className="text-red-500 mt-1 flex-shrink-0">•</span>
                          <span className="flex-1">{campo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      );
    };

    toast.error(<ErrorMessage />);
  } else {
    const mensagem = mensagemPersonalizada || 'Verifique as informações obrigatórias antes de salvar.';
    toast.error(mensagem);
  }
}
