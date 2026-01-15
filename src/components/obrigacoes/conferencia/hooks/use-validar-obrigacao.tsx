import { useState, useCallback } from 'react';
import obrigacaoClient from '@/api/obrigacao/client';
import { ObrigacaoDetalheResponse } from '@/api/obrigacao/types';
import { ObrigacaoFormData } from '@/components/obrigacoes/criar/ObrigacaoModal';
import { TipoEnum, CategoriaEnum } from '@/api/tipos/types';
import tiposClient from '@/api/tipos/client';

export interface ValidationError {
  step: number;
  campos: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface ValidacaoCompletaResult {
  isValid: boolean;
  errors: ValidationError[];
  loading: boolean;
}

const normalizeDate = (value?: string | null): string | null => {
  if (!value) return null;
  if (value.includes('T')) {
    return value.split('T')[0];
  }
  return value;
};

const mapDetalheToFormData = (detalhe: ObrigacaoDetalheResponse): ObrigacaoFormData => {
  const { obrigacao: obrigacaoDetalhe } = detalhe;
  const areaAtribuida = obrigacaoDetalhe.areas?.find((area) => area.tipoArea?.cdTipo === TipoEnum.ATRIBUIDA);
  const areasCondicionantes = obrigacaoDetalhe.areas
    ?.filter((area) => area.tipoArea?.cdTipo === TipoEnum.CONDICIONANTE)
    .map((area) => area.idArea) || [];

  return {
    idSolicitacao: obrigacaoDetalhe.idSolicitacao,
    cdIdentificador: obrigacaoDetalhe.cdIdentificacao,
    dsTarefa: obrigacaoDetalhe.dsTarefa || '',
    idStatusSolicitacao: obrigacaoDetalhe.statusSolicitacao?.idStatusSolicitacao || null,
    idTipoClassificacao: obrigacaoDetalhe.tipoClassificacao?.idTipo || null,
    idTipoPeriodicidade: obrigacaoDetalhe.tipoPeriodicidade?.idTipo || null,
    idTipoCriticidade: obrigacaoDetalhe.tipoCriticidade?.idTipo || null,
    idTipoNatureza: obrigacaoDetalhe.tipoNatureza?.idTipo || null,
    dsObservacao: obrigacaoDetalhe.dsObservacao || '',
    idObrigacaoPrincipal: obrigacaoDetalhe.obrigacaoPrincipal?.idSolicitacao || null,
    idsAreasCondicionantes: areasCondicionantes,
    idAreaAtribuida: areaAtribuida?.idArea || null,
    idTema: obrigacaoDetalhe.tema?.idTema || null,
    dtInicio: normalizeDate(obrigacaoDetalhe.dtInicio),
    dtTermino: normalizeDate(obrigacaoDetalhe.dtTermino),
    dtLimite: normalizeDate(obrigacaoDetalhe.dtLimite),
    nrDuracaoDias: obrigacaoDetalhe.nrDuracaoDias || null,
    idSolicitacaoCorrespondencia: obrigacaoDetalhe.correspondencia?.idSolicitacao || null,
    dsAntt: obrigacaoDetalhe.dsAntt || '',
    dsProtocoloExterno: obrigacaoDetalhe.dsProtocoloExterno || '',
    idObrigacaoRecusada: obrigacaoDetalhe.obrigacaoRecusada?.idSolicitacao || null,
    dsTac: obrigacaoDetalhe.dsTac || '',
  };
};

export function useValidarObrigacao() {
  const [loading, setLoading] = useState(false);

  const getInvalidFields = useCallback(
    (formData: ObrigacaoFormData | null, step: number, idClassificacaoCondicionada: number | null): string[] => {
      if (!formData) {
        return [];
      }

      const invalidFields: string[] = [];

      switch (step) {
        case 1:
          if (!formData.dsTarefa?.trim()) invalidFields.push('Tarefa');
          if (!formData.idTipoClassificacao) invalidFields.push('Classificação');
          if (!formData.idTipoCriticidade) invalidFields.push('Criticidade');
          if (!formData.idTipoNatureza) invalidFields.push('Natureza');

          const isCondicionada = formData.idTipoClassificacao === idClassificacaoCondicionada;
          if (isCondicionada && !formData.idObrigacaoPrincipal) {
            invalidFields.push('Obrigação Principal');
          }
          break;
        case 2:
          if (!formData.idTema) invalidFields.push('Tema');
          if (!formData.idAreaAtribuida) invalidFields.push('Área Atribuída');
          break;
        case 3:
          if (!formData.dtInicio) invalidFields.push('Data de Início');
          if (!formData.dtTermino) invalidFields.push('Data de Término');
          if (!formData.dtLimite) invalidFields.push('Data Limite');
          if (!formData.idTipoPeriodicidade) invalidFields.push('Periodicidade');

          if (formData.dtInicio && formData.dtTermino) {
            const dataInicio = new Date(formData.dtInicio);
            const dataTermino = new Date(formData.dtTermino);
            if (dataTermino <= dataInicio) {
              invalidFields.push('Data de Término deve ser posterior à Data de Início');
            }
          }

          if (formData.dtTermino && formData.dtLimite) {
            const dataTermino = new Date(formData.dtTermino);
            const dataLimite = new Date(formData.dtLimite);
            if (dataLimite < dataTermino) {
              invalidFields.push('Data Limite deve ser posterior ou igual à Data de Término');
            }
          }
          break;
      }

      return invalidFields;
    },
    [],
  );

  const validarObrigacao = useCallback(
    (
      formData: ObrigacaoFormData | null,
      idClassificacaoCondicionada: number | null,
      hasStep3ValidationErrors: boolean = false,
      requiredSteps: number[] = [1, 2, 3],
    ): ValidationResult => {
      if (!formData) {
        return { isValid: false, errors: [] };
      }

      const errors: ValidationError[] = [];
      requiredSteps.forEach((step) => {
        const invalidCampos = getInvalidFields(formData, step, idClassificacaoCondicionada);
        if (invalidCampos.length > 0 || (step === 3 && hasStep3ValidationErrors)) {
          errors.push({ step, campos: invalidCampos });
        }
      });

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    [getInvalidFields],
  );

  const validar = useCallback(
    async (idSolicitacao: number): Promise<ValidacaoCompletaResult> => {
      if (!idSolicitacao) {
        return { isValid: false, errors: [], loading: false };
      }

      try {
        setLoading(true);
        
        const detalhe = await obrigacaoClient.buscarDetalhePorId(idSolicitacao);
        const formData = mapDetalheToFormData(detalhe);

        const tipos = await tiposClient.buscarPorCategorias([CategoriaEnum.OBRIG_CLASSIFICACAO]);
        const condicionada = tipos.find((tipo) => tipo.cdTipo === TipoEnum.CONDICIONADA);
        const idClassificacaoCondicionada = condicionada?.idTipo || null;

        const { isValid, errors } = validarObrigacao(
          formData,
          idClassificacaoCondicionada,
          false,
          [1, 2, 3]
        );

        return { isValid, errors, loading: false };
      } catch (error) {
        console.error('Erro ao validar obrigação:', error);
        return { isValid: false, errors: [], loading: false };
      } finally {
        setLoading(false);
      }
    },
    [validarObrigacao],
  );

  return { validarObrigacao, validar, loading };
}
