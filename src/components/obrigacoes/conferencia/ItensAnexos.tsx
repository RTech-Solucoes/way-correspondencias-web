'use client';

import type { LucideIcon } from 'lucide-react';
import { Download, ExternalLink, FileText, Loader2, Trash2, FileImage, File, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AnexoResponse } from '@/api/anexos/type';
import { TipoResponsavelAnexoEnum } from '@/api/anexos/type';
import { formatDate } from '@/utils/utils';
import React from 'react';

interface FileAccent {
  Icon: LucideIcon | React.ComponentType<{ className?: string }>;
  containerClass: string;
}

// Ícones SVG customizados para tipos de arquivo específicos
const PdfIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M8 12h8" />
    <path d="M8 15h5" />
    <path d="M8 18h8" />
  </svg>
);

const WordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M9 12l1.5 3 1.5-3 1.5 3L15 12" />
    <path d="M9 18h6" />
  </svg>
);

const ExcelIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M8 12l2 3-2 3" />
    <path d="M16 12l-2 3 2 3" />
    <path d="M12 12v6" />
  </svg>
);

const HtmlIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M8 10l1.5 2-1.5 2" />
    <path d="M16 10l-1.5 2 1.5 2" />
    <path d="M10.5 12h3" />
  </svg>
);

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
    // PDF
    case 'pdf':
      return { Icon: PdfIcon, containerClass: 'bg-red-50 text-red-600' };
    
    // Excel
    case 'xls':
    case 'xlsx':
    case 'csv':
      return { Icon: ExcelIcon, containerClass: 'bg-emerald-50 text-emerald-600' };
    
    // Word
    case 'doc':
    case 'docx':
      return { Icon: WordIcon, containerClass: 'bg-blue-50 text-blue-600' };
    
    // Imagens
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'bmp':
    case 'webp':
    case 'svg':
      return { Icon: FileImage, containerClass: 'bg-purple-50 text-purple-600' };
    
    // PowerPoint
    case 'ppt':
    case 'pptx':
      return { Icon: FileText, containerClass: 'bg-orange-50 text-orange-600' };
    
    // Arquivos de texto
    case 'txt':
    case 'rtf':
      return { Icon: FileText, containerClass: 'bg-gray-50 text-gray-600' };
    
    // HTML
    case 'html':
    case 'htm':
      return { Icon: HtmlIcon, containerClass: 'bg-orange-50 text-orange-600' };
    
    // Arquivos de código
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'css':
    case 'json':
    case 'xml':
      return { Icon: FileCode, containerClass: 'bg-indigo-50 text-indigo-600' };
    
    // Arquivos compactados
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return { Icon: File, containerClass: 'bg-amber-50 text-amber-600' };
    
    // Padrão
    default:
      return { Icon: File, containerClass: 'bg-gray-100 text-gray-600' };
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

