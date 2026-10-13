import {
  ConfiguracaoConcessionariaRequest,
  ConfiguracaoConcessionariaResponse,
} from '@/api/concessionaria/types';

type ConfiguracaoProgressInput =
  | ConfiguracaoConcessionariaRequest
  | ConfiguracaoConcessionariaResponse
  | null
  | undefined;

const CONFIGURACAO_TOTAL_FIELDS = 12;

function hasValue(value: unknown) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

/** Únicos campos obrigatórios para salvar: início e fim da concessão. */
export function areRequiredConfiguracaoFieldsFilled(configuracao: ConfiguracaoProgressInput) {
  if (!configuracao) return false;

  const request = configuracao as Partial<ConfiguracaoConcessionariaRequest>;
  return hasValue(request.dtBaseInicioConcessao) && hasValue(request.dtLimiteConcessao);
}

export function getConfiguracaoProgress(configuracao: ConfiguracaoProgressInput) {
  if (!configuracao) {
    return {
      filled: 0,
      total: CONFIGURACAO_TOTAL_FIELDS,
      percent: 0,
    };
  }

  const response = configuracao as Partial<ConfiguracaoConcessionariaResponse>;
  const request = configuracao as Partial<ConfiguracaoConcessionariaRequest>;

  const checks = [
    hasValue(request.dtBaseInicioConcessao),
    hasValue(request.dtLimiteConcessao),
    hasValue(request.nrCodigoIdentificacao),
    hasValue(request.dtInboxInicio),
    hasValue(request.dsInboxEmail),
    hasValue(request.dsInboxClientId),
    hasValue(request.dsInboxTenantKeyId),
    hasValue(request.dsInboxSecret) || response.inboxSecretConfigurado === true,
    hasValue(request.dsSmtpMailHost),
    hasValue(request.dsSmtpPort),
    hasValue(request.dsSmtpUsername),
    hasValue(request.dsSmtpPassword) || response.smtpPasswordConfigurada === true,
  ];

  const filled = checks.filter(Boolean).length;

  return {
    filled,
    total: CONFIGURACAO_TOTAL_FIELDS,
    percent: Math.round((filled / CONFIGURACAO_TOTAL_FIELDS) * 100),
  };
}
