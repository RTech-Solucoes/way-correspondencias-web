'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { MultiSelectAreas } from '@/components/ui/multi-select-areas';
import { MultiSelectConcessionarias } from '@/components/ui/multi-select-concessionarias';
import { ResponsavelRequest, ResponsavelResponse } from '@/api/responsaveis/types';
import { responsaveisClient } from '@/api/responsaveis/client';
import { PerfilResponse } from '@/api/perfis/types';
import { perfisClient } from '@/api/perfis/client';
import { User } from '@/types/auth/types';
import { toast } from 'sonner';
import { mask, validateCPF, validateEmail } from "@/utils/utils";
import authClient from '@/api/auth/client';
import anexosClient from '@/api/anexos/client';
import { TipoObjetoAnexo, ArquivoDTO } from '@/api/anexos/type';
import { responsavelAnexosClient } from '@/api/responsaveis/anexos-client';
import { useConcessionaria } from '@/context/concessionaria/ConcessionariaContext';
import concessionariaClient from '@/api/concessionaria/client';

interface ProfileModalProps {
  user: User | null;
  open: boolean;
  onClose(): void;
  onSave?(): void;
}

export default function ProfileModal({ user, open, onClose, onSave }: ProfileModalProps) {
  const [responsavel, setResponsavel] = useState<ResponsavelResponse | null>(null);
  const [formData, setFormData] = useState<ResponsavelRequest>({
    idPerfil: 0,
    nmUsuarioLogin: '',
    nmResponsavel: '',
    dsEmail: '',
    nrCpf: '',
    dtNascimento: '',
    idsAreas: [],
    nmCargo: '',
    idsConcessionarias: []
  });
  const [selectedAreaIds, setSelectedAreaIds] = useState<number[]>([]);
  const [selectedConcessionariaIds, setSelectedConcessionariaIds] = useState<number[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [perfis, setPerfis] = useState<PerfilResponse[]>([]);
  const [loadingPerfis, setLoadingPerfis] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [existingPhotoPreview, setExistingPhotoPreview] = useState<string | null>(null);
  const [existingPhoto, setExistingPhoto] = useState<{ idAnexo: number; nmArquivo: string } | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [savingData, setSavingData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const { concessionariaSelecionada, concessionariaChangeKey } = useConcessionaria();

  const getPerfil = (): string => {
    return perfis?.filter(perfil => perfil.idPerfil === formData.idPerfil)?.[0]?.nmPerfil ||
      (loadingPerfis ? 'Carregando...' : 'Nenhum perfil atribuído')
  }

  const validateField = (fieldName: string, value: string): void => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'dsEmail':
        if (value && !validateEmail(value)) {
          newErrors.dsEmail = 'Email inválido';
        } else {
          delete newErrors.dsEmail;
        }
        break;
      case 'nrCpf':
        if (value && !validateCPF(value)) {
          newErrors.nrCpf = 'CPF inválido';
        } else {
          delete newErrors.nrCpf;
        }
        break;
      case 'dtNascimento':
        if (value) {
          const birthDate = new Date(value);
          const today = new Date();
          if (birthDate > today) {
            newErrors.dtNascimento = 'Data de nascimento não pode ser futura';
          } else {
            delete newErrors.dtNascimento;
          }
        } else {
          delete newErrors.dtNascimento;
        }
        break;
    }

    setErrors(newErrors);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.dsEmail && !validateEmail(formData.dsEmail)) {
      newErrors.dsEmail = 'Email inválido';
    }

    if (formData.nrCpf && !validateCPF(formData.nrCpf)) {
      newErrors.nrCpf = 'CPF inválido';
    }

    if (formData.dtNascimento) {
      const birthDate = new Date(formData.dtNascimento);
      const today = new Date();
      if (birthDate > today) {
        newErrors.dtNascimento = 'Data de nascimento não pode ser futura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSaveData = async () => {
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros antes de salvar');
      return;
    }

    try {
      setSavingData(true);
      const idFromToken = authClient.getUserIdResponsavelFromToken();
      const idResponsavel = user?.idResponsavel ?? idFromToken;
      
      if (!idResponsavel) {
        toast.error('Erro ao identificar usuário');
        return;
      }

      const updateData: ResponsavelRequest = {
        idPerfil: formData.idPerfil,
        nmUsuarioLogin: formData.nmUsuarioLogin,
        nmResponsavel: formData.nmResponsavel,
        dsEmail: formData.dsEmail,
        nrCpf: formData.nrCpf,
        dtNascimento: formData.dtNascimento,
        nmCargo: formData.nmCargo,
        idsAreas: formData.idsAreas,
        idsConcessionarias: selectedConcessionariaIds.length > 0 ? selectedConcessionariaIds : []
      };

      await responsaveisClient.atualizar(idResponsavel, updateData);
      toast.success('Dados atualizados com sucesso');
      onSave?.();
      onClose();
    } catch (error) {
      const errorMessage = (error as Error)?.message || (responsavel ? "Erro ao atualizar responsável" : "Erro ao criar responsável");
      toast.error(errorMessage);
    } finally {
      setSavingData(false);
    }
  };

  const isFormValid = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (formData.dsEmail && !validateEmail(formData.dsEmail)) {
      newErrors.dsEmail = 'Email inválido';
    }

    if (formData.nrCpf && !validateCPF(formData.nrCpf)) {
      newErrors.nrCpf = 'CPF inválido';
    }

    if (formData.dtNascimento) {
      const birthDate = new Date(formData.dtNascimento);
      const today = new Date();
      if (birthDate > today) {
        newErrors.dtNascimento = 'Data de nascimento não pode ser futura';
      }
    }

    return Object.keys(newErrors).length === 0 && Object.keys(errors).length === 0;
  }, [formData, errors]);

  const buscarPerfis = useCallback(async () => {
    try {
      setLoadingPerfis(true);
      const response = await perfisClient.buscarPorFiltro({ size: 100 });
      const perfisAtivos = response.content.filter(perfil => perfil.flAtivo === 'S');
      setPerfis(perfisAtivos);
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
      toast.error("Erro ao carregar perfis");
      setPerfis([]);
    } finally {
      setLoadingPerfis(false);
    }
  }, []);

  const buscarDadosResponsavel = useCallback(async () => {
    const idFromToken = authClient.getUserIdResponsavelFromToken();
    const idResponsavel = user?.idResponsavel ?? idFromToken;
    if (!idResponsavel) return;

    try {
      setLoadingData(true);
      const [responsavelData, concessionariasResponsavel] = await Promise.all([
        responsaveisClient.buscarPorId(idResponsavel),
        concessionariaClient.buscarPorIdResponsavelLogado()
      ]);
      
      setResponsavel(responsavelData);

      // Usar concessionárias do endpoint específico ou do response do responsável
      const concessionariaIds = concessionariasResponsavel && concessionariasResponsavel.length > 0
        ? concessionariasResponsavel.map(c => c.idConcessionaria)
        : (responsavelData.concessionarias 
            ? responsavelData.concessionarias.map(c => c.idConcessionaria) 
            : []);

      const formDataResponsavel = {
        idPerfil: responsavelData.idPerfil,
        nmUsuarioLogin: responsavelData.nmUsuarioLogin,
        nmResponsavel: responsavelData.nmResponsavel,
        dsEmail: responsavelData.dsEmail,
        nrCpf: responsavelData.nrCpf || '',
        dtNascimento: responsavelData.dtNascimento || '',
        nmCargo: responsavelData.nmCargo || '',
        idsAreas: responsavelData.areas ? responsavelData.areas.map(responsavelArea => responsavelArea.area.idArea) : [],
        idsConcessionarias: concessionariaIds
      };

      setFormData(formDataResponsavel);

      if (responsavelData.areas && responsavelData.areas.length > 0) {
        setSelectedAreaIds(responsavelData.areas.map(responsavelArea => responsavelArea.area.idArea));
      } else {
        setSelectedAreaIds([]);
      }

      setSelectedConcessionariaIds(concessionariaIds);
    } catch (error) {
      console.error('Erro ao carregar dados do responsável:', error);
      toast.error("Erro ao carregar dados do usuário");
    } finally {
      setLoadingData(false);
    }
  }, [user?.idResponsavel]);

  const loadExistingPhoto = useCallback(async () => {
    const idFromToken = authClient.getUserIdResponsavelFromToken();
    const idResponsavel = user?.idResponsavel ?? idFromToken;
    if (!idResponsavel) return;
    try {
      setPhotoBusy(true);
      const anexos = await anexosClient.buscarPorIdObjetoETipoObjeto(idResponsavel, TipoObjetoAnexo.R);
      const byExt = anexos.find(a => /(\.jpg|jpeg|png)$/i.test(a.nmArquivo));
      const chosen = byExt || anexos[0];
      if (chosen) {
        setExistingPhoto({ idAnexo: chosen.idAnexo, nmArquivo: chosen.nmArquivo });
        const arquivos = await anexosClient.download(idResponsavel, TipoObjetoAnexo.R, chosen.nmArquivo);
        const first = arquivos?.find(a => (a.tipoConteudo?.startsWith('image/') ?? /(\.jpg|jpeg|png)$/i.test(a.nomeArquivo || '')));
        if (first?.conteudoArquivo) {
          const lower = (chosen.nmArquivo || '').toLowerCase();
          const extMime = lower.endsWith('.png') ? 'image/png' : (/\.jpe?g$/.test(lower) ? 'image/jpeg' : undefined);
          const mime = first.tipoConteudo || extMime || 'image/*';
          const dataUrl = `data:${mime};base64,${first.conteudoArquivo}`;
          setPhotoPreview(dataUrl);
          setExistingPhotoPreview(dataUrl);
        } else {
          setPhotoPreview(null);
          setExistingPhotoPreview(null);
        }
        return;
      } else {
        setPhotoPreview(null);
        setExistingPhotoPreview(null);
      }
    } catch {
      setExistingPhoto(null);
      setPhotoPreview(null);
      setExistingPhotoPreview(null);
    } finally {
      setPhotoBusy(false);
    }
  }, [user?.idResponsavel]);

  useEffect(() => {
    if (open) {
      setErrors({});
      setResponsavel(null);
      setFormData({
        idPerfil: 0,
        nmUsuarioLogin: '',
        nmResponsavel: '',
        dsEmail: '',
        nrCpf: '',
        dtNascimento: '',
        idsAreas: [],
        nmCargo: '',
        idsConcessionarias: []
      });
      setSelectedAreaIds([]);
      setSelectedConcessionariaIds([]);
      setSelectedPhotoFile(null);
      setPhotoPreview(null);
      setExistingPhotoPreview(null);
      setExistingPhoto(null);

      (async () => {
        await Promise.all([
          buscarPerfis(),
          buscarDadosResponsavel(),
          loadExistingPhoto(),
        ]);
      })();
    } else {
      // Limpar estados ao fechar o modal
      setErrors({});
      setResponsavel(null);
      setSelectedPhotoFile(null);
      setPhotoPreview(null);
      setExistingPhotoPreview(null);
    }
  }, [open, buscarPerfis, buscarDadosResponsavel, loadExistingPhoto]);

  // Atualizar concessionárias quando a concessionária no header mudar
  useEffect(() => {
    if (open && concessionariaChangeKey > 0) {
      const atualizarConcessionarias = async () => {
        try {
          const concessionariasResponsavel = await concessionariaClient.buscarPorIdResponsavelLogado();
          if (concessionariasResponsavel && Array.isArray(concessionariasResponsavel) && concessionariasResponsavel.length > 0) {
            const concessionariaIds = concessionariasResponsavel.map(c => c.idConcessionaria).filter(id => id !== undefined);
            if (concessionariaIds.length > 0) {
              setSelectedConcessionariaIds(concessionariaIds);
              setFormData(prev => ({
                ...prev,
                idsConcessionarias: concessionariaIds
              }));
            }
          }
        } catch (error) {
          console.error('Erro ao atualizar concessionárias:', error);
          // Não mostra erro ao usuário, apenas loga
        }
      };
      atualizarConcessionarias();
    }
  }, [open, concessionariaChangeKey]);

  // Fechar modal e limpar dados quando o usuário fizer logout
  useEffect(() => {
    const handleAuthTokenRemoved = () => {
      console.log('[ProfileModal] Token removido - fechando modal e limpando dados');
      onClose();
    };

    window.addEventListener('authTokenRemoved', handleAuthTokenRemoved);

    return () => {
      window.removeEventListener('authTokenRemoved', handleAuthTokenRemoved);
    };
  }, [onClose]);

  if (loadingData) {
    return (
      <Dialog open={open} onOpenChange={(newOpen) => !newOpen && onClose()}>
        <DialogContent className="h-full flex flex-col">
          <DialogHeader className="pb-6 flex-shrink-0">
            <DialogTitle className="text-xl font-semibold">
              Minha Conta
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando dados...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !newOpen && onClose()}>
      <DialogContent className="h-full flex flex-col">
        <DialogHeader className="pb-6 flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">
            Minha Conta
          </DialogTitle>
        </DialogHeader>

        <form className="flex flex-col flex-1 overflow-y-auto gap-4">
          <TextField
            label="Nome"
            name="nmResponsavel"
            value={formData.nmResponsavel}
            readOnly
            disabled
          />

          <TextField
            label="Usuário"
            name="nmUsuarioLogin"
            value={formData.nmUsuarioLogin}
            readOnly
            disabled
          />

          <TextField
            label="Email"
            name="dsEmail"
            type="email"
            value={formData.dsEmail}
            onChange={(e) => setFormData(prev => ({ ...prev, dsEmail: e.target.value }))}
            onBlur={() => validateField('dsEmail', formData.dsEmail)}
            error={errors.dsEmail}
          />

          <TextField
            label="CPF"
            name="nrCpf"
            value={mask.cpf(formData.nrCpf)}
            onChange={(e) => setFormData(prev => ({ ...prev, nrCpf: e.target.value.replace(/\D/g, '') }))}
            onBlur={() => validateField('nrCpf', formData.nrCpf)}
            error={errors.nrCpf}
          />

          <TextField
            label="Data de Nascimento"
            name="dtNascimento"
            type="date"
            value={formData.dtNascimento}
            onChange={(e) => setFormData(prev => ({ ...prev, dtNascimento: e.target.value }))}
            onBlur={() => validateField('dtNascimento', formData.dtNascimento)}
            error={errors.dtNascimento}
          />

          <TextField
            label="Nome do Cargo"
            name="nmCargo"
            value={formData.nmCargo}
            readOnly
            disabled
          />

          <TextField
            label="Perfil"
            name="idPerfil"
            value={getPerfil()}
            readOnly
            disabled
          />

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <div className="w-20 h-20 rounded-full bg-white border border-gray-200 overflow-hidden flex items-center justify-center shadow-sm">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Foto do responsável" className="w-full h-full object-cover" />
                  ) : (
                    <img src='/images/avatar.svg' alt="Foto do responsável" className="w-full h-full object-cover" />
                  )}
                </div>
                {(selectedPhotoFile?.name || existingPhoto?.nmArquivo) && (
                  <span className="text-xs text-gray-600 max-w-[12rem] truncate" title={selectedPhotoFile?.name || existingPhoto?.nmArquivo || ''}>
                    {selectedPhotoFile?.name || existingPhoto?.nmArquivo}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0] || null;
                    if (!file) return;
                    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
                    if (!validTypes.includes(file.type)) {
                      toast.error('Formato inválido. Use JPG, JPEG ou PNG.');
                      e.currentTarget.value = '';
                      return;
                    }
                    setSelectedPhotoFile(file);
                    const reader = new FileReader();
                    reader.onload = () => setPhotoPreview(reader.result as string);
                    reader.readAsDataURL(file);
                  }}
                />
                <button
                  type="button"
                  
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gray-900 text-white hover:bg-gray-800 h-10 px-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoPreview ? 'Trocar foto' : 'Adicionar foto'}
                </button>
                {selectedPhotoFile && (
                  <button
                    type="button"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md border border-input bg-background h-10 px-4 text-sm"
                    onClick={() => { setSelectedPhotoFile(null); setPhotoPreview(existingPhotoPreview); }}
                    >
                    Limpar seleção
                  </button>
                )}
                {existingPhoto && (
                    <button
                      type="button"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md border border-input bg-background h-10 px-4 text-sm"
                      onClick={async () => {
                        if (!responsavel || !existingPhoto) return;
                        try {
                          setPhotoBusy(true);
                          await responsavelAnexosClient.deletar(responsavel.idResponsavel, existingPhoto.idAnexo);
                          setExistingPhoto(null);
                          setPhotoPreview(null);
                          setExistingPhotoPreview(null);
                          toast.success('Foto removida');
                        } catch {
                          toast.error('Falha ao remover foto');
                        } finally {
                          setPhotoBusy(false);
                        }
                      }}
                      >
                      Remover foto
                    </button>
                )}
                {selectedPhotoFile && (
                  <button
                    type="button"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-10 px-4"
                    onClick={async () => {
                      const idFromToken = authClient.getUserIdResponsavelFromToken();
                      const idResponsavel = user?.idResponsavel ?? idFromToken;
                      if (!idResponsavel || !selectedPhotoFile) return;
                      try {
                        setPhotoBusy(true);
                        try {
                          if (existingPhoto) {
                            await responsavelAnexosClient.deletar(idResponsavel, existingPhoto.idAnexo);
                          }
                        } catch { /* ignore */ }
                        const dto = await fileToArquivoDTO(selectedPhotoFile);
                        await responsavelAnexosClient.upload(idResponsavel, [dto]);
                        toast.success('Foto atualizada');
                        setSelectedPhotoFile(null);
                        await loadExistingPhoto();
                      } catch {
                        toast.error('Falha ao salvar foto');
                      } finally {
                        setPhotoBusy(false);
                      }
                    }}
                    >
                    Salvar foto
                  </button>
                )}
              </div>
            </div>
          </div>

          <MultiSelectAreas
            selectedAreaIds={selectedAreaIds}
            onSelectionChange={() => {}}
            label="Áreas"
            disabled
          />

          <MultiSelectConcessionarias
            selectedConcessionariaIds={selectedConcessionariaIds}
            onSelectionChange={(selectedIds) => {
              setSelectedConcessionariaIds(selectedIds);
              setFormData(prev => ({
                ...prev,
                idsConcessionarias: selectedIds
              }));
            }}
            label="Concessionárias"
            disabled={true}
          />

        </form>
        <DialogFooter className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={savingData}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveData}
            disabled={savingData || !isFormValid()}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingData ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

async function fileToArquivoDTO(file: File): Promise<ArquivoDTO> {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const commaIndex = result.indexOf(',');
      resolve(commaIndex >= 0 ? result.substring(commaIndex + 1) : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return {
    nomeArquivo: file.name,
    tipoConteudo: file.type,
    conteudoArquivo: base64,
  };
}
