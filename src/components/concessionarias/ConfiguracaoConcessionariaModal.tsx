'use client';

import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { InfoIcon, WarningCircleIcon } from '@phosphor-icons/react';
import {
  ConcessionariaResponse,
  ConfiguracaoConcessionariaRequest,
  ConfiguracaoConcessionariaResponse,
} from '@/api/concessionaria/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useConfiguracaoConcessionariaQuery,
  useSaveConfiguracaoConcessionaria,
} from './hooks/use-concessionarias-query';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/utils/utils';
import ConfiguracaoProgress from './ConfiguracaoProgress';
import RegistroDesativacao from './RegistroDesativacao';
import { areRequiredConfiguracaoFieldsFilled } from './configuracao-progress';

interface ConfiguracaoConcessionariaModalProps {
  concessionaria?: ConcessionariaResponse | null;
  configuracao?: ConfiguracaoConcessionariaResponse | null;
  open: boolean;
  canInserir?: boolean;
  canAtualizar?: boolean;
  canDeletar?: boolean;
  loading?: boolean;
  onClose: () => void;
  onSave?: (configuracao: ConfiguracaoConcessionariaRequest) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}

const initialForm: ConfiguracaoConcessionariaRequest = {
  dtInboxInicio: null,
  dsInboxEmail: '',
  dsInboxClientId: '',
  dsInboxTenantKeyId: '',
  dsInboxSecret: '',
  dsSmtpMailHost: '',
  dsSmtpPort: null,
  dsSmtpUsername: '',
  dsSmtpPassword: '',
  dtBaseInicioConcessao: null,
  dtLimiteConcessao: null,
  nrCodigoIdentificacao: '',
};

const SECRET_MASK = '********';
type ConfiguracaoField = keyof ConfiguracaoConcessionariaRequest;
type ConfiguracaoErrors = Partial<Record<ConfiguracaoField, string>>;

const normalizeSecretValue = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed && trimmed !== SECRET_MASK ? trimmed : null;
};

const toDateInputValue = (value?: string | null) => (value ? value.slice(0, 10) : '');

const toLocalDateTimePayload = (value?: string | null) => {
  const date = toDateInputValue(value);
  return date ? `${date}T00:00:00` : null;
};

const isValidEmail = (value: string) => {
  const email = value.trim();
  const parts = email.split('@');

  if (email.length > 254 || parts.length !== 2) return false;

  const [local, domain] = parts;
  if (!local || !domain || local.length > 64) return false;
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  if (domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) return false;

  const localPattern = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+$/;
  if (!localPattern.test(local)) return false;

  const labels = domain.split('.');
  if (labels.length < 2 || !/^[A-Za-z]{2,63}$/.test(labels[labels.length - 1])) return false;

  return labels.every(label => /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(label));
};

