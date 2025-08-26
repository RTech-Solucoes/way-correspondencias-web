import {Label} from "@/components/ui/label";
import {Dispatch, SetStateAction} from "react";
import {Button} from "../ui/button";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "../ui/dialog";
import {Input} from "../ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../ui/select";

interface IEmailFilters {
    remetente: string;
    destinatario: string;
    status: string;
    dateFrom: string;
    dateTo: string;
}

interface IFilterProps {
    emailFilters: IEmailFilters;
    setEmailFilters: Dispatch<SetStateAction<IEmailFilters>>;
    showFilterModal: boolean;
    setShowFilterModal: Dispatch<SetStateAction<boolean>>;
    clearFilters: () => void;
    applyFilters: () => void;
}

export default function FilterDialog(props: IFilterProps) {

    return (
        <Dialog open={props.showFilterModal} onOpenChange={props.setShowFilterModal}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Filtrar Emails</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    <div>
                        <Label htmlFor="remetente">Remetente</Label>
                        <Input
                            id="remetente"
                            value={props.emailFilters.remetente}
                            onChange={(e) => props.setEmailFilters({ ...props.emailFilters, remetente: e.target.value })}
                            placeholder="Filtrar por remetente"
                        />
                    </div>
                    <div>
                        <Label htmlFor="destinatario">Destinatário</Label>
                        <Input
                            id="destinatario"
                            value={props.emailFilters.destinatario}
                            onChange={(e) => props.setEmailFilters({ ...props.emailFilters, destinatario: e.target.value })}
                            placeholder="Filtrar por destinatário"
                        />
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={props.emailFilters.status}
                            onValueChange={(value) => props.setEmailFilters({ ...props.emailFilters, status: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="PENDENTE">Pendente</SelectItem>
                                <SelectItem value="ENVIADO">Enviado</SelectItem>
                                <SelectItem value="RESPONDIDO">Respondido</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="dateFrom">Data Início</Label>
                            <Input
                                id="dateFrom"
                                type="date"
                                value={props.emailFilters.dateFrom}
                                onChange={(e) => props.setEmailFilters({ ...props.emailFilters, dateFrom: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="dateTo">Data Fim</Label>
                            <Input
                                id="dateTo"
                                type="date"
                                value={props.emailFilters.dateTo}
                                onChange={(e) => props.setEmailFilters({ ...props.emailFilters, dateTo: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={props.clearFilters}
                    >
                        Limpar Filtros
                    </Button>
                    <Button onClick={props.applyFilters}>
                        Aplicar Filtros
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}