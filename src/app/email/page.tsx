'use client';

import {useState} from 'react';
import {
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import EmailList from '../../components/email/EmailList';
import EmailDetail from '../../components/email/EmailDetail';
import PageTitle from '@/components/ui/page-title';

export default function EmailPage() {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [emailFilters, setEmailFilters] = useState({
    remetente: '',
    destinatario: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <PageTitle />
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
            <Input
              placeholder="Pesquisar emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          <Button
            variant="secondary"
            className="h-10 px-4"
            onClick={() => setShowFilterModal(true)}
          >
            <FunnelSimpleIcon className="h-4 w-4 mr-2"/>
            Filtrar
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {!selectedEmail ? (
          <EmailList
            searchQuery={searchQuery}
            selectedEmail={selectedEmail || null}
            onEmailSelect={setSelectedEmail}
            emailFilters={{
              isRead: '',
              hasAttachment: '',
              dateFrom: emailFilters.dateFrom,
              dateTo: emailFilters.dateTo,
              sender: emailFilters.remetente
            }}
          />
        ) : (
          <EmailDetail
            emailId={selectedEmail}
            onBack={() => setSelectedEmail(null)}
          />
        )}
      </div>

      {showFilterModal && (
        <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filtrar Emails</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="remetente">Remetente</Label>
                <Input
                  id="remetente"
                  value={emailFilters.remetente}
                  onChange={(e) => setEmailFilters({...emailFilters, remetente: e.target.value})}
                  placeholder="Filtrar por remetente"
                />
              </div>
              <div>
                <Label htmlFor="destinatario">Destinatário</Label>
                <Input
                  id="destinatario"
                  value={emailFilters.destinatario}
                  onChange={(e) => setEmailFilters({...emailFilters, destinatario: e.target.value})}
                  placeholder="Filtrar por destinatário"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={emailFilters.status}
                  onValueChange={(value) => setEmailFilters({...emailFilters, status: value})}
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
                    value={emailFilters.dateFrom}
                    onChange={(e) => setEmailFilters({...emailFilters, dateFrom: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo">Data Fim</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={emailFilters.dateTo}
                    onChange={(e) => setEmailFilters({...emailFilters, dateTo: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setEmailFilters({
                    remetente: '',
                    destinatario: '',
                    status: '',
                    dateFrom: '',
                    dateTo: '',
                  });
                  setShowFilterModal(false);
                }}
              >
                Limpar Filtros
              </Button>
              <Button onClick={() => setShowFilterModal(false)}>
                Aplicar Filtros
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}