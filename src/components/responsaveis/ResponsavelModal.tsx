'use client';

import {ChangeEvent, useCallback, useEffect, useState} from 'react';
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
import {validateCPF} from "@/utils/utils";

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
    idsAreas: []
  });
  const [selectedAreaIds, setSelectedAreaIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [perfis, setPerfis] = useState<PerfilResponse[]>([]);
  const [loadingPerfis, setLoadingPerfis] = useState(false);
  const [cpfError, setCpfError] = useState<string>('');
  const [dataError, setDataError] = useState<string>('');

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
      console.log('Carregando dados do responsável:', responsavel);
      console.log('ID do perfil do responsável:', responsavel.idPerfil);

      const formDataResponsavel = {
        idPerfil: responsavel.idPerfil,
        nmUsuarioLogin: responsavel.nmUsuarioLogin,
        nmResponsavel: responsavel.nmResponsavel,
        dsEmail: responsavel.dsEmail,
        nrCpf: responsavel.nrCpf || '',
        dtNascimento: responsavel.dtNascimento || '',
        idsAreas: responsavel.areas ? responsavel.areas.map(responsavelArea => responsavelArea.area.idArea) : []
      };

      console.log('Atualizando formData com:', formDataResponsavel);
      setFormData(formDataResponsavel);

      if (responsavel.areas && responsavel.areas.length > 0) {
        setSelectedAreaIds(responsavel.areas.map(responsavelArea => responsavelArea.area.idArea));
      } else {
        setSelectedAreaIds([]);
      }
    }
  }, [responsavel]);

  useEffect(() => {
    if (open) {
      buscarPerfis();
      setCpfError('');
    }
  }, [open, buscarPerfis]);

  useEffect(() => {
    if (open && perfis.length > 0) {
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
          idsAreas: []
        });
        setSelectedAreaIds([]);
      }
    }
  }, [open, responsavel, perfis.length, carregarDadosResponsavel]);

  useEffect(() => {
    console.log('FormData atualizado:', formData);
    console.log('Perfil ID atual no formData:', formData.idPerfil);
    console.log('Perfis disponíveis:', perfis);
  }, [formData, perfis]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    const newValue = value;

    switch (name) {
      case "nrCpf":
        const cpfLimpo = value.replace(/\D/g, '');

        if (cpfLimpo.length > 11) return;

        setFormData(prev => ({
          ...prev,
          [name]: cpfLimpo,
        }));

        if (cpfLimpo.length === 11) {
          if (!validateCPF(cpfLimpo)) {
            setCpfError('CPF inválido');
          } else {
            setCpfError('');
          }
        } else {
          setCpfError('');
        }
        return;

      case "dtNascimento":
        const regex = /^\d{0,4}-?\d{0,2}-?\d{0,2}$/;
        const age = calculateAge(value);

        console.log(age)

        if (!regex.test(value)) return;
        if (age < 10) {
          setDataError('Data de nascimento inválida')
        } else {
          setDataError('')
        }
        break;

      default:
        break;
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));
  };


  const handleAreasSelectionChange = useCallback((selectedIds: number[]) => {
    setSelectedAreaIds(selectedIds);
    setFormData(prev => ({
      ...prev,
      idsAreas: selectedIds
    }));
  }, []);

  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;

    const today = new Date();
    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const handleSubmit = async () => {
    if (formData.nrCpf.trim().length !== 11) {
      toast.error("CPF inválido");
      return;
    }

    const age = calculateAge(formData.dtNascimento);

    if (age < 10) {
      toast.error("Data de nascimento inválida");
      return;
    }

    if (!validateCPF(formData.nrCpf)) {
      setCpfError('CPF inválido');
      return;
    } else {
      setCpfError('');
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

      if (responsavel) {
        await responsaveisClient.atualizar(responsavel.idResponsavel, responsavelRequest);
        toast.success("Responsável atualizado com sucesso");
      } else {
        await responsaveisClient.criar(responsavelRequest);
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
    return formData.nmResponsavel.trim() !== '' &&
      formData.dsEmail.trim() !== '' &&
      formData.nmUsuarioLogin.trim() !== '' &&
      formData.nrCpf.trim() !== '' &&
      formData.dtNascimento.trim() !== '' && !dataError &&
      formData.idPerfil > 0 &&
      !cpfError && formData.nrCpf.length === 11 && validateCPF(formData.nrCpf);
  }, [formData, cpfError]);

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
            required
            autoFocus
          />

          <TextField
            label="Usuário *"
            name="nmUsuarioLogin"
            value={formData.nmUsuarioLogin}
            onChange={handleChange}
            required
          />

          <TextField
            label="Email *"
            name="dsEmail"
            type="email"
            value={formData.dsEmail}
            onChange={handleChange}
            required
          />

          <TextField
            label="CPF *"
            name="nrCpf"
            value={formData.nrCpf}
            onChange={handleChange}
            maxLength={11}
            required
            onBlur={() => {
              if (formData.nrCpf.length < 11) {
                setCpfError('CPF deve ter 11 dígitos');
              }
            }}
            error={cpfError}
          />

          <TextField
            label="Data de Nascimento *"
            name="dtNascimento"
            type="date"
            max="2010-01-01"
            value={formData.dtNascimento}
            onChange={handleChange}
            required
            error={dataError}
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
