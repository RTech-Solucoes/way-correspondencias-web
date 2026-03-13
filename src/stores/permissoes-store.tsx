import {create} from 'zustand'
import {createJSONStorage, persist} from 'zustand/middleware'
import {cookieStorage} from '@/utils/cookie-storage'

type PermissoesStore = {
  permissoes: string[]
  setPermissoes(permissoes: string[]): void
}

export const usePermissoesStore = create<PermissoesStore>()(
  persist(
    (set) => ({
      permissoes: [],
      setPermissoes: permissoes => set({ permissoes }),
    }),
    {
      name: 'permissoes-storage',
      storage: createJSONStorage(() => cookieStorage),
    },
  ),
)

export const usePermissoesState = () => usePermissoesStore(
  (state) => state.permissoes
)

export const useSetPermissoes = () => usePermissoesStore(
  (state) => state.setPermissoes
)
