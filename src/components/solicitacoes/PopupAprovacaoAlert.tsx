'use client';

import React, { useEffect, useState } from 'react';
import OkAlert from '@/components/ui/OkAlert';
import { SolicitacaoDetalheResponse } from '@/api/solicitacoes/types';

type Props = {
  openModal: boolean;
  solicitacao: SolicitacaoDetalheResponse | null;
  currentUserPerfil?: number | null;
};

export default function PopupAprovacaoAlert({ openModal, solicitacao, currentUserPerfil }: Props) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (openModal) {
      setOpen(false);
      setShown(false);
      setMessage('');
    }
  }, [openModal, solicitacao?.solicitacao?.idSolicitacao]);

  useEffect(() => {
    if (!openModal || shown) return;
    if (currentUserPerfil !== 2) return; 

    const flag = (solicitacao?.solicitacao?.flAnaliseGerenteDiretor || '').toUpperCase();
    const isAnaliseReg = solicitacao?.statusSolicitacao?.idStatusSolicitacao === 5;
    if (!flag || flag === 'N' || !isAnaliseReg) return;

    const acoes = (solicitacao?.tramitacoes ?? [])
      .filter((t) => t?.tramitacao?.idStatusSolicitacao === 3)
      .flatMap((t) => (t?.tramitacao?.tramitacaoAcao ?? [] as unknown[])) as Array<{
        responsavelArea?: { responsavel?: { idPerfil?: number }, area?: { idArea?: number } };
        flAcao?: string;
      }>;

    const solicitacaoAreaIds: number[] = Array.isArray(solicitacao?.solicitacao?.area)
      ? (solicitacao!.solicitacao!.area as Array<{ idArea?: number }>).
          map(a => +((a?.idArea as unknown) as number)).
          filter(id => !Number.isNaN(id))
      : [];

    const hasGerente = acoes.some((ta) => {
      const perfil = ta?.responsavelArea?.responsavel?.idPerfil;
      const areaId = +((ta?.responsavelArea?.area?.idArea as unknown) as number);
      const okArea = solicitacaoAreaIds.length === 0 || (!Number.isNaN(areaId) && solicitacaoAreaIds.includes(areaId));
      return okArea && perfil === 4 && ta?.flAcao === 'T';
    });
    const hasDiretor = acoes.some((ta) => ta?.responsavelArea?.responsavel?.idPerfil === 3 && ta?.flAcao === 'T');

    if (flag === 'G' && !hasGerente) {
      setMessage('Esta solicitação não foi respondida por um Gerente da Área');
      setOpen(true);
      setShown(true);
    } else if (flag === 'D' && !hasDiretor) {
      setMessage('Esta solicitação não foi respondida por um Diretor');
      setOpen(true);
      setShown(true);
    } else if (flag === 'A' && !hasDiretor && !hasGerente) {
      setMessage('Esta solicitação não foi respondida por um Diretor e/ou pelo Gerente da Área');
      setOpen(true);
      setShown(true);
    }
  }, [openModal, shown, solicitacao, currentUserPerfil]);

  return (
      <OkAlert
          open={open} onClose={() => setOpen(false)}
          message={message}
      />
  );
}


