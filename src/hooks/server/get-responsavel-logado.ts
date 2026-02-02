import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import { responsaveisClient } from "@/api/responsaveis/client";

// Função para obter idResponsavel no servidor (Server Components/Actions)
export async function getServerIdResponsavel(): Promise<number | null> {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken')?.value;
    
    if (!authToken) return null;
    
    const payload = jwtDecode<Record<string, unknown>>(authToken);
    const raw = (payload['idResponsavel'] ?? payload['userId'] ?? payload['sub']) as unknown;
    
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string') {
      const n = parseInt(raw, 10);
      return isNaN(n) ? null : n;
    }
    return null;
  } catch {
    return null;
  }
}

// Função para obter o responsável logado no servidor (com perfil)
export async function getServerResponsavelLogado() {
  try {
    const idResponsavel = await getServerIdResponsavel();
    if (!idResponsavel) return null;
    
    return await responsaveisClient.buscarPorId(idResponsavel);
  } catch {
    return null;
  }
}
