import { timingSafeEqual } from 'crypto';

// Integracao com o RevenueCat, que valida as compras feitas no Google Play (e depois na App Store).
// O app compra pela loja; aqui consultamos o RevenueCat para saber o plano vigente da usuaria.
// O app_user_id no RevenueCat e o id da usuaria no nosso banco.

const API = 'https://api.revenuecat.com/v1';
export const ENTITLEMENT = process.env.REVENUECAT_ENTITLEMENT || 'premium';

type Entitlement = { expires_date: string | null; product_identifier: string };
type Assinatura = { period_type?: string; expires_date?: string | null };
type Subscriber = {
  entitlements: Record<string, Entitlement>;
  subscriptions: Record<string, Assinatura>;
};

export type PlanoLoja = {
  ativo: boolean;
  plano: 'MENSAL' | 'ANUAL';
  expiraEm: Date | null;
  emTeste: boolean;
  /** ja usou um teste gratis em alguma assinatura */
  usouTeste: boolean;
};

export function revenuecatConfigurado() {
  return !!process.env.REVENUECAT_SECRET_KEY;
}

/** Plano vigente segundo o RevenueCat. */
export async function consultarPlano(userId: string): Promise<PlanoLoja> {
  const chave = process.env.REVENUECAT_SECRET_KEY;
  if (!chave) throw new Error('RevenueCat não configurado');

  const res = await fetch(`${API}/subscribers/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`RevenueCat respondeu ${res.status}`);
  const { subscriber } = (await res.json()) as { subscriber: Subscriber };

  const ent = subscriber.entitlements?.[ENTITLEMENT];
  const expiraEm = ent?.expires_date ? new Date(ent.expires_date) : null;
  const ativo = !!ent && (!expiraEm || expiraEm > new Date());
  const assinatura = ent ? subscriber.subscriptions?.[ent.product_identifier] : undefined;
  const usouTeste = Object.values(subscriber.subscriptions ?? {}).some((s) => s.period_type === 'trial');

  return {
    ativo,
    // No Google o produto vem como "premium:anual" ou "premium:mensal"
    plano: /anual|annual|year/i.test(ent?.product_identifier ?? '') ? 'ANUAL' : 'MENSAL',
    expiraEm,
    emTeste: ativo && assinatura?.period_type === 'trial',
    usouTeste,
  };
}

/** Apaga a usuaria no RevenueCat (exclusao de conta). Nao cancela a assinatura na loja. */
export async function apagarCliente(userId: string) {
  const chave = process.env.REVENUECAT_SECRET_KEY;
  if (!chave) return;
  const res = await fetch(`${API}/subscribers/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${chave}` },
  });
  if (!res.ok && res.status !== 404) throw new Error(`RevenueCat respondeu ${res.status}`);
}

/** Confere o cabecalho Authorization que configuramos no webhook do RevenueCat. */
export function webhookAutorizado(cabecalho: string | undefined) {
  const esperado = process.env.REVENUECAT_WEBHOOK_AUTH;
  if (!esperado || !cabecalho) return false;
  const a = Buffer.from(cabecalho);
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}
