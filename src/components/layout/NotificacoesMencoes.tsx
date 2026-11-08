'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import mencoesClient, { MencaoNaoLida, MencoesNaoLidas } from '@/api/obrigacao/mencoes-client';
import { useAtualizarMencoesNaoLidas } from '@/components/obrigacoes/mencoes/use-mencoes';
import { formatDateTimeBr } from '@/utils/utils';

interface NotificacoesMencoesProps {
  idConcessionaria?: number;
  mencoes: MencoesNaoLidas;
  onNavegar: () => void;
}

/** Lista as menções não lidas no painel do sino; abrir uma delas a marca como lida. */
export function NotificacoesMencoes({ idConcessionaria, mencoes, onNavegar }: NotificacoesMencoesProps) {
  const router = useRouter();
  const atualizar = useAtualizarMencoesNaoLidas(idConcessionaria);

  const abrir = async (mencao: MencaoNaoLida) => {
    onNavegar();
    router.push(`/obrigacao/${mencao.idObrigacao}/conferencia`);
    try {
      await mencoesClient.marcarComoLida(mencao.idMencao);
      await atualizar();
    } catch (error) {
      console.error('Erro ao marcar menção como lida:', error);
    }
  };

  const marcarTodas = async () => {
    try {
      await mencoesClient.marcarTodasComoLidas();
      await atualizar();
    } catch (error) {
      console.error('Erro ao marcar menções como lidas:', error);
      toast.error('Não foi possível marcar as menções como lidas.');
    }
  };

  return (
    <div className="mt-2 w-72 border-t border-gray-100 pt-2">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="font-medium">
          {mencoes.total} {mencoes.total === 1 ? 'menção não lida' : 'menções não lidas'}
        </span>
        <button type="button" onClick={marcarTodas} className="shrink-0 text-xs font-medium text-blue-600 hover:underline">
          Marcar todas como lidas
        </button>
      </div>
      <ul className="max-h-72 space-y-1 overflow-y-auto">
        {mencoes.itens.map((mencao) => (
          <li key={mencao.idMencao}>
            <button type="button" onClick={() => abrir(mencao)} className="w-full rounded-md px-2 py-1.5 text-left hover:bg-gray-50">
              <span className="block text-xs text-gray-900">
                <strong>{mencao.nmAutor}</strong> mencionou você em <strong>{mencao.cdIdentificacao}</strong>
              </span>
              <span className="mt-0.5 block truncate text-xs text-gray-500">{mencao.dsComentario}</span>
              <span className="block text-[11px] text-gray-400">{formatDateTimeBr(mencao.dtCriacao)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
