import {Dialog, DialogContent, DialogHeader, DialogTitle} from "../ui/dialog";
import {Label} from '@/components/ui/label';
import {Input} from "../ui/input";
import {Button} from "../ui/button";
import {Dispatch, SetStateAction} from "react";

interface IFilterModal {
	setShowFilterModal: Dispatch<SetStateAction<boolean>>;
	showFilterModal: boolean;
	filters: any;
	setFilters: Dispatch<SetStateAction<any>>;
	clearFilters: () => void;
	applyFilters: () => void;
}

export default function FilterModalArea(props: IFilterModal) {
	return (
		<Dialog open={props.showFilterModal} onOpenChange={props.setShowFilterModal}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Filtrar Áreas</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4">
					<div>
						<Label htmlFor="codigo">Código</Label>
						<Input
							id="codigo"
							value={props.filters.codigo}
							onChange={(e) => props.setFilters({ ...props.filters, codigo: e.target.value })}
							placeholder="Filtrar por código"
						/>
					</div>
					<div>
						<Label htmlFor="nome">Nome</Label>
						<Input
							id="nome"
							value={props.filters.nome}
							onChange={(e) => props.setFilters({ ...props.filters, nome: e.target.value })}
							placeholder="Filtrar por nome"
						/>
					</div>
					<div>
						<Label htmlFor="descricao">Descrição</Label>
						<Input
							id="descricao"
							value={props.filters.descricao}
							onChange={(e) => props.setFilters({ ...props.filters, descricao: e.target.value })}
							placeholder="Filtrar por descrição"
						/>
					</div>
				</div>
				<div className="flex justify-end space-x-2 pt-4">
					<Button variant="outline" onClick={props.clearFilters}>
						Limpar
					</Button>
					<Button onClick={props.applyFilters}>
						Aplicar Filtros
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}