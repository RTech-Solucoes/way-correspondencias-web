import { CheckCircleIcon, ClockIcon, WarningCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import { weeks } from "./MockDados";

export function renderIcon(status: string) {
    switch (status) {
        case "Concluído":
            return <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />;
        case "Em andamento":
            return <ClockIcon className="h-4 w-4 text-blue-500 mr-2" />;
        case "Pendentes":
            return <WarningCircleIcon className="h-4 w-4 text-yellow-500 mr-2" />;
        case "Cancelado":
            return <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />;
        default:
            return null;
    }
}

export function getStatusColor(status: string) {
    switch (status) {
        case "Concluído":
            return "bg-green-500";
        case "Em andamento":
            return "bg-blue-500";
        case "Pendentes":
            return "bg-yellow-500";
        case "Cancelado":
            return "bg-red-500";
        default:
            return "bg-gray-300";
    }
}

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