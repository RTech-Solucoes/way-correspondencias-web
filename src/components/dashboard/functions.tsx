import {
    CheckCircleIcon,
    XCircleIcon,
    ArchiveIcon,
    PencilIcon,
    FileSignatureIcon,
    FileTextIcon,
    UserPen,
    Stamp,
    FileSearch,
    ClockIcon,
    AlertCircleIcon,
    PlayCircleIcon,
    FileCheckIcon,
    BanIcon,
} from "lucide-react";
import { JSX } from "react";
import { weeks } from "./MockDados";
import { statusList } from "@/api/status-solicitacao/types";

const statusConfig: Record<
    string,
    {
        icon: JSX.Element;
        visionColor: string;
        calendarColor: string;
        bgColor: string;
        textColor: string;
    }
> = {
    [statusList.PRE_ANALISE.label]: {
        icon: <FileTextIcon className="h-4 w-4 text-orange-600 mr-2" />,
        visionColor: "bg-orange-400",
        calendarColor: "bg-[#b68500] text-white",
        bgColor: "#b68500",
        textColor: "#b68500",
    },
    [statusList.EM_ANALISE_GERENTE_REGULATORIO.label]: {
        icon: <FileSearch className="h-4 w-4 text-amber-600 mr-2" />,
        visionColor: "bg-[#87CEEB]",
        calendarColor: "bg-[#87CEEB] text-white",
        bgColor: "#87CEEB",
        textColor: "#87CEEB",
    },
    [statusList.VENCIDO_REGULATORIO.label]: {
        icon: <XCircleIcon className="h-4 w-4 text-rose-700 mr-2" />,
        visionColor: "bg-rose-500",
        calendarColor: "bg-[#a80000] text-white",
        bgColor: "#a80000",
        textColor: "#a80000",
    },
    [statusList.EM_ANALISE_AREA_TECNICA.label]: {
        icon: <PencilIcon className="h-4 w-4 text-amber-700 mr-2" />,
        visionColor: "bg-amber-500",
        calendarColor: "bg-[#4A90E2] text-white",
        bgColor: "#4A90E2",
        textColor: "#4A90E2",
    },
    [statusList.VENCIDO_AREA_TECNICA.label]: {
        icon: <XCircleIcon className="h-4 w-4 text-rose-600 mr-2" />,
        visionColor: "bg-text-rose-600",
        calendarColor: "bg-[#a80000] text-white",
        bgColor: "#a80000",
        textColor: "#a80000",
    },
    [statusList.ANALISE_REGULATORIA.label]: {
        icon: <FileSearch className="h-4 w-4 text-amber-600 mr-2" />,
        visionColor: "bg-amber-400",
        calendarColor: "bg-[#196eff] text-white",
        bgColor: "#196eff",
        textColor: "#196eff",
    },
    [statusList.EM_APROVACAO.label]: {
        icon: <FileSignatureIcon className="h-4 w-4 text-blue-600 mr-2" />,
        visionColor: "bg-blue-400",
        calendarColor: "bg-[#005efe] text-white",
        bgColor: "#005efe",
        textColor: "#005efe",
    },
    [statusList.EM_CHANCELA.label]: {
        icon: <UserPen className="h-4 w-4 text-cyan-700 mr-2" />,
        visionColor: "bg-cyan-500",
        calendarColor: "bg-[#0055e6] text-white",
        bgColor: "#0055e6",
        textColor: "#0055e6",
    },
    [statusList.EM_ASSINATURA_DIRETORIA.label]: {
        icon: <Stamp className="h-4 w-4 text-cyan-600 mr-2" />,
        visionColor: "bg-cyan-400",
        calendarColor: "bg-[#004bcb] text-white",
        bgColor: "#004bcb",
        textColor: "#004bcb",
    },
    [statusList.CONCLUIDO.label]: {
        icon: <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />,
        visionColor: "bg-green-400",
        calendarColor: "bg-[#22c55e] text-white",
        bgColor: "#22c55e",
        textColor: "#16a34a",
    },
    // CONCLUIDO também para obrigações (mesma cor)
    [statusList.CONCLUIDO.label]: {
        icon: <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />,
        visionColor: "bg-green-400",
        calendarColor: "bg-[#22c55e] text-white",
        bgColor: "#22c55e",
        textColor: "#16a34a",
    },
    [statusList.ARQUIVADO.label]: {
        icon: <ArchiveIcon className="h-4 w-4 text-gray-600 mr-2" />,
        visionColor: "bg-gray-400",
        calendarColor: "bg-[#6b7280] text-white",
        bgColor: "#6b7280",
        textColor: "#4b5563",
    },
    // Status específicos de obrigações (cores diferentes)
    [statusList.NAO_INICIADO.label]: {
        icon: <ClockIcon className="h-4 w-4 text-yellow-600 mr-2" />,
        visionColor: "bg-yellow-500",
        calendarColor: "bg-[#eab308] text-white",
        bgColor: "#eab308",
        textColor: "#ca8a04",
    },
    [statusList.PENDENTE.label]: {
        icon: <AlertCircleIcon className="h-4 w-4 text-orange-500 mr-2" />,
        visionColor: "bg-orange-500",
        calendarColor: "bg-[#f97316] text-white",
        bgColor: "#f97316",
        textColor: "#ea580c",
    },
    [statusList.EM_ANDAMENTO.label]: {
        icon: <PlayCircleIcon className="h-4 w-4 text-indigo-500 mr-2" />,
        visionColor: "bg-indigo-500",
        calendarColor: "bg-[#6366f1] text-white",
        bgColor: "#6366f1",
        textColor: "#4f46e5",
    },
    [statusList.EM_VALIDACAO_REGULATORIO.label]: {
        icon: <FileCheckIcon className="h-4 w-4 text-teal-500 mr-2" />,
        visionColor: "bg-teal-500",
        calendarColor: "bg-[#14b8a6] text-white",
        bgColor: "#14b8a6",
        textColor: "#0d9488",
    },
    [statusList.ATRASADA.label]: {
        icon: <XCircleIcon className="h-4 w-4 text-rose-600 mr-2" />,
        visionColor: "bg-rose-600",
        calendarColor: "bg-[#e11d48] text-white",
        bgColor: "#e11d48",
        textColor: "#be123c",
    },
    [statusList.NAO_APLICAVEL_SUSPENSA.label]: {
        icon: <BanIcon className="h-4 w-4 text-slate-500 mr-2" />,
        visionColor: "bg-slate-500",
        calendarColor: "bg-[#64748b] text-white",
        bgColor: "#64748b",
        textColor: "#475569",
    },
};

