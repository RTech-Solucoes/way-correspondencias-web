'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ClockCounterClockwiseIcon,
  EnvelopeSimpleIcon,
  ProhibitIcon,
  UsersThreeIcon,
  WarningIcon,
} from '@phosphor-icons/react';
import {
  ConcessionariaResponse,
  MOTIVOS_DESATIVACAO_SUGERIDOS,
  MOTIVO_DESATIVACAO_MAX_LENGTH,
  MOTIVO_DESATIVACAO_MIN_LENGTH,
} from '@/api/concessionaria/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import RegistroDesativacao from './RegistroDesativacao';

interface DesativarConcessionariaModalProps {
  concessionaria: ConcessionariaResponse | null;
  open: boolean;
  saving?: boolean;
  onClose: () => void;
  onConfirm: (dsMotivoDesativacao: string) => Promise<void>;
}

const IMPACTOS = [
  { icon: ProhibitIcon, text: 'Os usuários deixam de acessar os dados desta concessionária.' },
  { icon: EnvelopeSimpleIcon, text: 'A configuração de e-mail (inbox e SMTP) é desativada junto.' },
  { icon: UsersThreeIcon, text: 'Os vínculos dos responsáveis são desativados.' },
  { icon: ClockCounterClockwiseIcon, text: 'Nenhum dado é excluído — tudo volta ao reativar.' },
];

export default function DesativarConcessionariaModal({
  concessionaria,
  open,
  saving = false,
  onClose,
  onConfirm,
}: DesativarConcessionariaModalProps) {
  const [motivo, setMotivo] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setMotivo('');
      setTouched(false);
    }
  }, [open, concessionaria?.idConcessionaria]);

  const motivoTrimmed = motivo.trim();
  const erro = useMemo(() => {
    if (!motivoTrimmed) return 'Informe o motivo da desativação.';
    if (motivoTrimmed.length < MOTIVO_DESATIVACAO_MIN_LENGTH) {
      return `Descreva o motivo com pelo menos ${MOTIVO_DESATIVACAO_MIN_LENGTH} caracteres.`;
    }
    return null;
  }, [motivoTrimmed]);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleConfirm = async () => {
    setTouched(true);
    if (erro || saving) return;
    await onConfirm(motivoTrimmed);
  };

  const aplicarSugestao = (sugestao: string) => {
    setMotivo(sugestao);
    setTouched(true);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? handleClose() : undefined)}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader className="shrink-0 pr-6">
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <WarningIcon className="h-5 w-5 flex-shrink-0" weight="fill" />
            Desativar concessionária
          </DialogTitle>
          <DialogDescription>
            Você está desativando{' '}
            <span className="font-medium text-gray-900">
              {concessionaria?.nmConcessionaria || ''}
            </span>
            {concessionaria?.cdConcessionaria ? ` (${concessionaria.cdConcessionaria})` : ''}. A
            justificativa é obrigatória e fica registrada no cadastro.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          <RegistroDesativacao
            concessionaria={concessionaria}
            variant="neutral"
            title="Observação: já houve uma desativação anterior"
          />

          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
            <p className="mb-1.5 text-sm font-medium text-amber-900">O que acontece ao desativar</p>
            <ul className="space-y-1">
              {IMPACTOS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex gap-2 text-[13px] leading-snug text-amber-900">
                  <Icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" weight="bold" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ds-motivo-desativacao">
              Motivo da desativação <span className="text-red-600">*</span>
            </Label>

            <div className="flex flex-wrap gap-1.5">
              {MOTIVOS_DESATIVACAO_SUGERIDOS.map((sugestao) => (
                <button
                  key={sugestao}
                  type="button"
                  disabled={saving}
                  onClick={() => aplicarSugestao(sugestao)}
                  className={`rounded-full border px-2.5 py-1 text-xs transition-colors disabled:opacity-50 ${
                    motivoTrimmed === sugestao
                      ? 'border-sky-300 bg-sky-100 text-sky-900'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-900'
                  }`}
                >
                  {sugestao}
                </button>
              ))}
            </div>

            <Textarea
              id="ds-motivo-desativacao"
              value={motivo}
              onChange={(event) => setMotivo(event.target.value.slice(0, MOTIVO_DESATIVACAO_MAX_LENGTH))}
              onBlur={() => setTouched(true)}
              placeholder="Descreva o motivo da desativação. Ex.: contrato de concessão encerrado em 31/08/2026, conforme comunicado da diretoria."
              rows={3}
              disabled={saving}
              aria-invalid={touched && !!erro}
              className={touched && erro ? 'border-red-500 rounded-2xl' : 'rounded-2xl'}
            />

            <div className="flex items-start justify-between gap-3">
              <p className={`text-xs ${touched && erro ? 'text-red-600' : 'text-gray-500'}`}>
                {touched && erro
                  ? erro
                  : `Mínimo de ${MOTIVO_DESATIVACAO_MIN_LENGTH} caracteres.`}
              </p>
              <span className="whitespace-nowrap text-xs text-gray-400">
                {motivo.length}/{MOTIVO_DESATIVACAO_MAX_LENGTH}
              </span>
            </div>
          </div>

          <p className="flex gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
            <ClockCounterClockwiseIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>
              Seu usuário e a data/hora da desativação serão registrados junto com este motivo,
              substituindo qualquer registro anterior, e ficarão visíveis na listagem de
              concessionárias.
            </span>
          </p>
        </div>

        <DialogFooter className="shrink-0">
          <Button type="button" variant="outline" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            isLoading={saving}
            disabled={saving || !!erro}
          >
            Desativar concessionária
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
