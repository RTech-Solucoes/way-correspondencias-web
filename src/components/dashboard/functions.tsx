import {
    CheckCircleIcon,
    ClockIcon,
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
    }
> = {
    [statusList.PRE_ANALISE.label]: {
        icon: <FileTextIcon className="h-4 w-4 text-orange-600 mr-2" />,
        visionColor: "bg-orange-400",
        calendarColor: "bg-orange-100",
    },
    [statusList.VENCIDO_REGULATORIO.label]: {
        icon: <XCircleIcon className="h-4 w-4 text-rose-700 mr-2" />,
        visionColor: "bg-rose-500",
        calendarColor: "bg-rose-200",
    },
    [statusList.EM_ANALISE_AREA_TECNICA.label]: {
        icon: <PencilIcon className="h-4 w-4 text-amber-700 mr-2" />,
        visionColor: "bg-amber-500",
        calendarColor: "bg-amber-200",
    },
    [statusList.VENCIDO_AREA_TECNICA.label]: {
        icon: <XCircleIcon className="h-4 w-4 text-rose-600 mr-2" />,
        visionColor: "bg-text-rose-600",
        calendarColor: "bg-rose-100",
    },
    [statusList.ANALISE_REGULATORIA.label]: {
        icon: <FileSearch className="h-4 w-4 text-amber-600 mr-2" />,
        visionColor: "bg-amber-400",
        calendarColor: "bg-amber-100",
    },
    [statusList.EM_APROVACAO.label]: {
        icon: <FileSignatureIcon className="h-4 w-4 text-blue-600 mr-2" />,
        visionColor: "bg-blue-400",
        calendarColor: "bg-blue-100",
    },
    [statusList.EM_CHANCELA.label]: {
        icon: <UserPen className="h-4 w-4 text-cyan-700 mr-2" />,
        visionColor: "bg-cyan-500",
        calendarColor: "bg-cyan-200",
    },
    [statusList.EM_ASSINATURA_DIRETORIA.label]: {
        icon: <Stamp className="h-4 w-4 text-cyan-600 mr-2" />,
        visionColor: "bg-cyan-400",
        calendarColor: "bg-cyan-100",
    },
    [statusList.CONCLUIDO.label]: {
        icon: <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />,
        visionColor: "bg-green-400",
        calendarColor: "bg-green-100",
    },
    [statusList.ARQUIVADO.label]: {
        icon: <ArchiveIcon className="h-4 w-4 text-gray-600 mr-2" />,
        visionColor: "bg-gray-400",
        calendarColor: "bg-gray-100",
    },
};

// Funções reutilizando o dicionário
export function renderIcon(status: string) {
    return statusConfig[status]?.icon ?? null;
}

export function getStatusColorVision(status: string) {
    return statusConfig[status]?.visionColor ?? "bg-gray-400";
}

export function getStatusColorCalendar(status: string) {
    return statusConfig[status]?.calendarColor ?? "bg-gray-300";
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