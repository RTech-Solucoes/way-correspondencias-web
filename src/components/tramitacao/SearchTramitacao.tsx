import { FunnelSimpleIcon, MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface ISearchTramitacao {
    setSearchQuery: Dispatch<SetStateAction<string>>;
    searchQuery: string;
    hasActiveFilters: boolean;
    clearFilters: () => void;
    setShowFilterModal: Dispatch<SetStateAction<boolean>>
}

export default function SearchTramitacao(props: ISearchTramitacao) {
    return (
        <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Pesquisar tramitações..."
                    value={props.searchQuery}
                    onChange={(e) => props.setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                />
            </div>
            {props.hasActiveFilters && (
                <Button
                    variant="outline"
                    className="h-10 px-4"
                    onClick={props.clearFilters}
                >
                    <XIcon className="h-4 w-4 mr-2" />
                    Limpar Filtros
                </Button>
            )}
            <Button
                variant="secondary"
                className="h-10 px-4"
                onClick={() => props.setShowFilterModal(true)}
            >
                <FunnelSimpleIcon className="h-4 w-4 mr-2" />
                Filtrar
            </Button>
        </div>
    )
}