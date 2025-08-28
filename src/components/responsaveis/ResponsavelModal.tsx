'use client';

import {useState, useEffect, ChangeEvent, useCallback} from 'react';
import {
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { MultiSelectAreas } from '@/components/ui/multi-select-areas';
import { ResponsavelResponse, ResponsavelRequest } from '@/api/responsaveis/types';
import { responsaveisClient } from '@/api/responsaveis/client';
import { PerfilResponse } from '@/api/perfis/types';
import { perfisClient } from '@/api/perfis/client';
import { toast } from 'sonner';

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
  const [loadingResponsavel, setLoadingResponsavel] = useState(false);
  const [perfis, setPerfis] = useState<PerfilResponse[]>([]);
  const [loadingPerfis, setLoadingPerfis] = useState(false);

  const buscarPerfis = useCallback(async () => {
    try {
      setLoadingPerfis(true);
      console.log('Carregando perfis...');
      const response = await perfisClient.buscarPorFiltro({ size: 100 });
      console.log('Perfis carregados:', response);
      const perfisAtivos = response.content.filter(perfil => perfil.flAtivo === 'S');
      console.log('Perfis ativos:', perfisAtivos);
      setPerfis(perfisAtivos);
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
      toast.error("Erro ao carregar perfis");
      setPerfis([]);
    } finally {
      setLoadingPerfis(false);
    }
  }, []);

  const buscarResponsavelComAreas = useCallback(async (idResponsavel: number) => {
    try {
      setLoadingResponsavel(true);
      console.log('Buscando responsável com áreas para ID:', idResponsavel);
      const responsavelComAreas = await responsaveisClient.buscarPorIdComAreas(idResponsavel);
      console.log('Responsável carregado:', responsavelComAreas);
      console.log('ID do perfil do responsável:', responsavelComAreas.idPerfil);

      const newFormData = {
        idPerfil: responsavelComAreas.idPerfil,
        nmUsuarioLogin: responsavelComAreas.nmUsuarioLogin,
        nmResponsavel: responsavelComAreas.nmResponsavel,
        dsEmail: responsavelComAreas.dsEmail,
        nrCpf: responsavelComAreas.nrCpf || '',
        dtNascimento: responsavelComAreas.dtNascimento || '',
        idsAreas: responsavelComAreas.areas ? responsavelComAreas.areas.map(responsavelArea => responsavelArea.area.idArea) : []
      };

      console.log('Atualizando formData com:', newFormData);
      setFormData(newFormData);

      if (responsavelComAreas.areas && responsavelComAreas.areas.length > 0) {
        setSelectedAreaIds(responsavelComAreas.areas.map(responsavelArea => responsavelArea.area.idArea));
      } else {
        setSelectedAreaIds([]);
      }
    } catch (error) {
      console.error('Erro ao buscar responsável:', error);
      toast.error("Erro ao carregar responsável");

      // Fallback: usar os dados básicos do responsável se a busca com áreas falhar
      if (responsavel) {
        console.log('Usando fallback com dados básicos do responsável:', responsavel);
        console.log('ID do perfil do responsável (fallback):', responsavel.idPerfil);

        const fallbackFormData = {
          idPerfil: responsavel.idPerfil,
          nmUsuarioLogin: responsavel.nmUsuarioLogin,
          nmResponsavel: responsavel.nmResponsavel,
          dsEmail: responsavel.dsEmail,
          nrCpf: responsavel.nrCpf || '',
          dtNascimento: responsavel.dtNascimento || '',
          idsAreas: responsavel.areas ? responsavel.areas.map(responsavelArea => responsavelArea.area.idArea) : []
        };

        console.log('Atualizando formData com fallback:', fallbackFormData);
        setFormData(fallbackFormData);

        if (responsavel.areas && responsavel.areas.length > 0) {
          setSelectedAreaIds(responsavel.areas.map(responsavelArea => responsavelArea.area.idArea));
        } else {
          setSelectedAreaIds([]);
        }
      }
    } finally {
      setLoadingResponsavel(false);
    }
  }, [responsavel]);

  useEffect(() => {
    if (open) {
      buscarPerfis();
    }
  }, [open, buscarPerfis]);

  useEffect(() => {
    if (open && perfis.length > 0) {
      if (responsavel) {
        buscarResponsavelComAreas(responsavel.idResponsavel);
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
  }, [open, responsavel, perfis.length, buscarResponsavelComAreas]);

  // Debug useEffect to monitor formData changes
  useEffect(() => {
    console.log('FormData atualizado:', formData);
    console.log('Perfil ID atual no formData:', formData.idPerfil);
    console.log('Perfis disponíveis:', perfis);
  }, [formData, perfis]);

  const handleChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'idPerfil' ? parseInt(value) || 1 :
              value
    }));
  };

  const handleAreasSelectionChange = useCallback((selectedIds: number[]) => {
    setSelectedAreaIds(selectedIds);
    setFormData(prev => ({
      ...prev,
      idsAreas: selectedIds
    }));
  }, []);

  const handleSubmit = async () => {

    try {
      console.log("teste")
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
           formData.dtNascimento.trim() !== '' &&
           formData.idPerfil > 0;
  }, [formData]);

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
            placeholder="000.000.000-00"
            maxLength={11}
            required
          />

          <TextField
            label="Data de Nascimento *"
            name="dtNascimento"
            type="date"
            value={formData.dtNascimento}
            onChange={handleChange}
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

          <MultiSelectAreas
            selectedAreaIds={selectedAreaIds}
            onSelectionChange={handleAreasSelectionChange}
            label="Áreas"
            disabled={loadingResponsavel}
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
