'use client';

import {ChangeEvent, useCallback, useEffect, useRef, useState} from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {TextField} from '@/components/ui/text-field';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {MultiSelectAreas} from '@/components/ui/multi-select-areas';
import {ResponsavelRequest, ResponsavelResponse} from '@/api/responsaveis/types';
import {responsaveisClient} from '@/api/responsaveis/client';
import {PerfilResponse} from '@/api/perfis/types';
import {perfisClient} from '@/api/perfis/client';
import {toast} from 'sonner';
import {formValidator, mask} from "@/utils/utils";
import {z} from 'zod';
import { responsavelAnexosClient } from '@/api/responsaveis/anexos-client';
import { ArquivoDTO, TipoObjetoAnexo } from '@/api/anexos/type';
import anexosClient from '@/api/anexos/client';

interface ResponsavelModalProps {
  responsavel: ResponsavelResponse | null;
  open: boolean;
  onClose(): void;
  onSave(): void;
}

export default function ResponsavelModal({ responsavel, open, onClose, onSave }: ResponsavelModalProps) {
  const [formData, setFormData] = useState<ResponsavelRequest>({
    idPerfil: 0,
    nmUsuarioLogin: '',
    nmResponsavel: '',
    dsEmail: '',
    nrCpf: '',
    dtNascimento: '',
    nmCargo: '',
    idsAreas: []
  });
  const [selectedAreaIds, setSelectedAreaIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [perfis, setPerfis] = useState<PerfilResponse[]>([]);
  const [loadingPerfis, setLoadingPerfis] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [existingPhotoPreview, setExistingPhotoPreview] = useState<string | null>(null);
  const [existingPhoto, setExistingPhoto] = useState<{ idAnexo: number; nmArquivo: string } | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const carregarDadosResponsavel = useCallback(() => {
    if (responsavel) {
      const formDataResponsavel = {
        idPerfil: responsavel.idPerfil,
        nmUsuarioLogin: responsavel.nmUsuarioLogin,
        nmResponsavel: responsavel.nmResponsavel,
        dsEmail: responsavel.dsEmail,
        nrCpf: responsavel.nrCpf || '',
        dtNascimento: responsavel.dtNascimento || '',
        nmCargo: responsavel.nmCargo || '',
        idsAreas: responsavel.areas ? responsavel.areas.map(responsavelArea => responsavelArea.area.idArea) : []
      };

      setFormData(formDataResponsavel);

      if (responsavel.areas && responsavel.areas.length > 0) {
        setSelectedAreaIds(responsavel.areas.map(responsavelArea => responsavelArea.area.idArea));
      } else {
        setSelectedAreaIds([]);
      }
    }
  }, [responsavel]);

  const loadExistingPhoto = useCallback(async () => {
    if (!responsavel) return;
    try {
      setPhotoBusy(true);
      const anexos = await anexosClient.buscarPorIdObjetoETipoObjeto(responsavel.idResponsavel, TipoObjetoAnexo.R);
      const byExt = anexos.find(a => /\.(jpg|jpeg|png)$/i.test(a.nmArquivo));
      const chosen = byExt || anexos[0];
      if (chosen) {
        setExistingPhoto({ idAnexo: chosen.idAnexo, nmArquivo: chosen.nmArquivo });

        const cacheKey = `avatar:${responsavel.idResponsavel}:${chosen.nmArquivo}`;
        const cached = typeof window !== 'undefined' ? sessionStorage.getItem(cacheKey) : null;
        if (cached) {
          setPhotoPreview(cached);
          setExistingPhotoPreview(cached);
          return;
        }

        const arquivos = await anexosClient.download(responsavel.idResponsavel, TipoObjetoAnexo.R, chosen.nmArquivo);
        const first = arquivos?.find(a => (a.tipoConteudo?.startsWith('image/') ?? /\.(jpg|jpeg|png)$/i.test(a.nomeArquivo || '')));
        if (first?.conteudoArquivo) {
          const extMime = (chosen.nmArquivo || '').toLowerCase().endsWith('.png') ? 'image/png' : (/(\.jpe?g)$/i.test(chosen.nmArquivo || '') ? 'image/jpeg' : undefined);
          const mime = first.tipoConteudo || extMime || 'image/*';
          const dataUrl = `data:${mime};base64,${first.conteudoArquivo}`;
          setPhotoPreview(dataUrl);
          setExistingPhotoPreview(dataUrl);
          try { sessionStorage.setItem(cacheKey, dataUrl); } catch { }
        } else {
          setPhotoPreview(null);
          setExistingPhotoPreview(null);
        }
        return;
      }

    } catch {
      setExistingPhoto(null);
      setPhotoPreview(null);
      setExistingPhotoPreview(null);
    } finally {
      setPhotoBusy(false);
    }
  }, [responsavel]);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (responsavel) {
      carregarDadosResponsavel();
    } else {
      setFormData({
        idPerfil: 0,
        nmUsuarioLogin: '',
        nmResponsavel: '',
        dsEmail: '',
        nrCpf: '',
        dtNascimento: '',
        nmCargo: '',
        idsAreas: []
      });
      setSelectedAreaIds([]);
      setSelectedPhotoFile(null);
      setPhotoPreview(null);
      setExistingPhotoPreview(null);
      setExistingPhoto(null);
    }

    (async () => {
      await Promise.all([
        buscarPerfis(),
        responsavel ? loadExistingPhoto() : Promise.resolve(),
      ]);
    })();
  }, [open, responsavel, buscarPerfis, carregarDadosResponsavel, loadExistingPhoto]);

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    
    try {
      switch (name) {
        case 'nmResponsavel':
          formValidator.name.parse(value);
          delete newErrors[name];
          break;
        case 'nmUsuarioLogin':
          formValidator.username.parse(value);
          delete newErrors[name];
          break;
        case 'dsEmail':
          formValidator.email.parse(value);
          delete newErrors[name];
          break;
        case 'nrCpf':
          formValidator.cpf.parse(value);
          delete newErrors[name];
          break;
        case 'dtNascimento':
          formValidator.birthDate.parse(value);
          delete newErrors[name];
          break;
        default:
          break;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors[name] = error.issues[0]?.message || 'Campo inválido';
      }
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'nrCpf') {
      processedValue = value.replace(/\D/g, '');
      if (processedValue.length > 11) return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));

    if (processedValue) {
      validateField(name, processedValue);
    } else {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleAreasSelectionChange = useCallback((selectedIds: number[]) => {
    setSelectedAreaIds(selectedIds);
    setFormData(prev => ({
      ...prev,
      idsAreas: selectedIds
    }));
  }, []);

  const responsavelSchema = z.object({
    nmResponsavel: formValidator.name,
    nmUsuarioLogin: formValidator.username,
    dsEmail: formValidator.email,
    nrCpf: formValidator.cpf,
    dtNascimento: formValidator.birthDate,
    idPerfil: formValidator.id,
    idsAreas: z.array(z.number()).optional().default([]),
  });

  const handleSubmit = async () => {
    const result = responsavelSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    try {
      setLoading(true);

      const responsavelRequest: ResponsavelRequest = {
        idPerfil: formData.idPerfil,
        nmUsuarioLogin: formData.nmUsuarioLogin.trim(),
        nmResponsavel: formData.nmResponsavel.trim(),
        dsEmail: formData.dsEmail.trim(),
        nrCpf: formData.nrCpf.trim(),
        dtNascimento: formData.dtNascimento,
        nmCargo: formData.nmCargo.trim(),
        idsAreas: selectedAreaIds.length > 0 ? selectedAreaIds : []
      };

      if (responsavel) {
        const updated = await responsaveisClient.atualizar(responsavel.idResponsavel, responsavelRequest);
        if (selectedPhotoFile) {
          // Replace existing photo if any, then upload new
          try {
            if (existingPhoto) {
              await responsavelAnexosClient.deletar(responsavel.idResponsavel, existingPhoto.idAnexo);
            }
          } catch { /* ignore delete failure */ }
          const dto = await fileToArquivoDTO(selectedPhotoFile);
          await responsavelAnexosClient.upload(responsavel.idResponsavel, [dto]);
        }
        toast.success("Responsável atualizado com sucesso");
      } else {
        const created = await responsaveisClient.criar(responsavelRequest);
        if (selectedPhotoFile && created?.idResponsavel) {
          const dto = await fileToArquivoDTO(selectedPhotoFile);
          await responsavelAnexosClient.upload(created.idResponsavel, [dto]);
        }
        toast.success("Responsável criado com sucesso");
      }

      onSave();
      onClose();
    } catch {
      toast.error(responsavel ? "Erro ao atualizar responsável" : "Erro ao criar responsável");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const isFormValid = useCallback(() => {
    const result = responsavelSchema.safeParse(formData);
    return result.success && Object.keys(errors).length === 0;
  }, [formData, errors]);

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !newOpen && onClose()}>
      <DialogContent className="h-full flex flex-col">
        <DialogHeader className="pb-6 flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">
            {responsavel ? 'Editar Responsável' : 'Novo Responsável'}
          </DialogTitle>
        </DialogHeader>

        <form className="flex flex-col flex-1 overflow-y-auto gap-4">

          <TextField
            label="Nome *"
            name="nmResponsavel"
            value={formData.nmResponsavel}
            onChange={handleChange}
            onBlur={() => validateField('nmResponsavel', formData.nmResponsavel)}
            error={errors.nmResponsavel}
            required
            autoFocus
          />

          <TextField
            label="Usuário *"
            name="nmUsuarioLogin"
            value={formData.nmUsuarioLogin}
            onChange={handleChange}
            onBlur={() => validateField('nmUsuarioLogin', formData.nmUsuarioLogin)}
            error={errors.nmUsuarioLogin}
            required
          />

          <TextField
            label="Email *"
            name="dsEmail"
            type="email"
            value={formData.dsEmail}
            onChange={handleChange}
            onBlur={() => validateField('dsEmail', formData.dsEmail)}
            error={errors.dsEmail}
            required
          />

          <TextField
            label="CPF *"
            name="nrCpf"
            value={mask.cpf(formData.nrCpf)}
            onChange={handleChange}
            maxLength={14}
            required
            onBlur={() => validateField('nrCpf', formData.nrCpf)}
            error={errors.nrCpf}
          />

          <TextField
            label="Nome do Cargo"
            name="nmCargo"
            value={formData.nmCargo}
            onChange={handleChange}
          />

          <TextField
            label="Data de Nascimento *"
            name="dtNascimento"
            type="date"
            value={formData.dtNascimento}
            onChange={handleChange}
            onBlur={() => validateField('dtNascimento', formData.dtNascimento)}
            error={errors.dtNascimento}
            required
          />

          <div className="space-y-2">
            <Label htmlFor="idPerfil">Perfil *</Label>
            <Select
              value={formData.idPerfil > 0 ? formData.idPerfil.toString() : ""}
              onValueChange={(value) => setFormData(prev => ({ ...prev, idPerfil: parseInt(value) }))}
              disabled={loadingPerfis}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingPerfis ? "Carregando perfis..." : "Selecione o perfil"} />
              </SelectTrigger>
              <SelectContent>
                {!loadingPerfis && perfis?.length > 0 ? (
                  perfis.map(perfil => (
                    <SelectItem key={perfil.idPerfil} value={perfil.idPerfil.toString()}>
                      {perfil.nmPerfil}
                    </SelectItem>
                  ))
                ) : !loadingPerfis && perfis?.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-gray-500">
                    Nenhum perfil disponível
                  </div>
                ) : null}
              </SelectContent>
            </Select>
          </div>

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
                <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={loading}>
                  {photoPreview ? 'Trocar foto' : 'Adicionar foto'}
                </Button>
                {selectedPhotoFile ? (
                  <Button type="button" variant="outline" onClick={() => { setSelectedPhotoFile(null); setPhotoPreview(existingPhotoPreview); }} disabled={loading}>Limpar seleção</Button>
                ) : existingPhoto ? (
                  <Button
                    type="button"
                    variant="outline"
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
                    disabled={loading || photoBusy}
                  >
                    Remover foto
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <MultiSelectAreas
            selectedAreaIds={selectedAreaIds}
            onSelectionChange={handleAreasSelectionChange}
            label="Áreas"
            disabled={false}
          />

        </form>
        <DialogFooter className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !isFormValid()}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : responsavel ? 'Salvar Alterações' : 'Criar Responsável'}
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