export function renderIcon(status: string) {
    // Tenta encontrar exato primeiro
    if (statusConfig[status]) {
        return statusConfig[status].icon;
    }
    
    // Se não encontrar, tenta normalizar e buscar por similaridade
    const normalizedStatus = status.toUpperCase().trim();
    
    // Buscar por chaves que contenham o status normalizado
    for (const [key, config] of Object.entries(statusConfig)) {
        const normalizedKey = key.toUpperCase().trim();
        if (normalizedKey === normalizedStatus || 
            normalizedStatus.includes(normalizedKey) || 
            normalizedKey.includes(normalizedStatus)) {
            return config.icon;
        }
    }
    
    return null;
}

export function getStatusColorVision(status: string) {
    // Tenta encontrar exato primeiro
    if (statusConfig[status]) {
        return statusConfig[status].visionColor;
    }
    
    // Se não encontrar, tenta normalizar e buscar por similaridade
    const normalizedStatus = status.toUpperCase().trim();
    
    // Buscar por chaves que contenham o status normalizado
    for (const [key, config] of Object.entries(statusConfig)) {
        const normalizedKey = key.toUpperCase().trim();
        if (normalizedKey === normalizedStatus || 
            normalizedStatus.includes(normalizedKey) || 
            normalizedKey.includes(normalizedStatus)) {
            return config.visionColor;
        }
    }
    
    return "bg-gray-400";
}

export function getStatusColorCalendar(status: string) {
    return statusConfig[status]?.calendarColor ?? "bg-gray-300";
}

