import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { PrazoStatusPill } from './PrazoStatusPill';
import { ObrigacaoDetalheResponse } from '@/api/obrigacao/types';

interface ConferenciaHeaderProps {
  cdIdentificacao?: number | string;
  prazos?: ObrigacaoDetalheResponse['solicitacaoPrazos'];
  idStatusAtual?: number;
}

export function ConferenciaHeader({ cdIdentificacao, prazos, idStatusAtual }: ConferenciaHeaderProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/obrigacao" className="hover:text-gray-700">
          <button
            type="button"
            onClick={() => router.push('/obrigacao')}
            className="flex items-center gap-3 text-gray-600 transition-colors hover:text-gray-900"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white">
              <ArrowLeft className="h-4 w-4" />
            </span>
            <span className="text-base font-medium">Obrigações</span>
          </button>
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-black" />
        <span className="font-medium text-gray-700">{cdIdentificacao?.toString() || 'Não identificado'}</span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Conferência da Obrigação</h1>
          <p className="text-sm text-gray-500">
            Visualize os dados completos, anexos e vínculos relacionados à obrigação selecionada.
          </p>
        </div>
        <PrazoStatusPill 
          idStatusAtual={idStatusAtual}
          prazos={prazos}
        />
      </div>
    </div>
  );
}

