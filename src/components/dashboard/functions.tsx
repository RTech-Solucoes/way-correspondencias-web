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

const statusConfig: Record<
    string,
    {
        icon: JSX.Element;
        visionColor: string;
        calendarColor: string;
    }
> = {
    "Pré-análise": {
        icon: <FileTextIcon className="h-4 w-4 text-orange-600 mr-2" />,
        visionColor: "bg-orange-400",
        calendarColor: "bg-orange-100",
    },
    "Vencido regulatório": {
        icon: <XCircleIcon className="h-4 w-4 text-rose-700 mr-2" />,
        visionColor: "bg-rose-500",
        calendarColor: "bg-rose-200",
    },
    "Em análise da área técnica": {
        icon: <PencilIcon className="h-4 w-4 text-amber-700 mr-2" />,
        visionColor: "bg-amber-500",
        calendarColor: "bg-amber-200",
    },
    "Vencido área técnica": {
        icon: <XCircleIcon className="h-4 w-4 text-rose-600 mr-2" />,
        visionColor: "bg-text-rose-600",
        calendarColor: "bg-rose-100",
    },
    "Análise regulatória": {
        icon: <FileSearch className="h-4 w-4 text-amber-600 mr-2" />,
        visionColor: "bg-amber-400",
        calendarColor: "bg-amber-100",
    },
    "Em aprovação": {
        icon: <FileSignatureIcon className="h-4 w-4 text-blue-600 mr-2" />,
        visionColor: "bg-blue-400",
        calendarColor: "bg-blue-100",
    },
    "Em chancela": {
        icon: <UserPen className="h-4 w-4 text-cyan-700 mr-2" />,
        visionColor: "bg-cyan-500",
        calendarColor: "bg-cyan-200",
    },
    "Em assinatura Diretoria": {
        icon: <Stamp className="h-4 w-4 text-cyan-600 mr-2" />,
        visionColor: "bg-cyan-400",
        calendarColor: "bg-cyan-100",
    },
    Concluído: {
        icon: <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />,
        visionColor: "bg-green-400",
        calendarColor: "bg-green-100",
    },
    Arquivado: {
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