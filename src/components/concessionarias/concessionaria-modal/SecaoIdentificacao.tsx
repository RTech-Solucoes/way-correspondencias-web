'use client';

import { CheckCircleIcon, SpinnerIcon } from '@phosphor-icons/react';
import { InfoLabel } from '@/components/ui/info-label';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mask } from '@/utils/utils';
import { CampoErro, SecaoFormulario } from './SecaoFormulario';
import {
  CodigoAvailability,
  formatTelefone,
  SecaoConcessionariaProps,
} from './concessionaria-form';

interface SecaoIdentificacaoProps extends SecaoConcessionariaProps {
  codigoAvailability: CodigoAvailability;
  onCodigoBlur: () => void;
}

function DicaCodigo({
  codigoAvailability,
  erro,
}: {
  codigoAvailability: CodigoAvailability;
  erro?: string;
}) {
  if (erro || codigoAvailability === 'idle') return null;

  if (codigoAvailability === 'checking') {
    return (
      <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
        <SpinnerIcon className="h-4 w-4 animate-spin" />
        <span>Verificando código...</span>
      </div>
    );
  }

  if (codigoAvailability === 'available') {
    return (
      <div className="mt-1 flex items-center gap-1 text-sm text-green-600">
        <CheckCircleIcon className="h-4 w-4" weight="fill" />
        <span>Código disponível</span>
      </div>
    );
  }

  return null;
}

export default function SecaoIdentificacao({
  formData,
  errors,
  onChange,
  codigoAvailability,
  onCodigoBlur,
}: SecaoIdentificacaoProps) {
  return (
    <SecaoFormulario
      titulo="Identificação"
      descricao="Como a concessionária é identificada no sistema e nos documentos oficiais."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <InfoLabel
            htmlFor="cdConcessionaria"
            required
            info="Identificador curto e único da concessionária dentro do sistema (sem espaços, em minúsculas). É usado nas integrações, nos filtros e na troca de concessionária. Ex.: way112, mvp. Não é o número do contrato."
          >
            Código
          </InfoLabel>
          <Input
            id="cdConcessionaria"
            value={formData.cdConcessionaria}
            onChange={(event) => onChange('cdConcessionaria', event.target.value)}
            onBlur={onCodigoBlur}
            placeholder="Ex: mvp"
            className={
              errors.cdConcessionaria
                ? 'border-red-500'
                : codigoAvailability === 'available'
                  ? 'border-green-500'
                  : ''
            }
          />
          <CampoErro mensagem={errors.cdConcessionaria} />
          <DicaCodigo codigoAvailability={codigoAvailability} erro={errors.cdConcessionaria} />
        </div>

        <div>
          <InfoLabel
            htmlFor="nmConcessionaria"
            required
            info="Nome pelo qual a concessionária aparece no sistema: listagens, seleção de concessionária, e-mails e relatórios."
          >
            Nome
          </InfoLabel>
          <Input
            id="nmConcessionaria"
            value={formData.nmConcessionaria}
            onChange={(event) => onChange('nmConcessionaria', event.target.value)}
            placeholder="Ex: Way 112"
            maxLength={200}
            className={errors.nmConcessionaria ? 'border-red-500' : ''}
          />
          <CampoErro mensagem={errors.nmConcessionaria} />
        </div>

        <div>
          <InfoLabel
            htmlFor="nmRazaoSocial"
            info="Nome empresarial registrado na Junta Comercial, como consta no CNPJ e no contrato de concessão."
          >
            Razão Social
          </InfoLabel>
          <Input
            id="nmRazaoSocial"
            value={formData.nmRazaoSocial}
            onChange={(event) => onChange('nmRazaoSocial', event.target.value)}
            placeholder="Ex: Concessionária Rodovia XYZ S.A."
            maxLength={200}
            className={errors.nmRazaoSocial ? 'border-red-500' : ''}
          />
          <CampoErro mensagem={errors.nmRazaoSocial} />
        </div>

        <div>
          <InfoLabel
            htmlFor="nmFantasia"
            info="Nome usado no dia a dia e na comunicação com o público, quando diferente da razão social."
          >
            Nome Fantasia
          </InfoLabel>
          <Input
            id="nmFantasia"
            value={formData.nmFantasia}
            onChange={(event) => onChange('nmFantasia', event.target.value)}
            placeholder="Ex: Way 112"
            maxLength={200}
            className={errors.nmFantasia ? 'border-red-500' : ''}
          />
          <CampoErro mensagem={errors.nmFantasia} />
        </div>

        <div>
          <Label htmlFor="nrCnpj">CNPJ</Label>
          <Input
            id="nrCnpj"
            value={mask.cnpj(formData.nrCnpj)}
            onChange={(event) => onChange('nrCnpj', event.target.value)}
            placeholder="00.000.000/0000-00"
            maxLength={18}
            inputMode="numeric"
            className={errors.nrCnpj ? 'border-red-500' : ''}
          />
          <CampoErro mensagem={errors.nrCnpj} />
        </div>

        <div>
          <InfoLabel
            htmlFor="dsTelefone"
            info="Telefone gratuito de atendimento ao usuário da rodovia, no formato 0800 000 0000. Telefones fixos já cadastrados continuam válidos no formato (00) 0000-0000."
          >
            Telefone 0800
          </InfoLabel>
          <Input
            id="dsTelefone"
            value={formatTelefone(formData.dsTelefone)}
            onChange={(event) => onChange('dsTelefone', event.target.value)}
            placeholder="0800 000 0000"
            maxLength={14}
            inputMode="numeric"
            className={errors.dsTelefone ? 'border-red-500' : ''}
          />
          <CampoErro mensagem={errors.dsTelefone} />
        </div>
      </div>
    </SecaoFormulario>
  );
}
