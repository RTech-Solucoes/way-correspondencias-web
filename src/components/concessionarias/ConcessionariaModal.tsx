'use client';

import { ConcessionariaRequest, ConcessionariaResponse } from '@/api/concessionaria/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import RegistroDesativacao from './RegistroDesativacao';
import AvisoConfiguracaoTecnica from './concessionaria-modal/AvisoConfiguracaoTecnica';
import SecaoContrato from './concessionaria-modal/SecaoContrato';
import SecaoIdentificacao from './concessionaria-modal/SecaoIdentificacao';
import SecaoLocalizacao from './concessionaria-modal/SecaoLocalizacao';
import SecaoObservacoes from './concessionaria-modal/SecaoObservacoes';
import { useConcessionariaForm } from './concessionaria-modal/use-concessionaria-form';

interface ConcessionariaModalProps {
  concessionaria: ConcessionariaResponse | null;
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onCodigoDisponivel?: (codigo: string, idConcessionaria: number | null) => Promise<boolean | null>;
  onSave: (concessionaria: ConcessionariaRequest) => void | Promise<void>;
}

export default function ConcessionariaModal({
  concessionaria,
  open,
  loading = false,
  onClose,
  onCodigoDisponivel,
  onSave,
}: ConcessionariaModalProps) {
  const {
    formData,
    errors,
    saving,
    codigoAvailability,
    isSubmitDisabled,
    handleChange,
    handleSubmit,
    checkCodigoDisponivel,
  } = useConcessionariaForm({ concessionaria, open, loading, onCodigoDisponivel, onSave });

  const camposDaSecao = { formData, errors, onChange: handleChange };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden gap-4">
        <DialogHeader className="flex-shrink-0 pr-6">
          <DialogTitle>{concessionaria ? 'Editar concessionária' : 'Nova concessionária'}</DialogTitle>
          <p className="mt-1 text-sm text-gray-500">
            Dados cadastrais, regulatórios e administrativos da concessionária.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col gap-4" noValidate>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            {concessionaria?.flAtivo === 'N' && (
              <RegistroDesativacao concessionaria={concessionaria} variant="danger" />
            )}

            <SecaoIdentificacao
              {...camposDaSecao}
              codigoAvailability={codigoAvailability}
              onCodigoBlur={() => {
                void checkCodigoDisponivel();
              }}
            />

            <SecaoLocalizacao {...camposDaSecao} />

            <SecaoContrato {...camposDaSecao} />

            <SecaoObservacoes {...camposDaSecao} />

            <AvisoConfiguracaoTecnica novoCadastro={!concessionaria} />
          </div>

          <DialogFooter className="flex-shrink-0 gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-blue-700" disabled={isSubmitDisabled}>
              {saving ? 'Salvando...' : concessionaria ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
