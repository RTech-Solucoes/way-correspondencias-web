'use client';

import {useState} from 'react';
import {
  FunnelSimpleIcon,
  EnvelopeSimpleIcon,
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
    isRead: '',
    hasAttachment: '',
    dateFrom: '',
    dateTo: '',
    sender: ''
  });

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <PageTitle title="Email" icon={EnvelopeSimpleIcon} />
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
            emailFilters={emailFilters}
          />
        ) : (
          <EmailDetail
            emailId={selectedEmail}
            onBack={() => setSelectedEmail(null)}
          />
        )}
      </div>

      {/* Email Filter Modal */}
      {showFilterModal && (
        <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filtrar Emails</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="sender">Remetente</Label>
                <Input
                  id="sender"
                  value={emailFilters.sender}
                  onChange={(e) => setEmailFilters({...emailFilters, sender: e.target.value})}
                  placeholder="Filtrar por remetente"
                />
              </div>
              <div>
                <Label htmlFor="isRead">Status de Leitura</Label>
                <Select
                  value={emailFilters.isRead}
                  onValueChange={(value) => setEmailFilters({...emailFilters, isRead: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="read">Lidos</SelectItem>
                    <SelectItem value="unread">Não Lidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="hasAttachment">Anexos</Label>
                <Select
                  value={emailFilters.hasAttachment}
                  onValueChange={(value) => setEmailFilters({...emailFilters, hasAttachment: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione anexos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Com Anexo</SelectItem>
                    <SelectItem value="false">Sem Anexo</SelectItem>
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
                    isRead: '',
                    hasAttachment: '',
                    dateFrom: '',
                    dateTo: '',
                    sender: ''
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