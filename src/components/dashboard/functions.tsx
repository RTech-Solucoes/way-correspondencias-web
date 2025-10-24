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
    [statusList.ARQUIVADO.label]: {
        icon: <ArchiveIcon className="h-4 w-4 text-gray-600 mr-2" />,
        visionColor: "bg-gray-400",
        calendarColor: "bg-[#6b7280] text-white",
        bgColor: "#6b7280",
        textColor: "#4b5563",
    },
};

export function renderIcon(status: string) {
    return statusConfig[status]?.icon ?? null;
}

export function getStatusColorVision(status: string) {
    return statusConfig[status]?.visionColor ?? "bg-gray-400";
}

export function getStatusColorCalendar(status: string) {
    return statusConfig[status]?.calendarColor ?? "bg-gray-300";
}

export function getStatusBgColor(status: string) {
    return statusConfig[status]?.bgColor ?? "#6b7280";
}

export function getAllStatusLegend() {
    const statusOcultos = [
        statusList.PRE_ANALISE.label,
        statusList.VENCIDO_REGULATORIO.label,
        statusList.VENCIDO_AREA_TECNICA.label,
        statusList.ARQUIVADO.label,
    ];

    return Object.entries(statusConfig)
        .filter(([label]) => !statusOcultos.includes(label))
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
            fullDate: day,
            isToday: day.toDateString() === today.toDateString()
        });
    }
    return weekDays;
}