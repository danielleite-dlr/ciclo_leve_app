import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import { aoMudarAssinatura, prepararCompras } from '@/services/compras';

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
  userId: string;
  plano: 'FREE' | 'MENSAL' | 'ANUAL';
  premium: boolean;
  emTeste: boolean;
  expiraEm: string | null;
  testeDisponivel: boolean;
  modulos: Record<ModuloId, boolean>;
  planos: PlanoInfo[];
  catalogoModulos: { id: ModuloId; nome: string; descricao: string }[];
  /** como vender: pela loja (chave publica do RevenueCat) ou simulado */
  compras?: { revenuecatAndroid: string | null; simulada: boolean };
};

type Ctx = {
  status: StatusAssinatura | null;
  refresh: () => Promise<StatusAssinatura | null>;
  /** true enquanto o status nao carregou, para nao bloquear a tela a toa */
  temModulo: (m: ModuloId) => boolean;
  abrirPlanos: (modulo?: ModuloId) => void;
  definir: (s: StatusAssinatura) => void;
  /** true quando da para assinar pelo Google Play neste aparelho */
  lojaDisponivel: boolean;
  /** pede ao backend o plano atualizado na loja (depois de comprar ou restaurar) */
  sincronizar: () => Promise<StatusAssinatura | null>;
};

const AssinaturaContext = createContext<Ctx | null>(null);

export function AssinaturaProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<StatusAssinatura | null>(null);
  const [lojaDisponivel, setLojaDisponivel] = useState(false);
  const premiumRef = useRef(false);
  premiumRef.current = !!status?.premium;

  const sincronizar = useCallback(async () => {
    try {
      const { data } = await api.post<StatusAssinatura>('/assinatura/sincronizar');
      setStatus(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  // Liga a loja para a usuaria assim que o status chega (a chave publica vem do backend)
  const chave = status?.compras?.revenuecatAndroid;
  const userId = status?.userId;
  useEffect(() => {
    if (!userId) return;
    let ativo = true;
    prepararCompras(chave, userId).then((ok) => ativo && setLojaDisponivel(ok));
    return () => {
      ativo = false;
    };
  }, [chave, userId]);

  // A loja confirmou uma assinatura que o backend ainda nao conhece (compra, renovacao, restauracao)
  useEffect(() => {
    aoMudarAssinatura((ativa) => {
      if (ativa && !premiumRef.current) sincronizar();
    });
    return () => aoMudarAssinatura(null);
  }, [sincronizar]);

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

  const value = useMemo(
    () => ({ status, refresh, temModulo, abrirPlanos, definir: setStatus, lojaDisponivel, sincronizar }),
    [status, refresh, temModulo, abrirPlanos, lojaDisponivel, sincronizar]
  );
  return <AssinaturaContext.Provider value={value}>{children}</AssinaturaContext.Provider>;
}

export function useAssinatura() {
  const ctx = useContext(AssinaturaContext);
  if (!ctx) throw new Error('useAssinatura precisa estar dentro de AssinaturaProvider');
  return ctx;
}

export const formatarPreco = (centavos: number) =>
  (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
