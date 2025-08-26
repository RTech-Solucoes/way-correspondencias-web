export const mockUsersEmail = [
    {
        id: 1,
        user: { name: "Maria Silva", avatar: "MS" },
        action: "enviou um novo email",
        time: "há 10 minutos",
        detail: "Relatório de Compliance Q2"
    },
    {
        id: 2,
        user: { name: "João Santos", avatar: "JS" },
        action: "concluiu uma obrigação",
        time: "há 45 minutos",
        detail: "4.2.1 - Contrato"
    },
    {
        id: 3,
        user: { name: "Ana Oliveira", avatar: "AO" },
        action: "adicionou um comentário",
        time: "há 2 horas",
        detail: "Ofício SEI n. 714/2025"
    },
    {
        id: 4,
        user: { name: "Carlos Mendes", avatar: "CM" },
        action: "criou uma nova obrigação",
        time: "há 3 horas",
        detail: "5.3 - Revisão Contratual"
    },
    {
        id: 5,
        user: { name: "Lucia Ferreira", avatar: "LF" },
        action: "atualizou um documento",
        time: "há 5 horas",
        detail: "Política de Compliance v2.1"
    },
]

export const deadlines = [
    { id: 1, title: "5.2 - Contrato", dueDate: "Hoje, 18:00", status: "pendente" },
    { id: 2, title: "Ofício SEI n. 714/2025", dueDate: "Amanhã, 14:00", status: "em_andamento" },
    { id: 3, title: "3.1.2 - Documentação", dueDate: "19/07, 10:00", status: "pendente" },
    { id: 4, title: "Relatório Trimestral", dueDate: "25/07, 18:00", status: "pendente" },
]

export const months = [
    'Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'
]

export const obligations = [
    { day: 17, title: "5.2 - Contrato", status: "pendente" },
    { day: 18, title: "Ofício SEI n. 714/2025", status: "em_andamento" },
    { day: 19, title: "3.1.2 - Documentação", status: "pendente" },
    { day: 25, title: "Relatório Trimestral", status: "pendente" },
    { day: 10, title: "4.2.1 - Contrato", status: "concluido" },
    { day: 15, title: "Reunião Mensal", status: "em_andamento" },
];

export const obligationsRecent = [
    { id: 1, title: "4.2.1 - Contrato", status: "concluido", date: "Hoje, 14:30", assignee: "Jurídico" },
    { id: 2, title: "5.2 - Contrato", status: "pendente", date: "Ontem, 10:15", assignee: "Operação" },
    { id: 3, title: "Ofício SEI n. 714/2025", status: "em_andamento", date: "17/07, 09:45", assignee: "Meio Ambiente" },
]