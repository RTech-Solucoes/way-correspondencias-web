import {Label} from "@/components/ui/label";
import {Dispatch, SetStateAction} from "react";
import {Button} from "../ui/button";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "../ui/dialog";
import {Input} from "../ui/input";
import {EmailFiltersState} from "@/context/email/EmailContext";


interface IFilterProps {
  emailFilters: EmailFiltersState;
  setEmailFilters: Dispatch<SetStateAction<EmailFiltersState>>;
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
              onChange={(e) => props.setEmailFilters({...props.emailFilters, remetente: e.target.value})}
              placeholder="Filtrar por remetente"
            />
          </div>
          <div>
            <Label htmlFor="destinatario">Destinatário</Label>
            <Input
              id="destinatario"
              value={props.emailFilters.destinatario}
              onChange={(e) => props.setEmailFilters({...props.emailFilters, destinatario: e.target.value})}
              placeholder="Filtrar por destinatário"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateFrom">Data Criação Início</Label>
              <Input
                id="dateFrom"
                type="date"
                value={props.emailFilters.dateFrom}
                onChange={(e) => props.setEmailFilters({...props.emailFilters, dateFrom: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Data Criação Fim</Label>
              <Input
                id="dateTo"
                type="date"
                value={props.emailFilters.dateTo}
                onChange={(e) => props.setEmailFilters({...props.emailFilters, dateTo: e.target.value})}
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