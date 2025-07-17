'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {
  useCreateResponsavel,
  useEmails,
  useResponsaveis,
  useSetores,
  useSincronizacaoStatus,
  useSincronizarEmails
} from '@/lib/api/hooks';
import {CreateResponsavelRequest, TipoPerfil} from '@/lib/api/types';
import {Building, Loader2, Mail, RefreshCw, RotateCw, User} from 'lucide-react';

export default function ApiTestComponent() {
  const [activeTab, setActiveTab] = useState<'responsaveis' | 'setores' | 'emails' | 'sync'>('responsaveis');
  
  // API hooks
  const { data: responsaveis, loading: loadingResp, error: errorResp, refetch: refetchResp } = useResponsaveis({page: 1, size: 20});
  const { data: setores, loading: loadingSetores, error: errorSetores } = useSetores();
  const { data: emails, loading: loadingEmails, error: errorEmails } = useEmails();
  const { data: syncStatus, loading: loadingSyncStatus } = useSincronizacaoStatus();
  const { create: createResponsavel, loading: creatingResp, error: createError } = useCreateResponsavel();
  const { sincronizar, loading: syncing, error: syncError } = useSincronizarEmails();

  // Form state
  const [formData, setFormData] = useState<CreateResponsavelRequest>({
    nm_responsavel: '',
    email: '',
    senha: '',
    tp_perfil: 'EDITOR'
  });

  const handleCreateResponsavel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createResponsavel(formData);
      setFormData({ nm_responsavel: '', email: '', senha: '', tp_perfil: 'EDITOR' });
      refetchResp(); // Refresh the list
    } catch (error) {
      console.error('Failed to create responsavel:', error);
    }
  };

  const handleSync = async () => {
    try {
      await sincronizar();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const renderResponsaveis = () => (
    <div className="space-y-6">
      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Responsável</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateResponsavel} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nm_responsavel}
                  onChange={(e) => setFormData(prev => ({ ...prev, nm_responsavel: e.target.value }))}
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                  placeholder="Senha"
                  required
                />
              </div>
              <div>
                <Label htmlFor="perfil">Perfil</Label>
                <Select value={formData.tp_perfil} onValueChange={(value: TipoPerfil) => setFormData(prev => ({ ...prev, tp_perfil: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="analyst">Analista</SelectItem>
                    <SelectItem value="auditor">Auditor</SelectItem>
                    <SelectItem value="consultant">Consultor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {createError && (
              <div className="text-red-600 text-sm">{createError}</div>
            )}
            <Button type="submit" disabled={creatingResp}>
              {creatingResp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Responsável
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Lista de Responsáveis
            <Button variant="outline" size="sm" onClick={refetchResp} disabled={loadingResp}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingResp ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingResp ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Carregando...</span>
            </div>
          ) : errorResp ? (
            <div className="text-red-600 py-4">Erro: {errorResp}</div>
          ) : (
            <div className="space-y-2">
              {responsaveis?.items?.map((resp) => (
                <div key={resp.id_responsavel} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{resp.nm_responsavel}</div>
                    <div className="text-sm text-gray-600">{resp.email}</div>
                  </div>
                  <Badge variant="secondary">{resp.tp_perfil}</Badge>
                </div>
              )) || <div className="text-gray-500">Nenhum responsável encontrado</div>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSetores = () => (
    <Card>
      <CardHeader>
        <CardTitle>Setores</CardTitle>
      </CardHeader>
      <CardContent>
        {loadingSetores ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando...</span>
          </div>
        ) : errorSetores ? (
          <div className="text-red-600 py-4">Erro: {errorSetores}</div>
        ) : (
          <div className="space-y-2">
            {setores?.items?.map((setor) => (
              <div key={setor.id_setor} className="flex items-center justify-between p-3 border rounded">
                <div className="font-medium">{setor.nm_setor}</div>
                <Badge variant="outline">ID: {setor.id_responsavel}</Badge>
              </div>
            )) || <div className="text-gray-500">Nenhum setor encontrado</div>}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderEmails = () => (
    <Card>
      <CardHeader>
        <CardTitle>Emails</CardTitle>
      </CardHeader>
      <CardContent>
        {loadingEmails ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando...</span>
          </div>
        ) : errorEmails ? (
          <div className="text-red-600 py-4">Erro: {errorEmails}</div>
        ) : (
          <div className="space-y-2">
            {emails?.items?.map((email) => (
              <div key={email.id_email} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{email.assunto}</div>
                  <div className="text-sm text-gray-600">ID: {email.id_email}</div>
                </div>
                <Badge variant="secondary">{email.tp_status}</Badge>
              </div>
            )) || <div className="text-gray-500">Nenhum email encontrado</div>}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderSync = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sincronização de Emails</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Status da Sincronização</div>
              <div className="text-sm text-gray-600">
                {loadingSyncStatus ? 'Carregando...' : 
                 syncStatus?.timestamp ? `Última: ${new Date(syncStatus.timestamp).toLocaleString('pt-BR')}` : 
                 'Nunca sincronizado'}
              </div>
            </div>
            <Badge variant="outline">
              {syncStatus?.count || 0} processados
            </Badge>
          </div>
          
          <Button onClick={handleSync} disabled={syncing} className="w-full">
            {syncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RotateCw className="mr-2 h-4 w-4" />
                Sincronizar Emails
              </>
            )}
          </Button>
          
          {syncError && (
            <div className="text-red-600 text-sm">{syncError}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">API Test Dashboard</h1>
        <p className="text-gray-600">Teste da integração com Flask API em {process.env.NEXT_PUBLIC_API_URL || 'URL não definida'}</p>
      </div>

      {/* Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === 'responsaveis' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('responsaveis')}
          className="flex-1"
        >
          <User className="h-4 w-4 mr-2" />
          Responsáveis
        </Button>
        <Button
          variant={activeTab === 'setores' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('setores')}
          className="flex-1"
        >
          <Building className="h-4 w-4 mr-2" />
          Setores
        </Button>
        <Button
          variant={activeTab === 'emails' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('emails')}
          className="flex-1"
        >
          <Mail className="h-4 w-4 mr-2" />
          Emails
        </Button>
        <Button
          variant={activeTab === 'sync' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('sync')}
          className="flex-1"
        >
          <RotateCw className="h-4 w-4 mr-2" />
          Sincronização
        </Button>
      </div>

      {/* Content */}
      {activeTab === 'responsaveis' && renderResponsaveis()}
      {activeTab === 'setores' && renderSetores()}
      {activeTab === 'emails' && renderEmails()}
      {activeTab === 'sync' && renderSync()}
    </div>
  );
}