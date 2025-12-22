import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseEvidenceLinkInputParams {
  onEvidenceLinkAdd?: (link: string) => void;
}

export function useEvidenceLinkInput({ onEvidenceLinkAdd }: UseEvidenceLinkInputParams) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [evidenceLinkValue, setEvidenceLinkValue] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);

  const validateUrl = useCallback((url: string): boolean => {
    if (!url.trim()) {
      return false;
    }
    
    try {
      const urlWithProtocol = url.startsWith('http://') || url.startsWith('https://') 
        ? url 
        : `https://${url}`;
      
      const urlObj = new URL(urlWithProtocol);
      const hostname = urlObj.hostname;
      
      if (!hostname || hostname.length === 0) {
        return false;
      }
      
      if (/^\d+$/.test(hostname)) {
        return false;
      }
      
      if (!hostname.includes('.')) {
        return false;
      }
      
      const parts = hostname.split('.');
      if (parts.length < 2) {
        return false;
      }
      
      const tld = parts[parts.length - 1];
      if (!tld || tld.length < 2) {
        return false;
      }
      
      const domain = parts[0];
      if (!domain || /^\d+$/.test(domain)) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }, []);

  const handleToggleLinkInput = useCallback(() => {
    setShowLinkInput(true);
  }, []);

  const handleEvidenceLinkValueChange = useCallback((value: string) => {
    setEvidenceLinkValue(value);
    
    if (value.trim()) {
      const isValid = validateUrl(value);
      if (!isValid) {
        setLinkError('Formato do link inválido');
      } else {
        setLinkError(null);
      }
    } else {
      setLinkError(null);
    }
  }, [validateUrl]);

  const handleEvidenceLinkSave = useCallback(() => {
    const trimmed = evidenceLinkValue.trim();
    if (!trimmed) {
      toast.warning('Informe um link válido.');
      return;
    }

    if (!validateUrl(trimmed)) {
      setLinkError('Formato do link inválido');
      return;
    }

    if (onEvidenceLinkAdd) {
      onEvidenceLinkAdd(trimmed);
    }
    
    setEvidenceLinkValue('');
    setLinkError(null);
    setShowLinkInput(false);
  }, [evidenceLinkValue, onEvidenceLinkAdd, validateUrl]);

  const handleEvidenceLinkCancel = useCallback(() => {
    setShowLinkInput(false);
    setEvidenceLinkValue('');
    setLinkError(null);
  }, []);

  return {
    showLinkInput,
    evidenceLinkValue,
    linkError,
    handleToggleLinkInput,
    handleEvidenceLinkValueChange,
    handleEvidenceLinkSave,
    handleEvidenceLinkCancel,
  };
}

