'use client';

import type { LucideIcon } from 'lucide-react';
import { Download, ExternalLink, FileSpreadsheet, FileText, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AnexoResponse } from '@/api/anexos/type';
import { TipoResponsavelAnexoEnum } from '@/api/anexos/type';
import { formatDate } from '@/utils/utils';
interface FileAccent {
  Icon: LucideIcon;
  containerClass: string;
}

const responsavelLabels: Record<string, string> = {
  [TipoResponsavelAnexoEnum.A]: 'Analista',
  [TipoResponsavelAnexoEnum.G]: 'Gestor',
  [TipoResponsavelAnexoEnum.D]: 'Diretoria',
  [TipoResponsavelAnexoEnum.R]: 'Regulatório',
};

const getResponsavelLabel = (value?: string | null) => {
  if (!value) return 'Responsável não informado';
  const key = value.toString().toUpperCase();
  return responsavelLabels[key] ?? value;
};

const getFileAccent = (filename: string): FileAccent => {
  const ext = filename.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'pdf':
      return { Icon: FileText, containerClass: 'bg-red-50 text-red-600' };
    case 'xls':
    case 'xlsx':
      return { Icon: FileSpreadsheet, containerClass: 'bg-emerald-50 text-emerald-600' };
    case 'doc':
    case 'docx':
      return { Icon: FileText, containerClass: 'bg-blue-50 text-blue-600' };
    default:
      return { Icon: FileText, containerClass: 'bg-gray-100 text-gray-600' };
  }
};

export interface ItemAnexoProps {
  anexo: AnexoResponse;
  downloadingId: number | null;
  onDownload: (anexo: AnexoResponse) => void;
  onDelete?: (anexo: AnexoResponse) => void;
  tone?: 'default' | 'subtle';
  dense?: boolean;
  dataUpload?: string | null;
}

export const ItemAnexo = ({
  anexo,
  downloadingId,
  onDownload,
  onDelete,
  tone = 'default',
  dense = false,
  dataUpload,
}: ItemAnexoProps) => {
  const { Icon, containerClass } = getFileAccent(anexo.nmArquivo);
  const wrapperTone = tone === 'subtle' ? 'border-transparent bg-gray-50' : 'border-gray-100 bg-white';
  const responsavelLabel = getResponsavelLabel(anexo.tpResponsavel);
  const dataFormatada = dataUpload ? formatDate(dataUpload) : null;

  return (
    <li
      className={`flex items-center justify-between gap-4 rounded-2xl border ${wrapperTone} ${
        dense ? 'px-4 py-3' : 'px-5 py-4'
      }`}
    >
      <div className="flex min-w-0 items-center gap-3 flex-1">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${containerClass} shrink-0`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">{anexo.nmArquivo}</p>
          {dataFormatada && (
            <p className="text-xs text-gray-500 mt-0.5">
              {dataFormatada} via {responsavelLabel}.
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-blue-600"
          onClick={() => onDownload(anexo)}
          disabled={downloadingId === anexo.idAnexo}
        >
          {downloadingId === anexo.idAnexo ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-red-600"
            onClick={() => onDelete(anexo)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </li>
  );
};

export interface ItemAnexoLinkProps {
  link: string;
  onRemove: (link: string) => void;
  dense?: boolean;
  dataUpload?: string | null;
  responsavel?: string | null;
}

export const ItemAnexoLink = ({ 
  link, 
  onRemove, 
  dense = false, 
  dataUpload, 
  responsavel 
}: ItemAnexoLinkProps) => {
  const dataFormatada = dataUpload ? formatDate(dataUpload) : null;
  
  return (
    <li
      className={`flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white ${
        dense ? 'px-4 py-3' : 'px-5 py-4'
      }`}
    >
      <div className="flex min-w-0 items-center gap-3 flex-1">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 shrink-0">
          <ExternalLink className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">{link}</p>
          {dataFormatada && responsavel && (
            <p className="text-xs text-gray-500 mt-0.5">
              {dataFormatada} via {responsavel}.
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-blue-600"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.open(link, '_blank', 'noopener,noreferrer');
            }
          }}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-red-600"
          onClick={() => onRemove(link)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
};

export type { AnexoResponse } from '@/api/anexos/type';

