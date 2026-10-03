'use client';

import { InfoLabel } from '@/components/ui/info-label';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CampoErro, SecaoFormulario } from './SecaoFormulario';
import { SecaoConcessionariaProps, UFS_BRASIL } from './concessionaria-form';

export default function SecaoLocalizacao({
  formData,
  errors,
  onChange,
}: SecaoConcessionariaProps) {
  return (
    <SecaoFormulario
      titulo="Trecho e localização"
      descricao="Onde a concessionária atua: sede administrativa e trecho concedido."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="sgUf">UF</Label>
          <Select
            value={formData.sgUf || undefined}
            onValueChange={(value) => onChange('sgUf', value === '__empty' ? '' : value)}
          >
            <SelectTrigger id="sgUf" className={errors.sgUf ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecione a UF" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__empty">Não informado</SelectItem>
              {UFS_BRASIL.map((uf) => (
                <SelectItem key={uf} value={uf}>
                  {uf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CampoErro mensagem={errors.sgUf} />
        </div>

        <div>
          <Label htmlFor="dsEndereco">Endereço</Label>
          <Input
            id="dsEndereco"
            value={formData.dsEndereco}
            onChange={(event) => onChange('dsEndereco', event.target.value)}
            placeholder="Rua, número, bairro, cidade"
            maxLength={255}
            className={errors.dsEndereco ? 'border-red-500' : ''}
          />
          <CampoErro mensagem={errors.dsEndereco} />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="dsRodoviaTrecho">Rodovia / trecho</Label>
          <Input
            id="dsRodoviaTrecho"
            value={formData.dsRodoviaTrecho}
            onChange={(event) => onChange('dsRodoviaTrecho', event.target.value)}
            placeholder="Ex: BR-101 - Trecho Sul"
            maxLength={255}
            className={errors.dsRodoviaTrecho ? 'border-red-500' : ''}
          />
          <CampoErro mensagem={errors.dsRodoviaTrecho} />
        </div>

        <div className="md:col-span-2">
          <InfoLabel
            htmlFor="dsSegmentoConcessao"
            info="Identificação do segmento concedido conforme o contrato, como lote, sentido ou subtrecho."
          >
            Segmento da Concessão
          </InfoLabel>
          <Input
            id="dsSegmentoConcessao"
            value={formData.dsSegmentoConcessao}
            onChange={(event) => onChange('dsSegmentoConcessao', event.target.value)}
            placeholder="Ex: Lote 1 - Sentido Norte"
            maxLength={255}
            className={errors.dsSegmentoConcessao ? 'border-red-500' : ''}
          />
          <CampoErro mensagem={errors.dsSegmentoConcessao} />
        </div>

        <div>
          <InfoLabel
            htmlFor="nrKmInicial"
            info="Marco quilométrico onde começa o trecho concedido. Aceita até 3 casas decimais (ex.: 12,500)."
          >
            Km Inicial
          </InfoLabel>
          <Input
            id="nrKmInicial"
            value={formData.nrKmInicial}
            onChange={(event) => onChange('nrKmInicial', event.target.value)}
            placeholder="Ex: 12,500"
            inputMode="decimal"
            className={errors.nrKmInicial ? 'border-red-500' : ''}
          />
          <CampoErro mensagem={errors.nrKmInicial} />
        </div>

        <div>
          <InfoLabel
            htmlFor="nrKmFinal"
            info="Marco quilométrico onde termina o trecho concedido. Não pode ser menor que o km inicial."
          >
            Km Final
          </InfoLabel>
          <Input
            id="nrKmFinal"
            value={formData.nrKmFinal}
            onChange={(event) => onChange('nrKmFinal', event.target.value)}
            placeholder="Ex: 148,300"
            inputMode="decimal"
            className={errors.nrKmFinal ? 'border-red-500' : ''}
          />
          <CampoErro mensagem={errors.nrKmFinal} />
        </div>
      </div>
    </SecaoFormulario>
  );
}
