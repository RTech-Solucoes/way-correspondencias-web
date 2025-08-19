'use client';

import {useState} from 'react';
import {
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
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
import { emailClient } from '@/api/email/client';
import { toast } from 'sonner';

export default function EmailPage() {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [emailFilters, setEmailFilters] = useState({
    remetente: '',
    destinatario: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  const [newEmail, setNewEmail] = useState({
    nmUsuario: '',
    dsRemetente: '',
    dsDestinatario: '',
    dsAssunto: '',
    txConteudo: '',
    flStatus: 'PENDENTE',
  });

  const handleCreateEmail = async () => {
    try {
      const emailData = {
        ...newEmail,
        dtEnvio: new Date().toISOString(),
      };
      await emailClient.criar(emailData);

      toast.success("Email criado com sucesso");

      setShowCreateModal(false);
      setNewEmail({
        nmUsuario: '',
        dsRemetente: '',
        dsDestinatario: '',
        dsAssunto: '',
        txConteudo: '',
        flStatus: 'PENDENTE',
      });
    } catch {
      toast.error("Erro ao criar email");
    }
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <PageTitle />
          <Button onClick={() => setShowCreateModal(true)}>
            <PlusIcon className="h-4 w-4 mr-2"/>
            Novo Email
          </Button>
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
                    <SelectItem value="">Todos</SelectItem>
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

      {showCreateModal && (
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Email</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="nmUsuario">Usuário</Label>
                <Input
                  id="nmUsuario"
                  value={newEmail.nmUsuario}
                  onChange={(e) => setNewEmail({...newEmail, nmUsuario: e.target.value})}
                  placeholder="Nome do usuário"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dsRemetente">Remetente</Label>
                  <Input
                    id="dsRemetente"
                    value={newEmail.dsRemetente}
                    onChange={(e) => setNewEmail({...newEmail, dsRemetente: e.target.value})}
                    placeholder="Email do remetente"
                  />
                </div>
                <div>
                  <Label htmlFor="dsDestinatario">Destinatário</Label>
                  <Input
                    id="dsDestinatario"
                    value={newEmail.dsDestinatario}
                    onChange={(e) => setNewEmail({...newEmail, dsDestinatario: e.target.value})}
                    placeholder="Email do destinatário"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="dsAssunto">Assunto</Label>
                <Input
                  id="dsAssunto"
                  value={newEmail.dsAssunto}
                  onChange={(e) => setNewEmail({...newEmail, dsAssunto: e.target.value})}
                  placeholder="Assunto do email"
                />
              </div>
              <div>
                <Label htmlFor="txConteudo">Conteúdo</Label>
                <textarea
                  id="txConteudo"
                  value={newEmail.txConteudo}
                  onChange={(e) => setNewEmail({...newEmail, txConteudo: e.target.value})}
                  placeholder="Conteúdo do email"
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md resize-none"
                />
              </div>
              <div>
                <Label htmlFor="flStatus">Status</Label>
                <Select
                  value={newEmail.flStatus}
                  onValueChange={(value) => setNewEmail({...newEmail, flStatus: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDENTE">Pendente</SelectItem>
                    <SelectItem value="ENVIADO">Enviado</SelectItem>
                    <SelectItem value="RESPONDIDO">Respondido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateEmail}>
                Criar Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}