import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import api from '@/services/api';

// Plano da usuaria e modulos liberados. A regra fica no backend (GET /assinatura);
// aqui so guardamos o resultado para as telas decidirem o que mostrar.

export type ModuloId = 'RELATORIO' | 'HISTORICO_COMPLETO' | 'DICAS_ADAPTADAS' | 'FERTILIDADE' | 'BIBLIOTECA';

export type PlanoInfo = {
  id: 'MENSAL' | 'ANUAL';
  nome: string;
  precoCentavos: number;
  periodo: 'mes' | 'ano';
  testeDias: number;
};

export type StatusAssinatura = {
  plano: 'FREE' | 'MENSAL' | 'ANUAL';
  premium: boolean;
  emTeste: boolean;
  expiraEm: string | null;
  testeDisponivel: boolean;
  modulos: Record<ModuloId, boolean>;
  planos: PlanoInfo[];
  catalogoModulos: { id: ModuloId; nome: string; descricao: string }[];
};

type Ctx = {
  status: StatusAssinatura | null;
  refresh: () => Promise<StatusAssinatura | null>;
  /** true enquanto o status nao carregou, para nao bloquear a tela a toa */
  temModulo: (m: ModuloId) => boolean;
  abrirPlanos: (modulo?: ModuloId) => void;
  definir: (s: StatusAssinatura) => void;
};

const AssinaturaContext = createContext<Ctx | null>(null);

export function AssinaturaProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<StatusAssinatura | null>(null);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get<StatusAssinatura>('/assinatura');
      setStatus(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  const temModulo = useCallback((m: ModuloId) => (status ? !!status.modulos?.[m] : true), [status]);

  const abrirPlanos = useCallback(
    (modulo?: ModuloId) => router.push({ pathname: '/(app)/planos', params: modulo ? { modulo } : {} }),
    [router]
  );

  const value = useMemo(() => ({ status, refresh, temModulo, abrirPlanos, definir: setStatus }), [status, refresh, temModulo, abrirPlanos]);
  return <AssinaturaContext.Provider value={value}>{children}</AssinaturaContext.Provider>;
}

export function useAssinatura() {
  const ctx = useContext(AssinaturaContext);
  if (!ctx) throw new Error('useAssinatura precisa estar dentro de AssinaturaProvider');
  return ctx;
}

export const formatarPreco = (centavos: number) =>
  (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
