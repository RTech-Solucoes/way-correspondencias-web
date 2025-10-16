import { useState, useEffect } from 'react';
import { authClient } from '@/api/auth/client';
import { responsaveisClient } from '@/api/responsaveis/client';
import { perfilUtil } from '@/api/perfis/types';

export function useUserGestao() {
  const [userProfile, setUserProfile] = useState<{
    idPerfil: number | null;
    nmPerfil: string | null;
    loading: boolean;
  }>({
    idPerfil: null,
    nmPerfil: null,
    loading: true,
  });

  const isAdminOrGestor = userProfile.idPerfil === perfilUtil.ADMINISTRADOR || 
                         userProfile.idPerfil === perfilUtil.GESTOR_DO_SISTEMA;

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setUserProfile(prev => ({ ...prev, loading: true }));
        
        const idFromToken = authClient.getUserIdResponsavelFromToken();
        const userName = authClient.getUserName();
        
        if (!(idFromToken || userName)) {
          setUserProfile({ idPerfil: null, nmPerfil: null, loading: false });
          return;
        }

        const responsavel = idFromToken
          ? await responsaveisClient.buscarPorId(idFromToken)
          : await responsaveisClient.buscarPorNmUsuarioLogin(userName!);

        setUserProfile({
          idPerfil: responsavel.idPerfil,
          nmPerfil: responsavel.nmPerfil,
          loading: false,
        });
      } catch (error) {
        console.error('Erro ao carregar perfil do usuário:', error);
        setUserProfile({ idPerfil: null, nmPerfil: null, loading: false });
      }
    };

    loadUserProfile();
  }, []);

  return {
    ...userProfile,
    isAdminOrGestor,
  };
}
