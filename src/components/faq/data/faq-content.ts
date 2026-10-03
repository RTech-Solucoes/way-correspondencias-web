import { FaqCategory, FaqItem } from '@/components/faq/types';

export const FAQ_CATEGORIES: FaqCategory[] = [
  { id: 'geral', label: 'Geral' },
  { id: 'obrigacoes', label: 'Obrigações' },
  { id: 'correspondencias', label: 'Correspondências' },
  { id: 'perfis', label: 'Perfis e Permissões' },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'FAQ-001',
    categoryId: 'geral',
    question: 'Para que serve o Sistema de Gestão Regulatória?',
    answer:
      'O sistema centraliza e organiza a gestão de obrigações e correspondências regulatórias da concessionária por meio dos módulos de Obrigações e Correspondências.',
    keywords: ['sistema', 'gestão regulatória', 'módulos', 'concessionária', 'finalidade'],
  },
  {
    id: 'FAQ-002',
    categoryId: 'geral',
    question: 'Qual é a diferença entre Obrigações e Correspondências?',
    answer:
      'Obrigações gerencia o cumprimento de obrigações contratuais e regulatórias. Correspondências gerencia ofícios recebidos pela Agência Reguladora e o fluxo de elaboração e aprovação da minuta de resposta.',
    keywords: ['diferença', 'ofícios', 'minuta', 'agência reguladora', 'contratuais'],
  },
  {
    id: 'FAQ-003',
    categoryId: 'geral',
    question: 'Por que algumas ações não aparecem para mim?',
    answer:
      'As ações disponíveis dependem do seu perfil, da sua área e da etapa atual da obrigação ou correspondência.',
    keywords: ['ações', 'perfil', 'área', 'etapa', 'permissões', 'disponibilidade'],
  },
  {
    id: 'FAQ-004',
    categoryId: 'geral',
    question: 'Onde vejo o que precisa da minha atenção?',
    answer:
      'Consulte o Dashboard e as listagens dos módulos para acompanhar obrigações e correspondências, prazos, status e atividades relacionadas ao seu perfil.',
    keywords: ['dashboard', 'atenção', 'prazos', 'status', 'listagem', 'pendências'],
  },
  {
    id: 'FAQ-005',
    categoryId: 'geral',
    question: 'Consigo consultar o que já aconteceu de uma obrigação ou correspondência?',
    answer:
      'Sim. As movimentações realizadas durante o fluxo ficam registradas e podem ser consultadas no histórico da obrigação ou correspondência.',
    keywords: ['histórico', 'movimentações', 'consulta', 'rastreabilidade'],
  },
  {
    id: 'FAQ-006',
    categoryId: 'obrigacoes',
    question: 'Como uma obrigação é cadastrada?',
    answer:
      'Uma obrigação pode ser cadastrada manualmente ou por importação de planilha, conforme as permissões disponíveis.',
    keywords: ['cadastro', 'importação', 'planilha', 'manual', 'criar obrigação'],
  },
  {
    id: 'FAQ-007',
    categoryId: 'obrigacoes',
    question: 'Quem pode criar ou editar uma obrigação?',
    answer:
      'A criação e a edição dependem do perfil e da etapa do fluxo. O Gestor do Sistema e o Administrador possuem essas permissões conforme as regras documentadas no Manual.',
    keywords: ['criar', 'editar', 'gestor do sistema', 'administrador', 'perfil'],
  },
  {
    id: 'FAQ-008',
    categoryId: 'obrigacoes',
    question: 'O que acontece depois que uma obrigação é enviada para a Área Técnica?',
    answer:
      'A Área Técnica executa as atividades necessárias e registra as informações e evidências de cumprimento para análise do Regulatório.',
    keywords: ['área técnica', 'envio', 'evidências', 'regulatório', 'cumprimento'],
  },
  {
    id: 'FAQ-009',
    categoryId: 'obrigacoes',
    question: 'Como comprovo o cumprimento de uma obrigação?',
    answer:
      'Registre no sistema as informações e evidências relacionadas ao cumprimento. O material será analisado pelo Regulatório.',
    keywords: ['comprovação', 'evidência', 'anexo', 'cumprimento'],
  },
  {
    id: 'FAQ-010',
    categoryId: 'obrigacoes',
    question: 'O que acontece se minha evidência precisar de ajustes?',
    answer:
      'A obrigação pode retornar para complementação ou correção antes de continuar no fluxo.',
    keywords: ['ajustes', 'correção', 'complementação', 'devolução', 'evidência'],
  },
  {
    id: 'FAQ-011',
    categoryId: 'obrigacoes',
    question: 'Por que não consigo alterar o status?',
    answer: 'O Status depende exclusivamente da etapa do fluxo.',
    keywords: ['status', 'alterar', 'etapa', 'fluxo'],
  },
  {
    id: 'FAQ-012',
    categoryId: 'obrigacoes',
    question: 'O que significa “Não Aplicável / Suspensa”?',
    answer:
      'Significa que a obrigação foi interrompida no fluxo conforme justificativa registrada e regras de permissão existentes no Manual.',
    keywords: ['não aplicável', 'suspensa', 'justificativa', 'interrupção'],
  },
  {
    id: 'FAQ-013',
    categoryId: 'obrigacoes',
    question: 'O sistema avisa quando uma obrigação está próxima do vencimento?',
    answer:
      'Sim. O módulo possui alertas relacionados aos prazos das obrigações conforme as regras configuradas.',
    keywords: ['alerta', 'prazo', 'vencimento', 'notificação'],
  },
  {
    id: 'FAQ-014',
    categoryId: 'obrigacoes',
    question: 'O que é uma obrigação condicionada?',
    answer:
      'É uma obrigação vinculada a uma obrigação principal. Ela possui identificação própria e sua conclusão não conclui automaticamente a obrigação principal.',
    keywords: ['condicionada', 'vinculada', 'obrigação principal', 'conclusão'],
  },
  {
    id: 'FAQ-015',
    categoryId: 'obrigacoes',
    question: 'Posso consultar obrigações concluídas?',
    answer:
      'Sim. A conclusão não elimina os registros. As informações permanecem disponíveis para consulta.',
    keywords: ['concluídas', 'consulta', 'registros', 'histórico'],
  },
  {
    id: 'FAQ-016',
    categoryId: 'correspondencias',
    question: 'Como uma correspondência entra no sistema?',
    answer:
      'Uma solicitação pode ser criada a partir do e-mail sincronizados ou cadastrada manualmente de acordo com as permissões existentes.',
    keywords: ['entrada', 'e-mail', 'sincronização', 'cadastro manual', 'solicitação'],
  },
  {
    id: 'FAQ-017',
    categoryId: 'correspondencias',
    question: 'Posso criar uma solicitação manualmente?',
    answer: 'Sim. A criação manual está disponível para os perfis autorizados.',
    keywords: ['criação manual', 'solicitação', 'perfis autorizados'],
  },
  {
    id: 'FAQ-018',
    categoryId: 'correspondencias',
    question: 'O que acontece na Pré-Análise?',
    answer:
      'O Regulatório complementa e organiza as informações necessárias para que a solicitação seja corretamente encaminhada pelo fluxo.',
    keywords: ['pré-análise', 'pre analise', 'regulatório', 'encaminhamento'],
  },
  {
    id: 'FAQ-019',
    categoryId: 'correspondencias',
    question: 'Como a Área Técnica sabe que precisa responder?',
    answer:
      'Quando a solicitação é encaminhada para a área responsável, ficam disponíveis as ações correspondentes à etapa, incluindo o envio da resposta técnica.',
    keywords: ['área técnica', 'resposta técnica', 'encaminhamento', 'área responsável'],
  },
  {
    id: 'FAQ-020',
    categoryId: 'correspondencias',
    question: 'O que acontece quando existem várias áreas envolvidas?',
    answer:
      'O fluxo permite a participação de múltiplas áreas. As contribuições passam pelas etapas previstas de resposta e aprovação antes da consolidação pelo Regulatório.',
    keywords: ['múltiplas áreas', 'várias áreas', 'contribuições', 'consolidação'],
  },
  {
    id: 'FAQ-021',
    categoryId: 'correspondencias',
    question: 'O que acontece depois que a Área Técnica responde?',
    answer:
      'A contribuição segue pelas etapas de análise e aprovação. O Regulatório consolida a resposta antes das etapas posteriores de aprovação, chancela e assinatura.',
    keywords: ['resposta', 'aprovação', 'chancela', 'assinatura', 'consolidação'],
  },
  {
    id: 'FAQ-022',
    categoryId: 'correspondencias',
    question: 'Uma resposta pode ser reprovada?',
    answer:
      'O fluxo prevê reprovação e retorno para ajustes antes que a solicitação continue para as próximas etapas.',
    keywords: ['reprovação', 'ajustes', 'retorno', 'reprovar'],
  },
  {
    id: 'FAQ-023',
    categoryId: 'correspondencias',
    question: 'O que é a chancela do Gerente do Regulatório?',
    answer:
      'É uma etapa de validação do fluxo que ocorre antes da assinatura da Diretoria, após as etapas anteriores aplicáveis.',
    keywords: ['chancela', 'gerente', 'regulatório', 'validação', 'diretoria'],
  },
  {
    id: 'FAQ-024',
    categoryId: 'correspondencias',
    question: 'A Diretoria participa do fluxo?',
    answer:
      'Sim. A Diretoria atua nas etapas previstas de validação e assinatura da resposta na Solicitação e na Obrigação, caso o Regulatório decida por Enviar a Obrigação para tramitação.',
    keywords: ['diretoria', 'assinatura', 'validação', 'tramitação', 'solicitação', 'obrigação'],
  },
  {
    id: 'FAQ-025',
    categoryId: 'correspondencias',
    question: 'O sistema envia a resposta diretamente para a ANTT?',
    answer: 'Não. O encaminhamento final da resposta à ANTT ocorre externamente ao sistema.',
    keywords: ['antt', 'envio', 'encaminhamento', 'externo'],
  },
  {
    id: 'FAQ-026',
    categoryId: 'correspondencias',
    question: 'Posso responder um e-mail da ANTT pela Caixa de Entrada?',
    answer:
      'Não. A Caixa de Entrada permite consultar e-mails e anexos recebidos, mas não responder aos e-mails diretamente.',
    keywords: ['caixa de entrada', 'e-mail', 'responder', 'antt', 'anexos'],
  },
  {
    id: 'FAQ-027',
    categoryId: 'correspondencias',
    question: 'Consigo consultar uma solicitação depois de concluída ou arquivada?',
    answer:
      'Sim. Os registros da tramitação são preservados para manter a rastreabilidade do processo.',
    keywords: ['concluída', 'arquivada', 'consulta', 'tramitação', 'rastreabilidade'],
  },
  {
    id: 'FAQ-028',
    categoryId: 'perfis',
    question: 'Por que outro usuário consegue realizar uma ação que não aparece para mim?',
    answer:
      'As permissões variam conforme o perfil do usuário, sua vinculação e a etapa atual da obrigação ou correspondência.',
    keywords: ['permissões', 'perfil', 'vinculação', 'etapa', 'ações'],
  },
  {
    id: 'FAQ-029',
    categoryId: 'perfis',
    question: 'Quem deve agir na etapa atual?',
    answer:
      'O responsável depende do fluxo e do status atual. Consulte a obrigação ou correspondência para identificar a área ou perfil responsável pela próxima ação.',
    keywords: ['responsável', 'etapa', 'status', 'área', 'próxima ação'],
  },
  {
    id: 'FAQ-030',
    categoryId: 'perfis',
    question: 'Posso alterar uma obrigação ou correspondência depois de enviá-la para a próxima etapa?',
    answer:
      'A possibilidade de alteração depende do módulo, do seu perfil e da etapa em que a obrigação ou correspondência se encontra.',
    keywords: ['alterar', 'editar', 'próxima etapa', 'envio', 'perfil'],
  },
];