const isValidSmtpHost = (value: string) => {
  const host = value.trim();
  const hostnamePattern = /^(localhost|([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})$/;
  const ipv4Pattern =
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

  return hostnamePattern.test(host) || ipv4Pattern.test(host);
};

const isConfiguracaoField = (field: string): field is ConfiguracaoField => field in initialForm;

function InfoLabel({
  htmlFor,
  children,
  info,
  required = false,
}: {
  htmlFor: string;
  children: ReactNode;
  info: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pointerMovedRef = useRef(false);

  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor}>
        {children}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>
      <TooltipProvider delayDuration={250}>
        <Tooltip open={open} onOpenChange={setOpen}>
          <TooltipTrigger asChild>
            <button
              type="button"
              tabIndex={-1}
              aria-label={`Ajuda: ${String(children)}`}
              className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:text-[#276EEB] focus:outline-none"
              onFocus={(event) => event.currentTarget.blur()}
              onPointerEnter={() => {
                if (pointerMovedRef.current) setOpen(true);
              }}
              onPointerMove={() => {
                pointerMovedRef.current = true;
                setOpen(true);
              }}
              onPointerLeave={() => {
                pointerMovedRef.current = false;
                setOpen(false);
              }}
            >
              <InfoIcon className="h-3.5 w-3.5" weight="bold" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" align="start" className="max-w-sm leading-relaxed">
            {info}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-1 mt-1">
      <WarningCircleIcon className="h-4 w-4 text-red-500" />
      <p className="text-red-500 text-sm">{message}</p>
    </div>
  );
}

export default function ConfiguracaoConcessionariaModal({
  concessionaria = null,
  configuracao: externalConfiguracao,
  open,
  canInserir,
  canAtualizar,
  canDeletar,
  loading = false,
  onClose,
  onSave,
  onDelete,
}: ConfiguracaoConcessionariaModalProps) {
  const [formData, setFormData] = useState<ConfiguracaoConcessionariaRequest>(initialForm);
  const [errors, setErrors] = useState<ConfiguracaoErrors>({});
  const [editingSecrets, setEditingSecrets] = useState({
    inbox: false,
    smtp: false,
  });
  const idConcessionaria = concessionaria?.idConcessionaria;
  const { data: fetchedConfiguracao, isLoading } = useConfiguracaoConcessionariaQuery(
    open && externalConfiguracao === undefined ? idConcessionaria : null
  );
  const saveMutation = useSaveConfiguracaoConcessionaria();
  const configuracao = externalConfiguracao !== undefined ? externalConfiguracao : fetchedConfiguracao;
  const isBusy = loading || isLoading || saveMutation.isPending;
  const canSalvar = configuracao ? (canAtualizar ?? true) : (canInserir ?? true);

  useEffect(() => {
    if (!open) return;

    setEditingSecrets({ inbox: false, smtp: false });
    setErrors({});

    if (configuracao) {
      setFormData({
        dtInboxInicio: configuracao.dtInboxInicio,
        dsInboxEmail: configuracao.dsInboxEmail || '',
        dsInboxClientId: configuracao.dsInboxClientId || '',
        dsInboxTenantKeyId: configuracao.dsInboxTenantKeyId || '',
        dsInboxSecret: '',
        dsSmtpMailHost: configuracao.dsSmtpMailHost || '',
        dsSmtpPort: configuracao.dsSmtpPort,
        dsSmtpUsername: configuracao.dsSmtpUsername || '',
        dsSmtpPassword: '',
        dtBaseInicioConcessao: configuracao.dtBaseInicioConcessao,
        dtLimiteConcessao: configuracao.dtLimiteConcessao,
        nrCodigoIdentificacao: configuracao.nrCodigoIdentificacao || '',
      });
    } else {
      setFormData(initialForm);
    }
  }, [configuracao, open]);

  const handleChange = (field: keyof ConfiguracaoConcessionariaRequest, value: string | number | null) => {
    let nextValue = value;

    if (field === 'nrCodigoIdentificacao' && typeof value === 'string') {
      nextValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setFormData(prev => ({ ...prev, [field]: nextValue }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSecretFocus = (field: keyof typeof editingSecrets) => {
    setEditingSecrets(prev => ({ ...prev, [field]: true }));
  };

  const handleSecretBlur = (field: keyof typeof editingSecrets) => {
    const value = field === 'inbox' ? formData.dsInboxSecret : formData.dsSmtpPassword;
    if (!value) {
      setEditingSecrets(prev => ({ ...prev, [field]: false }));
    }
  };

  const getEmailError = (value: string, label: string) => {
    const trimmed = value.trim();
    if (trimmed && !isValidEmail(trimmed)) {
      return `${label} deve ser um e-mail válido.`;
    }

    return '';
  };

  const setFieldValidation = (field: ConfiguracaoField, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message || undefined }));
    return !message;
  };

  const validateForm = () => {
    const newErrors: ConfiguracaoErrors = {};

    if (!formData.dtBaseInicioConcessao) {
      newErrors.dtBaseInicioConcessao = 'Início da concessão é obrigatório.';
    }

    if (!formData.dtLimiteConcessao) {
      newErrors.dtLimiteConcessao = 'Fim da concessão é obrigatório.';
    }

    if (
      formData.dtBaseInicioConcessao &&
      formData.dtLimiteConcessao &&
      toDateInputValue(formData.dtLimiteConcessao) < toDateInputValue(formData.dtBaseInicioConcessao)
    ) {
      newErrors.dtLimiteConcessao = 'Fim da concessão deve ser maior ou igual ao início da concessão.';
    }

    const inboxEmail = formData.dsInboxEmail?.trim() || '';
    const inboxEmailError = getEmailError(inboxEmail, 'E-mail Outlook');
    if (inboxEmailError) {
      newErrors.dsInboxEmail = inboxEmailError;
    }

    const smtpUsername = formData.dsSmtpUsername?.trim() || '';
    const smtpUsernameError = getEmailError(smtpUsername, 'Usuário SMTP');
    if (smtpUsernameError) {
      newErrors.dsSmtpUsername = smtpUsernameError;
    }

    const smtpHost = formData.dsSmtpMailHost?.trim() || '';
    if (smtpHost && !isValidSmtpHost(smtpHost)) {
      newErrors.dsSmtpMailHost = 'Host SMTP deve ser válido, como smtp.office365.com.';
    }

    if (formData.dsSmtpPort != null && (formData.dsSmtpPort < 1 || formData.dsSmtpPort > 65535)) {
      newErrors.dsSmtpPort = 'Porta SMTP deve estar entre 1 e 65535.';
    }

    if (inboxEmail.length > 100) {
      newErrors.dsInboxEmail = 'E-mail Outlook deve ter no máximo 100 caracteres.';
    }

    if (formData.dsInboxClientId && formData.dsInboxClientId.length > 100) {
      newErrors.dsInboxClientId = 'Client ID Azure deve ter no máximo 100 caracteres.';
    }

    if (formData.dsInboxTenantKeyId && formData.dsInboxTenantKeyId.length > 100) {
      newErrors.dsInboxTenantKeyId = 'Tenant ID Azure deve ter no máximo 100 caracteres.';
    }

    if (formData.dsInboxSecret && formData.dsInboxSecret.length > 300) {
      newErrors.dsInboxSecret = 'Client secret Azure deve ter no máximo 300 caracteres.';
    }

    if (smtpHost.length > 100) {
      newErrors.dsSmtpMailHost = 'Host SMTP deve ter no máximo 100 caracteres.';
    }

    if (smtpUsername.length > 100) {
      newErrors.dsSmtpUsername = 'Usuário SMTP deve ter no máximo 100 caracteres.';
    }

    if (formData.dsSmtpPassword && formData.dsSmtpPassword.length > 300) {
      newErrors.dsSmtpPassword = 'Senha SMTP deve ter no máximo 300 caracteres.';
    }

    const codigoIdentificacao = (formData.nrCodigoIdentificacao || '').replace(/\D/g, '');
    if (codigoIdentificacao && codigoIdentificacao.length > 4) {
      newErrors.nrCodigoIdentificacao = 'Código de identificação deve ter no máximo 4 dígitos.';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const applyApiValidationErrors = (error: unknown) => {
    const payload = (error as { payload?: { errors?: Array<{ field?: string; message?: string }> } })?.payload;
    const apiErrors = payload?.errors;
    if (!apiErrors?.length) return false;

    const nextErrors: ConfiguracaoErrors = {};
    apiErrors.forEach((apiError) => {
      if (apiError.field && isConfiguracaoField(apiError.field)) {
        nextErrors[apiError.field] = apiError.message || 'Campo inválido.';
      }
    });

    if (!Object.keys(nextErrors).length) return false;

    setErrors(nextErrors);
    return true;
  };

  const normalizeOptionalString = (value?: string | null) => value?.trim() || null;

  const normalizeCodigoIdentificacao = (value?: string | null) => {
    const digits = (value || '').replace(/\D/g, '');
    if (!digits) return null;
    return digits.padStart(4, '0').slice(-4);
  };

  const normalizeOptionalSecret = (value?: string | null) => {
    return normalizeSecretValue(value);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSalvar || !validateForm()) return;

    const statusConcessionaria = concessionaria?.flAtivo || configuracao?.flAtivo;
    const payload: ConfiguracaoConcessionariaRequest = {
      ...formData,
      dtInboxInicio: toLocalDateTimePayload(formData.dtInboxInicio),
      dsInboxEmail: normalizeOptionalString(formData.dsInboxEmail),
      dsInboxClientId: normalizeOptionalString(formData.dsInboxClientId),
      dsInboxTenantKeyId: normalizeOptionalString(formData.dsInboxTenantKeyId),
      dsInboxSecret: normalizeOptionalSecret(formData.dsInboxSecret),
      dsSmtpMailHost: normalizeOptionalString(formData.dsSmtpMailHost),
      dsSmtpPort: formData.dsSmtpPort || null,
      dsSmtpUsername: normalizeOptionalString(formData.dsSmtpUsername),
      dsSmtpPassword: normalizeOptionalSecret(formData.dsSmtpPassword),
      dtBaseInicioConcessao: formData.dtBaseInicioConcessao || null,
      dtLimiteConcessao: formData.dtLimiteConcessao || null,
      nrCodigoIdentificacao: normalizeCodigoIdentificacao(formData.nrCodigoIdentificacao),
      ...(statusConcessionaria ? { flAtivo: statusConcessionaria } : {}),
    };

    if (onSave) {
      try {
        await onSave(payload);
      } catch (error) {
        applyApiValidationErrors(error);
      }
      return;
    }

    if (!idConcessionaria) return;

    try {
      await saveMutation.mutateAsync({
        id: idConcessionaria,
        hasConfiguracao: !!configuracao?.idConfiguracaoConcessionaria || !!concessionaria?.configuracaoCadastrada,
        data: payload,
      });
      onClose();
    } catch (error) {
      applyApiValidationErrors(error);
    }
  };

  const inboxSecretDisplayValue =
    formData.dsInboxSecret || (configuracao?.inboxSecretConfigurado && !editingSecrets.inbox ? SECRET_MASK : '');
  const smtpPasswordDisplayValue =
    formData.dsSmtpPassword || (configuracao?.smtpPasswordConfigurada && !editingSecrets.smtp ? SECRET_MASK : '');

  const isFormComplete = areRequiredConfiguracaoFieldsFilled(formData);
  const canSubmit = canSalvar && isFormComplete && !isBusy;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden gap-4">
        <DialogHeader className="flex-shrink-0 pr-6">
          <DialogTitle>
            Configuração da concessionária{concessionaria ? ` - ${concessionaria.nmConcessionaria}` : ''}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col gap-4" noValidate>
          <div className="flex-shrink-0 space-y-4">
            {concessionaria?.flAtivo === 'N' && (
              <RegistroDesativacao concessionaria={concessionaria} variant="danger" />
            )}

            <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <InfoIcon className="mt-0.5 h-4 w-4 flex-shrink-0" weight="fill" />
              <div className="space-y-1">
                <p>
                  <span className="font-medium">Observação:</span> complete as configurações
                  (período, Outlook/Azure e SMTP). Elas têm a mesma importância do cadastro para a
                  concessionária funcionar bem.
                </p>
                <p>
                  Lembre-se: cada concessionária opera de forma isolada, com suas próprias áreas,
                  temas, responsáveis, obrigações, solicitações, caixa de entrada, observações e
                  lembretes.
                </p>
              </div>
            </div>

            <ConfiguracaoProgress
              configuracao={{
                ...formData,
                dsInboxSecret: formData.dsInboxSecret || (configuracao?.inboxSecretConfigurado ? 'configured' : ''),
                dsSmtpPassword: formData.dsSmtpPassword || (configuracao?.smtpPasswordConfigurada ? 'configured' : ''),
              }}
              loading={isLoading}
              className="w-full"
            />
          </div>

          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
            <fieldset disabled={isBusy || !canSalvar} className="space-y-6">
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Período da concessão</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <InfoLabel
                    htmlFor="dtBaseInicioConcessao"
                    info="Início contratual da concessão. O sistema usa essa data como referência para períodos, relatórios e controles regulatórios da concessionária."
                    required
                  >
                    Início da concessão
                  </InfoLabel>
                  <Input
                    id="dtBaseInicioConcessao"
                    type="date"
                    value={toDateInputValue(formData.dtBaseInicioConcessao)}
                    onChange={(event) => handleChange('dtBaseInicioConcessao', event.target.value)}
                    className={cn(errors.dtBaseInicioConcessao && 'border-red-500 focus-visible:ring-red-500')}
                    aria-invalid={!!errors.dtBaseInicioConcessao}
                    required
                  />
                  <FieldError message={errors.dtBaseInicioConcessao} />
                </div>

                <div>
                  <InfoLabel
                    htmlFor="dtLimiteConcessao"
                    info="Fim contratual da concessão. O sistema usa essa data para indicar vigência, limites de consulta e acompanhamento regulatório."
                    required
                  >
                    Fim da concessão
                  </InfoLabel>
                  <Input
                    id="dtLimiteConcessao"
                    type="date"
                    value={toDateInputValue(formData.dtLimiteConcessao)}
                    onChange={(event) => handleChange('dtLimiteConcessao', event.target.value)}
                    className={cn(errors.dtLimiteConcessao && 'border-red-500 focus-visible:ring-red-500')}
                    aria-invalid={!!errors.dtLimiteConcessao}
                    required
                  />
                  <FieldError message={errors.dtLimiteConcessao} />
                </div>

                <div>
                  <InfoLabel
                    htmlFor="nrCodigoIdentificacao"
                    info="Código numérico de identificação da concessionária (até 4 dígitos). É usado na composição dos códigos de solicitações, obrigações (identificador institucional). Ex.: 0112. Se ficar em branco, o sistema tenta obter o número a partir do nome da concessionária, se não usa default 0001."
                  >
                    Código de identificação
                  </InfoLabel>
                  <Input
                    id="nrCodigoIdentificacao"
                    value={formData.nrCodigoIdentificacao || ''}
                    onChange={(event) => handleChange('nrCodigoIdentificacao', event.target.value)}
                    placeholder="Ex: 0112"
                    inputMode="numeric"
                    maxLength={4}
                    className={cn(errors.nrCodigoIdentificacao && 'border-red-500 focus-visible:ring-red-500')}
                    aria-invalid={!!errors.nrCodigoIdentificacao}
                  />
                  <FieldError message={errors.nrCodigoIdentificacao} />
                </div>
              </div>
            </section>

            <section className="space-y-3 border-t border-gray-100 pt-5">
              <h3 className="text-sm font-semibold text-gray-700">Leitura de e-mails - Outlook/Azure</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <InfoLabel
                    htmlFor="dsInboxEmail"
                    info="Caixa Outlook/Exchange Online que será monitorada. O sistema lê esta caixa para importar correspondências recebidas; use uma conta ou caixa compartilhada da concessionária."
                  >
                    E-mail Outlook
                  </InfoLabel>
                  <Input
                    id="dsInboxEmail"
                    type="email"
                    value={formData.dsInboxEmail || ''}
                    onChange={(event) => handleChange('dsInboxEmail', event.target.value)}
                    onBlur={(event) => setFieldValidation(
                      'dsInboxEmail',
                      getEmailError(event.target.value, 'E-mail Outlook'),
                    )}
                    placeholder="inbox@empresa.com.br"
                    inputMode="email"
                    autoComplete="email"
                    className={cn(errors.dsInboxEmail && 'border-red-500 focus-visible:ring-red-500')}
                    aria-invalid={!!errors.dsInboxEmail}
                  />
                  <FieldError message={errors.dsInboxEmail} />
                </div>

                <div>
                  <InfoLabel
                    htmlFor="dtInboxInicio"
                    info="Data a partir da qual o sistema começa a ler o Outlook. Na primeira sincronização, e-mails anteriores a essa data não serão importados."
                  >
                    Início da leitura
                  </InfoLabel>
                  <Input
                    id="dtInboxInicio"
                    type="date"
                    value={toDateInputValue(formData.dtInboxInicio)}
                    onChange={(event) => handleChange('dtInboxInicio', event.target.value)}
                    className={cn(errors.dtInboxInicio && 'border-red-500 focus-visible:ring-red-500')}
                    aria-invalid={!!errors.dtInboxInicio}
                  />
                  <FieldError message={errors.dtInboxInicio} />
                </div>

                <div>
                  <InfoLabel
                    htmlFor="dsInboxClientId"
                    info="Application (client) ID do aplicativo registrado no Microsoft Entra ID (Azure AD). Identifica qual aplicação do Azure autoriza o sistema a acessar o Outlook."
                  >
                    Client ID Azure
                  </InfoLabel>
                  <Input
                    id="dsInboxClientId"
                    value={formData.dsInboxClientId || ''}
                    onChange={(event) => handleChange('dsInboxClientId', event.target.value)}
                    placeholder="Application (client) ID"
                    className={cn(errors.dsInboxClientId && 'border-red-500 focus-visible:ring-red-500')}
                    aria-invalid={!!errors.dsInboxClientId}
                  />
                  <FieldError message={errors.dsInboxClientId} />
                </div>

                <div>
                  <InfoLabel
                    htmlFor="dsInboxTenantKeyId"
                    info="Directory (tenant) ID do Microsoft Entra ID (Azure AD). Define a organização Azure onde a autenticação da caixa Outlook será feita."
                  >
                    Tenant ID Azure
                  </InfoLabel>
                  <Input
                    id="dsInboxTenantKeyId"
                    value={formData.dsInboxTenantKeyId || ''}
                    onChange={(event) => handleChange('dsInboxTenantKeyId', event.target.value)}
                    placeholder="Directory (tenant) ID"
                    className={cn(errors.dsInboxTenantKeyId && 'border-red-500 focus-visible:ring-red-500')}
                    aria-invalid={!!errors.dsInboxTenantKeyId}
                  />
                  <FieldError message={errors.dsInboxTenantKeyId} />
                </div>

                <div>
                  <InfoLabel
                    htmlFor="dsInboxSecret"
                    info="Client secret do aplicativo no Microsoft Entra ID (Azure AD). Autoriza a integração a ler o Outlook conforme as permissões concedidas no Azure; se já estiver configurado, deixe em branco para manter o atual."
                  >
                    Client secret Azure
                  </InfoLabel>
                  <Input
                    id="dsInboxSecret"
                    type="password"
                    value={inboxSecretDisplayValue}
                    onFocus={() => handleSecretFocus('inbox')}
                    onBlur={() => handleSecretBlur('inbox')}
                    onChange={(event) => handleChange('dsInboxSecret', event.target.value.replace(SECRET_MASK, ''))}
                    placeholder="Client secret"
                    autoComplete="new-password"
                    className={cn(errors.dsInboxSecret && 'border-red-500 focus-visible:ring-red-500')}
                    aria-invalid={!!errors.dsInboxSecret}
                  />
                  <FieldError message={errors.dsInboxSecret} />
                </div>
              </div>
            </section>

            <section className="space-y-3 border-t border-gray-100 pt-5">
              <h3 className="text-sm font-semibold text-gray-700">Envio de e-mails - SMTP</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <InfoLabel
                    htmlFor="dsSmtpMailHost"
                    info="Servidor SMTP responsável pelo envio de e-mails do sistema. Para Microsoft 365, normalmente use smtp.office365.com."
                  >
                    Host SMTP
                  </InfoLabel>
                  <Input
                    id="dsSmtpMailHost"
                    value={formData.dsSmtpMailHost || ''}
                    onChange={(event) => handleChange('dsSmtpMailHost', event.target.value)}
                    placeholder="smtp.office365.com"
                    className={cn(errors.dsSmtpMailHost && 'border-red-500 focus-visible:ring-red-500')}
                    aria-invalid={!!errors.dsSmtpMailHost}
                  />
                  <FieldError message={errors.dsSmtpMailHost} />
                </div>
                <div>
                  <InfoLabel
                    htmlFor="dsSmtpPort"
                    info="Porta usada pelo servidor SMTP para envio autenticado. Em Microsoft 365, o padrão mais comum é 587 com TLS."
                  >
                    Porta SMTP
                  </InfoLabel>
                  <Input
                    id="dsSmtpPort"
                    type="number"
                    value={formData.dsSmtpPort ?? ''}
                    onChange={(event) => handleChange('dsSmtpPort', event.target.value ? Number(event.target.value) : null)}
                    placeholder="587"
                    className={cn(errors.dsSmtpPort && 'border-red-500 focus-visible:ring-red-500')}
                    aria-invalid={!!errors.dsSmtpPort}
                  />
                  <FieldError message={errors.dsSmtpPort} />
                </div>
                <div>
                  <InfoLabel
                    htmlFor="dsSmtpUsername"
                    info="Conta responsável pela autenticação SMTP. Normalmente é o mesmo e-mail autorizado a enviar mensagens pelo sistema."
                  >
                    Usuário SMTP
                  </InfoLabel>
                  <Input
                    id="dsSmtpUsername"
                    type="email"
                    value={formData.dsSmtpUsername || ''}
                    onChange={(event) => handleChange('dsSmtpUsername', event.target.value)}
                    onBlur={(event) => setFieldValidation(
                      'dsSmtpUsername',
                      getEmailError(event.target.value, 'Usuário SMTP'),
                    )}
                    placeholder="usuario@empresa.com.br"
                    inputMode="email"
                    autoComplete="email"
                    className={cn(errors.dsSmtpUsername && 'border-red-500 focus-visible:ring-red-500')}
                    aria-invalid={!!errors.dsSmtpUsername}
                  />
                  <FieldError message={errors.dsSmtpUsername} />
                </div>
                <div>
                  <InfoLabel
                    htmlFor="dsSmtpPassword"
                    info="Senha permitida pela política da conta SMTP. Se já estiver configurada, deixe em branco para manter a atual. Obs: Nao senha do seu e-mail, mas sim sua senha liberada pelo seu provedor de email para uso com o SMTP."
                  >
                    Senha SMTP
                  </InfoLabel>
                  <Input
                    id="dsSmtpPassword"
                    type="password"
                    value={smtpPasswordDisplayValue}
                    onFocus={() => handleSecretFocus('smtp')}
                    onBlur={() => handleSecretBlur('smtp')}
                    onChange={(event) => handleChange('dsSmtpPassword', event.target.value.replace(SECRET_MASK, ''))}
                    placeholder="Senha"
                    autoComplete="new-password"
                    className={cn(errors.dsSmtpPassword && 'border-red-500 focus-visible:ring-red-500')}
                    aria-invalid={!!errors.dsSmtpPassword}
                  />
                  <FieldError message={errors.dsSmtpPassword} />
                </div>
              </div>
            </section>
            </fieldset>
          </div>

          <DialogFooter className="flex-shrink-0 gap-2 border-t border-gray-100 pt-4">
            {canDeletar && onDelete && configuracao && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                disabled={isBusy}
                className="mr-auto"
              >
                Excluir configuração
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose} disabled={isBusy}>
              Cancelar
            </Button>
            {canSalvar && (
              <Button type="submit" className="bg-primary hover:bg-blue-700" disabled={!canSubmit}>
                {isBusy ? 'Salvando...' : 'Salvar configuração'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
