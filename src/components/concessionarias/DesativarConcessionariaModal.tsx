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
  {
    icon: EnvelopeSimpleIcon,
    text: 'As configurações de e-mail, incluindo inbox e SMTP, também são desativadas.',
  },
  { icon: UsersThreeIcon, text: 'Os vínculos com os responsáveis são desativados.' },
  {
    icon: ClockCounterClockwiseIcon,
    text: 'Nenhum dado é excluído. Tudo volta a funcionar quando a concessionária for reativada.',
  },
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

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? handleClose() : undefined)}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader className="shrink-0 pr-6">
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <WarningIcon className="h-5 w-5 flex-shrink-0" weight="fill" />
            Desativar concessionária
          </DialogTitle>
          <DialogDescription>
            A desativação é reversível. Informe uma justificativa para registrar esta ação no
            cadastro.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          <RegistroDesativacao
            concessionaria={concessionaria}
            variant="neutral"
            title="Observação: já houve uma desativação anterior"
          />

          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
            <p className="mb-1.5 text-sm font-medium text-amber-900">O que acontece durante a desativação:</p>
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
              Informe o motivo da Desativação <span className="text-red-600">*</span>
            </Label>

            <Textarea
              id="ds-motivo-desativacao"
              value={motivo}
              onChange={(event) => setMotivo(event.target.value.slice(0, MOTIVO_DESATIVACAO_MAX_LENGTH))}
              onBlur={() => setTouched(true)}
              placeholder="Descreva o motivo da desativação"
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
              Seu usuário, a data e o horário serão registrados com esta justificativa. Se já existir
              um motivo salvo, ele será substituído. Essas informações ficarão visíveis no cadastro
              da concessionária.
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
