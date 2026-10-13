'use client';

import { InfoLabel } from '@/components/ui/info-label';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CampoErro, SecaoFormulario } from './SecaoFormulario';
import { SecaoConcessionariaProps } from './concessionaria-form';

/**
 * Reserva a mesma altura para todos os rótulos: sem isso, um rótulo de duas
 * linhas empurra o campo para baixo e desalinha a linha da seção.
 */
function RotuloAlinhado({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-10 items-start">{children}</div>;
}

export default function SecaoContrato({ formData, errors, onChange }: SecaoConcessionariaProps) {
  return (
    <SecaoFormulario
      titulo="Contrato de concessão"
      descricao="Dados regulatórios usados nos controles e relatórios de obrigações."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <RotuloAlinhado>
            <Label htmlFor="nrContratoAntt">Contrato ANTT</Label>
          </RotuloAlinhado>
          <Input
            id="nrContratoAntt"
            value={formData.nrContratoAntt}
            onChange={(event) => onChange('nrContratoAntt', event.target.value)}
            placeholder="Número do contrato ANTT"
            maxLength={100}
            className={errors.nrContratoAntt ? 'border-red-500' : ''}
          />
          <CampoErro mensagem={errors.nrContratoAntt} />
        </div>

        <div>
          <RotuloAlinhado>
            <InfoLabel
              htmlFor="dtAssinaturaContrato"
              info="Data em que o contrato de concessão foi assinado com o poder concedente."
            >
              Data de assinatura do contrato
            </InfoLabel>
          </RotuloAlinhado>
          <Input
            id="dtAssinaturaContrato"
            type="date"
            value={formData.dtAssinaturaContrato}
            onChange={(event) => onChange('dtAssinaturaContrato', event.target.value)}
            className={errors.dtAssinaturaContrato ? 'border-red-500' : ''}
          />
          <CampoErro mensagem={errors.dtAssinaturaContrato} />
        </div>

        <div>
          <RotuloAlinhado>
            <InfoLabel
              htmlFor="dtAssuncao"
              info="Data em que a concessionária assumiu efetivamente a operação do trecho. Não pode ser anterior à assinatura do contrato."
            >
              Data de Assunção
            </InfoLabel>
          </RotuloAlinhado>
          <Input
            id="dtAssuncao"
            type="date"
            value={formData.dtAssuncao}
            min={formData.dtAssinaturaContrato || undefined}
            onChange={(event) => onChange('dtAssuncao', event.target.value)}
            className={errors.dtAssuncao ? 'border-red-500' : ''}
          />
          <CampoErro mensagem={errors.dtAssuncao} />
        </div>
      </div>
    </SecaoFormulario>
  );
}