export function getStatusBgColor(status: string) {
    // Tenta encontrar exato primeiro
    if (statusConfig[status]) {
        return statusConfig[status].bgColor;
    }
    
    // Se não encontrar, tenta normalizar e buscar por similaridade
    const normalizedStatus = status.toUpperCase().trim();
    
    // Buscar por chaves que contenham o status normalizado
    for (const [key, config] of Object.entries(statusConfig)) {
        const normalizedKey = key.toUpperCase().trim();
        if (normalizedKey === normalizedStatus || 
            normalizedStatus.includes(normalizedKey) || 
            normalizedKey.includes(normalizedStatus)) {
            return config.bgColor;
        }
    }
    
    return "#6b7280";
}

export function getAllStatusLegend() {
    const statusPermitidos = [
        statusList.EM_ANALISE_GERENTE_REGULATORIO.label,
        statusList.EM_ANALISE_AREA_TECNICA.label,
        statusList.ANALISE_REGULATORIA.label,
        statusList.EM_APROVACAO.label,
        statusList.EM_CHANCELA.label,
        statusList.EM_ASSINATURA_DIRETORIA.label,
        statusList.CONCLUIDO.label,
    ];

    return Object.entries(statusConfig)
        .filter(([label]) => statusPermitidos.includes(label))
        .map(([label, config]) => ({
            label,
            bgColor: config.bgColor,
            textColor: config.textColor,
        }));
}

export const capitalizeWords = (text: string): string => {
    return text
        .replace(/[-_]+/g, " ")
        .split(" ")
        .filter(Boolean)
        .map(
            (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
};

export function getCurrentWeek() {
    const today = new Date();
    const currentDay = today.getDay();

    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - currentDay);
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(firstDayOfWeek);
        day.setDate(firstDayOfWeek.getDate() + i);
        weekDays.push({
            dayName: weeks[i],
            date: day.getDate(),
            month: day.getMonth() + 1,
            year: day.getFullYear(),
            fullDate: day,
            isToday: day.toDateString() === today.toDateString()
        });
    }
    return weekDays;
}

export function getStatusColorCalendarObrigacao(status: string) {
    return statusConfig[status]?.calendarColor ?? "bg-blue-100 text-blue-900";
}

export function getAllStatusLegendObrigacoes() {
    return [
        {
            label: statusList.NAO_INICIADO.label,
            bgColor: statusConfig[statusList.NAO_INICIADO.label]?.bgColor || "#eab308",
            textColor: statusConfig[statusList.NAO_INICIADO.label]?.textColor || "#ca8a04",
        },
        {
            label: statusList.PENDENTE.label,
            bgColor: statusConfig[statusList.PENDENTE.label]?.bgColor || "#f97316",
            textColor: statusConfig[statusList.PENDENTE.label]?.textColor || "#ea580c",
        },
        {
            label: statusList.EM_ANDAMENTO.label,
            bgColor: statusConfig[statusList.EM_ANDAMENTO.label]?.bgColor || "#6366f1",
            textColor: statusConfig[statusList.EM_ANDAMENTO.label]?.textColor || "#4f46e5",
        },
        {
            label: statusList.EM_VALIDACAO_REGULATORIO.label,
            bgColor: statusConfig[statusList.EM_VALIDACAO_REGULATORIO.label]?.bgColor || "#14b8a6",
            textColor: statusConfig[statusList.EM_VALIDACAO_REGULATORIO.label]?.textColor || "#0d9488",
        },
        {
            label: statusList.ATRASADA.label,
            bgColor: statusConfig[statusList.ATRASADA.label]?.bgColor || "#e11d48",
            textColor: statusConfig[statusList.ATRASADA.label]?.textColor || "#be123c",
        },
        {
            label: statusList.CONCLUIDO.label,
            bgColor: statusConfig[statusList.CONCLUIDO.label]?.bgColor || "#22c55e",
            textColor: statusConfig[statusList.CONCLUIDO.label]?.textColor || "#16a34a",
        },
        {
            label: statusList.NAO_APLICAVEL_SUSPENSA.label,
            bgColor: statusConfig[statusList.NAO_APLICAVEL_SUSPENSA.label]?.bgColor || "#64748b",
            textColor: statusConfig[statusList.NAO_APLICAVEL_SUSPENSA.label]?.textColor || "#475569",
        },
    ];
}