import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Dispatch, SetStateAction } from "react";

interface FiltersState {
  solicitacao: string;
  responsavelOrigem: string;
  responsavelDestino: string;
  ativo: string;
}

interface IFilterModal {
	setShowFilterModal: Dispatch<SetStateAction<boolean>>;
	showFilterModal: boolean;
	filters: FiltersState;
	setFilters: Dispatch<SetStateAction<FiltersState>>;
	clearFilters: () => void;
	applyFilters: () => void;
}

export default function FilterModalTramitacao(props: IFilterModal) {
	return (
		<Dialog open={props.showFilterModal} onOpenChange={props.setShowFilterModal}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Filtrar Tramitações</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4">
					<div>
						<Label htmlFor="solicitacao">Solicitação</Label>
						<Input
							id="solicitacao"
							value={props.filters.solicitacao}
							onChange={(e) => props.setFilters({ ...props.filters, solicitacao: e.target.value })}
							placeholder="Filtrar por solicitação"
						/>
					</div>
					<div>
						<Label htmlFor="responsavelOrigem">Responsável Origem</Label>
						<Input
							id="responsavelOrigem"
							value={props.filters.responsavelOrigem}
							onChange={(e) => props.setFilters({ ...props.filters, responsavelOrigem: e.target.value })}
							placeholder="Filtrar por responsável de origem"
						/>
					</div>
					<div>
						<Label htmlFor="responsavelDestino">Responsável Destino</Label>
						<Input
							id="responsavelDestino"
							value={props.filters.responsavelDestino}
							onChange={(e) => props.setFilters({ ...props.filters, responsavelDestino: e.target.value })}
							placeholder="Filtrar por responsável de destino"
						/>
					</div>
					<div>
						<Label htmlFor="ativo">Status</Label>
						<Input
							id="ativo"
							value={props.filters.ativo}
							onChange={(e) => props.setFilters({ ...props.filters, ativo: e.target.value })}
							placeholder="Filtrar por status (S/N)"
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