import { CheckCircleIcon, ClockIcon, WarningCircleIcon, XCircleIcon } from "@phosphor-icons/react";

export function renderIcon(status: string) {
    switch (status) {
        case "Análise regulatória":
            return <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />;
        case "Em análise da área técnica":
            return <ClockIcon className="h-4 w-4 text-blue-500 mr-2" />;
        case "Pré-análise":
            return <WarningCircleIcon className="h-4 w-4 text-yellow-500 mr-2" />;
        case "Atrasadas":
            return <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />;
        default:
            return null;
    }
}

export function getStatusColor(status: string) {
    switch (status) {
        case "Análise regulatória":
            return "bg-green-500";
        case "Em análise da área técnica":
            return "bg-blue-500";
        case "Pré-análise":
            return "bg-yellow-500";
        case "Atrasadas":
            return "bg-red-500";
        default:
            return "bg-gray-300";
    }
}