'use client';

import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelectAreas } from '@/components/ui/multi-select-areas';
import { ResponsavelRequest, ResponsavelResponse } from '@/api/responsaveis/types';
import { responsaveisClient } from '@/api/responsaveis/client';
import { PerfilResponse } from '@/api/perfis/types';
import { perfisClient } from '@/api/perfis/client';
import { User } from '@/types/auth/types';
import { toast } from 'sonner';
import { formValidator, mask } from "@/utils/utils";
import { z } from 'zod';

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
    idsAreas: []
  });
  const [selectedAreaIds, setSelectedAreaIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [perfis, setPerfis] = useState<PerfilResponse[]>([]);
  const [loadingPerfis, setLoadingPerfis] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getPerfil = (): string => {
    return perfis?.filter(perfil => perfil.idPerfil === formData.idPerfil)?.[0]?.nmPerfil ||
      (loadingPerfis ? 'Carregando...' : 'Nenhum perfil atribuído')
  }

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
    if (!user?.username) return;

    try {
      setLoadingData(true);
      const responsavelData = await responsaveisClient.buscarPorNmUsuarioLogin(user.username);
      setResponsavel(responsavelData);

      const formDataResponsavel = {
        idPerfil: responsavelData.idPerfil,
        nmUsuarioLogin: responsavelData.nmUsuarioLogin,
        nmResponsavel: responsavelData.nmResponsavel,
        dsEmail: responsavelData.dsEmail,
        nrCpf: responsavelData.nrCpf || '',
        dtNascimento: responsavelData.dtNascimento || '',
        idsAreas: responsavelData.areas ? responsavelData.areas.map(responsavelArea => responsavelArea.area.idArea) : []
      };

      setFormData(formDataResponsavel);

      if (responsavelData.areas && responsavelData.areas.length > 0) {
        setSelectedAreaIds(responsavelData.areas.map(responsavelArea => responsavelArea.area.idArea));
      } else {
        setSelectedAreaIds([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do responsável:', error);
      toast.error("Erro ao carregar dados do usuário");
    } finally {
      setLoadingData(false);
    }
  }, [user?.username]);

  useEffect(() => {
    if (open) {
      buscarPerfis();
      buscarDadosResponsavel();
      setErrors({});
    }
  }, [open, buscarPerfis, buscarDadosResponsavel]);

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    try {
      switch (name) {
        case 'nmResponsavel':
          formValidator.name.parse(value);
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

    if (name === 'nmResponsavel') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));

      if (value) {
        validateField(name, value);
      } else {
        const newErrors = { ...errors };
        delete newErrors[name];
        setErrors(newErrors);
      }
    }
  };


  const handleSubmit = async () => {
    if (!formData.nmResponsavel.trim()) {
      setErrors({ nmResponsavel: 'Nome é obrigatório' });
      toast.error('Nome é obrigatório');
      return;
    }

    if (!responsavel) {
      toast.error('Dados do usuário não carregados');
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
        idsAreas: selectedAreaIds.length > 0 ? selectedAreaIds : []
      };

      await responsaveisClient.atualizar(responsavel.idResponsavel, responsavelRequest);
      toast.success("Nome atualizado com sucesso");

      if (onSave) {
        onSave();
      }

      onClose();
    } catch {
      toast.error("Erro ao atualizar nome");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

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
            label="Nome (editável)"
            name="nmResponsavel"
            value={formData.nmResponsavel}
            onChange={handleChange}
            onBlur={() => validateField('nmResponsavel', formData.nmResponsavel)}
            error={errors.nmResponsavel}
            required
            autoFocus
          />

          <TextField
            label="Usuário"
            name="nmUsuarioLogin"
            value={formData.nmUsuarioLogin}
            readOnly
          />

          <TextField
            label="Email"
            name="dsEmail"
            type="email"
            value={formData.dsEmail}
            readOnly
          />

          <TextField
            label="CPF"
            name="nrCpf"
            value={mask.cpf(formData.nrCpf)}
            readOnly
          />

          <TextField
            label="Data de Nascimento"
            name="dtNascimento"
            type="date"
            value={formData.dtNascimento}
            readOnly
          />

          <TextField
            label="Perfil"
            name="idPerfil"
            value={getPerfil()}
            readOnly
          />

          <MultiSelectAreas
            selectedAreaIds={selectedAreaIds}
            onSelectionChange={() => {}}
            label="Áreas"
          />

        </form>
        <DialogFooter className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.nmResponsavel.trim()}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : 'Salvar Nome'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
