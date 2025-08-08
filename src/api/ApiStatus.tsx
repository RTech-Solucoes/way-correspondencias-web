'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowClockwiseIcon, WifiHighIcon, WifiSlashIcon, ClockIcon } from '@phosphor-icons/react';
import { useSincronizacaoStatus, useSincronizarEmails } from '@/api/hooks';

export default function ApiStatus() {
  const { data: status, loading, error, refetch } = useSincronizacaoStatus();
  const { sincronizar, loading: syncLoading, error: syncError } = useSincronizarEmails();
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    if (status?.timestamp) {
      setLastSync(new Date(status.timestamp).toLocaleString('pt-BR'));
    }
  }, [status]);

  const handleSyncEmails = async () => {
    try {
      await sincronizar();
      refetch();
    } catch (err) {
      console.error('Sync failed:', err);
    }
  };

  const getStatusColor = () => {
    if (error || syncError) return 'destructive';
    if (loading || syncLoading) return 'secondary';
    return 'default';
  };

  const getStatusIcon = () => {
    if (error || syncError) return <WifiSlashIcon className="h-4 w-4" />;
    if (loading || syncLoading) return <ArrowClockwiseIcon className="h-4 w-4 animate-spin" />;
    return <WifiHighIcon className="h-4 w-4" />;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          {getStatusIcon()}
          <span>Status da API</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Conexão:</span>
          <Badge variant={getStatusColor()}>
            {error ? 'Erro' : loading ? 'Carregando...' : 'Conectado'}
          </Badge>
        </div>

        {status && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Última sincronização:</span>
              <div className="flex items-center space-x-1 text-sm">
                <ClockIcon className="h-3 w-3" />
                <span>{lastSync || 'Nunca'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Emails processados:</span>
              <Badge variant="secondary">{status.count}</Badge>
            </div>
          </>
        )}

        <div className="pt-2">
          <Button
            onClick={handleSyncEmails}
            disabled={syncLoading}
            className="w-full"
            variant="outline"
          >
            {syncLoading ? (
              <>
                <ArrowClockwiseIcon className="h-4 w-4 mr-2 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <ArrowClockwiseIcon className="h-4 w-4 mr-2" />
                Sincronizar Emails
              </>
            )}
          </Button>
        </div>

        {(error || syncError) && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error || syncError}
          </div>
        )}
      </CardContent>
    </Card>
  );
}